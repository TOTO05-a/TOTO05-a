// Actualiza la parte "viva" del README: actividad de los últimos 7 días,
// último commit público y repos actualizados hace poco.
// Uso: GH_TOKEN=... node scripts/live.mjs   (en GitHub Actions usa GITHUB_TOKEN)
// Solo publica datos de repos públicos; de los privados solo cuenta contribuciones.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const USER = "TOTO05-a";
const SKIP = new Set(["TOTO05-a", "toto05-a.github.io"]);
const TZ = "America/Guatemala";
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
if (!token) throw new Error("Falta GH_TOKEN");

const headers = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "User-Agent": "profile-live" };
async function api(path, init = {}) {
  const res = await fetch(`https://api.github.com${path}`, { headers, ...init });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/`/g, "'").replace(/\|/g, "\\|");
const fecha = (iso) => new Date(iso).toLocaleDateString("es-GT", { day: "numeric", month: "short", timeZone: TZ }).replace(".", "");

// 1) Contribuciones por día (incluye privadas solo si el perfil las muestra).
const gql = await api("/graphql", {
  method: "POST",
  body: JSON.stringify({ query: `{user(login:"${USER}"){contributionsCollection{contributionCalendar{weeks{contributionDays{date contributionCount}}}}}}` }),
});
const days = gql.data.user.contributionsCollection.contributionCalendar.weeks.flatMap((w) => w.contributionDays);
const today = new Date().toLocaleDateString("en-CA", { timeZone: TZ });
const upToToday = days.filter((d) => d.date <= today);
const week = upToToday.slice(-7);
const sum = (arr) => arr.reduce((n, d) => n + d.contributionCount, 0);
const total7 = sum(week);
const total30 = sum(upToToday.slice(-30));

// 2) Último commit público (sin merges).
const search = await api(`/search/commits?q=author:${USER}&sort=author-date&order=desc&per_page=100`);
const last = search.items.find((c) => !c.repository.private && !SKIP.has(c.repository.name) && !/^Merge /.test(c.commit.message));

// 3) Repos públicos actualizados hace poco.
const repos = (await api(`/users/${USER}/repos?sort=pushed&per_page=30&type=owner`))
  .filter((r) => !r.fork && !r.archived && !r.private && !SKIP.has(r.name))
  .slice(0, 3);

// Gráfico de barras, claro y oscuro.
const palettes = {
  dark: { bar: "#14b8a6", empty: "#1e293b", text: "#94a3b8", value: "#e2e8f0", line: "#30363d" },
  light: { bar: "#0f766e", empty: "#e2e8f0", text: "#59636e", value: "#1f2328", line: "#d1d9e0" },
};
const max = Math.max(1, ...week.map((d) => d.contributionCount));
const dia = (date) => new Date(`${date}T12:00:00Z`).toLocaleDateString("es", { weekday: "short", timeZone: "UTC" }).replace(".", "");
function chart(p) {
  const bars = week.map((d, i) => {
    const x = 30 + i * 55;
    const h = d.contributionCount ? Math.max(4, Math.round((d.contributionCount / max) * 80)) : 2;
    const y = 100 - h;
    return `<rect x="${x}" y="${y}" width="34" height="${h}" rx="3" fill="${d.contributionCount ? p.bar : p.empty}"/>` +
      (d.contributionCount ? `<text x="${x + 17}" y="${y - 6}" text-anchor="middle" fill="${p.value}">${d.contributionCount}</text>` : "") +
      `<text x="${x + 17}" y="118" text-anchor="middle" fill="${p.text}">${dia(d.date)}</text>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 126" width="420" height="126" role="img" aria-label="Contribuciones por día: ${week.map((d) => d.contributionCount).join(", ")}"><style>text{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:11px}</style><line x1="20" y1="100.5" x2="410" y2="100.5" stroke="${p.line}"/>${bars}</svg>\n`;
}
mkdirSync("assets", { recursive: true });
for (const [name, p] of Object.entries(palettes)) writeFileSync(`assets/activity-${name}.svg`, chart(p));

// Bloques del README.
const hoy = fecha(new Date().toISOString());
const contribs = (n) => `${n} ${n === 1 ? "contribución" : "contribuciones"}`;
const status = `<p align="center"><sub>🟢 <b>${contribs(total7)}</b> en los últimos 7 días · ${total30} en los últimos 30 · actualizado el ${hoy}</sub></p>`;

const lines = [
  `<picture>`,
  `  <source media="(prefers-color-scheme: dark)" srcset="assets/activity-dark.svg">`,
  `  <img src="assets/activity-light.svg" width="420" alt="Contribuciones por día en los últimos 7 días">`,
  `</picture>`,
  ``,
];
if (last) {
  const msg = esc(last.commit.message.split("\n")[0]).slice(0, 110);
  lines.push(`**Último commit público:** \`${msg}\` en [${last.repository.name}](${last.html_url}) · ${fecha(last.commit.author.date)}`, ``);
}
if (repos.length) {
  lines.push(`**Actualizado hace poco:**`, ...repos.map((r) => `- [${r.name}](${r.html_url})${r.description ? ` · ${esc(r.description)}` : ""}`));
}
const live = lines.join("\n");

let readme = readFileSync("README.md", "utf8");
const put = (key, body) => {
  const re = new RegExp(`(<!-- ${key}:start -->)[\\s\\S]*?(<!-- ${key}:end -->)`);
  if (!re.test(readme)) throw new Error(`Falta el marcador ${key} en el README`);
  readme = readme.replace(re, `$1\n${body}\n$2`);
};
put("status", status);
put("live", live);
writeFileSync("README.md", readme);
console.log(`7 días: ${total7} · 30 días: ${total30} · último: ${last?.repository.name ?? "-"} · repos: ${repos.map((r) => r.name).join(", ")}`);
