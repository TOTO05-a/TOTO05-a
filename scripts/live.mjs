// Actualiza la parte "viva" del README cada noche:
// - assets/commits-{dark,light}.svg: tu nombre escrito sobre tu gráfico real de contribuciones
// - la línea de estado y las notas de la edición (último commit público, repos recientes)
// Uso: GH_TOKEN=... node scripts/live.mjs   (en GitHub Actions usa GITHUB_TOKEN)
// Solo publica datos de repos públicos; de los privados solo cuenta contribuciones.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const USER = "TOTO05-a";
const WORD = "EDUARDO";
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

// 1) Calendario de contribuciones del último año (privadas solo si el perfil las muestra).
const gql = await api("/graphql", {
  method: "POST",
  body: JSON.stringify({ query: `{user(login:"${USER}"){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount contributionLevel}}}}}}` }),
});
const cal = gql.data.user.contributionsCollection.contributionCalendar;
const weeks = cal.weeks;
const days = weeks.flatMap((w) => w.contributionDays);
const today = new Date().toLocaleDateString("en-CA", { timeZone: TZ });
const upToToday = days.filter((d) => d.date <= today);
const sum = (arr) => arr.reduce((n, d) => n + d.contributionCount, 0);
const total7 = sum(upToToday.slice(-7));
const totalYear = cal.totalContributions;

// 2) Último commit público (sin merges) y repos públicos recientes.
const search = await api(`/search/commits?q=author:${USER}&sort=author-date&order=desc&per_page=100`);
const last = search.items.find((c) => !c.repository.private && !SKIP.has(c.repository.name) && !/^Merge /.test(c.commit.message));
const repos = (await api(`/users/${USER}/repos?sort=pushed&per_page=30&type=owner`))
  .filter((r) => !r.fork && !r.archived && !r.private && !SKIP.has(r.name))
  .slice(0, 3);

// 3) Cuadrícula: el fondo son tus contribuciones reales en tonos apagados;
//    las letras del nombre se encienden en verde, columna por columna.
const GLYPHS = {
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
};
const LEVEL = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };
const cols = weeks.length;
const wordCols = WORD.length * 6 - 1;
const start = Math.max(0, Math.floor((cols - wordCols) / 2));
const lit = new Set();
[...WORD].forEach((ch, i) => GLYPHS[ch].forEach((row, r) => [...row].forEach((bit, c) => bit === "1" && lit.add(`${start + i * 6 + c},${r}`))));

const palettes = {
  dark: { bg: ["#161b22", "#1b2b2c", "#1f3a39", "#244a47", "#2a5b55"], on: ["#26a641", "#39d353"], text: "#8d96a0" },
  light: { bg: ["#ebedf0", "#dce9e5", "#cde0da", "#bdd6cf", "#adcdc3"], on: ["#30a14e", "#216e39"], text: "#59636e" },
};
const CELL = 13, GAP = 3, STEP = CELL + GAP, OX = 0, OY = 22;
const width = cols * STEP - GAP, height = OY + 7 * STEP - GAP;
const mes = (date) => new Date(`${date}T12:00:00Z`).toLocaleDateString("es", { month: "short", timeZone: "UTC" }).replace(".", "");
function grid(p) {
  let cells = "", labels = "", prevMonth = "";
  weeks.forEach((w, c) => {
    const first = w.contributionDays[0];
    const m = mes(first.date);
    if (m !== prevMonth && c < cols - 2) { labels += `<text x="${OX + c * STEP}" y="12">${m}</text>`; prevMonth = m; }
    // La primera semana puede empezar a mitad: se alinea por día de la semana.
    const offset = c === 0 ? 7 - w.contributionDays.length : 0;
    w.contributionDays.forEach((d, i) => {
      const r = i + offset, x = OX + c * STEP, y = OY + r * STEP;
      if (lit.has(`${c},${r}`)) {
        const delay = (0.2 + (c - start) * 0.04 + r * 0.012).toFixed(2);
        cells += `<rect class="on" style="animation-delay:${delay}s" x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="3" fill="${p.on[(c + r) % 2]}"/>`;
      } else {
        cells += `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="3" fill="${p.bg[LEVEL[d.contributionLevel] ?? 0]}"/>`;
      }
    });
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="La palabra ${WORD} escrita con los cuadros del gráfico de contribuciones, sobre ${totalYear} contribuciones reales del último año">
<style>text{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:11px;fill:${p.text}}.on{transform-box:fill-box;transform-origin:center;animation:pop .35s ease-out both}@keyframes pop{from{opacity:0;transform:scale(.3)}}@media (prefers-reduced-motion:reduce){.on{animation:none}}</style>
${labels}${cells}
</svg>
`;
}
mkdirSync("assets", { recursive: true });
for (const [name, p] of Object.entries(palettes)) writeFileSync(`assets/commits-${name}.svg`, grid(p));

// 4) Bloques del README.
const hoy = fecha(new Date().toISOString());
const contribs = (n) => `${n} ${n === 1 ? "contribución" : "contribuciones"}`;
const v = today.replace(/-/g, "");
const status = `<p align="center"><sub>EDICIÓN DEL ${hoy.toUpperCase()} · ${contribs(total7)} esta semana · ${contribs(totalYear)} en el último año</sub></p>`;

const lines = [
  `<picture>`,
  `  <source media="(prefers-color-scheme: dark)" srcset="assets/commits-dark.svg?v=${v}">`,
  `  <img src="assets/commits-light.svg?v=${v}" width="100%" alt="La palabra ${WORD} escrita con los cuadros del gráfico de contribuciones">`,
  `</picture>`,
  ``,
  `<sub>De fondo, mis ${contribs(totalYear)} reales del último año. Las letras se encienden encima.</sub>`,
  ``,
];
if (last) {
  const msg = esc(last.commit.message.split("\n")[0]).slice(0, 110);
  lines.push(`**Último commit público:** \`${msg}\` en [${last.repository.name}](${last.html_url}) · ${fecha(last.commit.author.date)}`, ``);
}
if (repos.length) {
  lines.push(`**Actualizado hace poco:** ${repos.map((r) => `[${r.name}](${r.html_url})`).join(" · ")}`);
}

let readme = readFileSync("README.md", "utf8");
const put = (key, body) => {
  const re = new RegExp(`(<!-- ${key}:start -->)[\\s\\S]*?(<!-- ${key}:end -->)`);
  if (!re.test(readme)) throw new Error(`Falta el marcador ${key} en el README`);
  readme = readme.replace(re, `$1\n${body}\n$2`);
};
put("status", status);
put("live", lines.join("\n"));
writeFileSync("README.md", readme);
console.log(`semana: ${total7} · año: ${totalYear} · columnas: ${cols} · último: ${last?.repository.name ?? "-"} · repos: ${repos.map((r) => r.name).join(", ")}`);
