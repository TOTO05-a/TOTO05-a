// Genera las imágenes fijas del perfil en estilo constelación:
//   assets/banner.svg                      cielo con habilidades conectadas y tu nombre
//   assets/card-<repo>.svg                 tarjeta de cada proyecto destacado
//   assets/tools.svg                       herramientas por área
//   assets/section-*-{dark,light}.svg      títulos de sección
//   assets/footer-{dark,light}.svg         cierre
// Los textos grandes se convierten en trazos (Space Grotesk, OFL) para verse iguales en
// cualquier navegador. Las animaciones mueven solo grupos con transform u opacity,
// que el navegador acelera sin trabarse.
// Tamaños pensados para leerse aunque GitHub muestre la imagen a la mitad de su ancho.
// Uso: npm install && node scripts/banner.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import opentype from "opentype.js";

const buf = readFileSync("node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff");
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const textPath = (text, x, y, size) => font.getPath(text, x, y, size, { kerning: true }).toPathData(1);
const textWidth = (text, size) => font.getAdvanceWidth(text, size, { kerning: true });

let seed = 23;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const MONO = `font-family:ui-monospace,SFMono-Regular,Consolas,'Liberation Mono',Menlo,monospace`;
const SANS = `font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif`;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const STAR = (x, y, s) => `M${x} ${y - s}L${x + s * 0.28} ${y - s * 0.28}L${x + s} ${y}L${x + s * 0.28} ${y + s * 0.28}L${x} ${y + s}L${x - s * 0.28} ${y + s * 0.28}L${x - s} ${y}L${x - s * 0.28} ${y - s * 0.28}Z`;
const SKY = `<radialGradient id="sky" cx="50%" cy="50%" r="75%"><stop offset="0" stop-color="#0d1a3a"/><stop offset="1" stop-color="#050816"/></radialGradient>`;
const TWINKLE = `.tw{animation:tw ease-in-out infinite alternate}@keyframes tw{from{opacity:.25}to{opacity:1}}@media (prefers-reduced-motion:reduce){.tw{animation:none}}`;

// Estrellas de fondo repartidas en tres grupos que titilan a ritmos distintos.
function starfield(w, h, count) {
  const g = [[], [], []];
  for (let i = 0; i < count; i++) g[i % 3].push(`<circle cx="${(rnd() * w).toFixed(1)}" cy="${(rnd() * h).toFixed(1)}" r="${(rnd() * 1.1 + 0.35).toFixed(2)}"/>`);
  return `<g fill="#cbd5e1"><g class="tw" style="animation-duration:3.2s">${g[0].join("")}</g><g class="tw" style="animation-duration:4.7s;animation-delay:-2s">${g[1].join("")}</g><g class="tw" style="animation-duration:6.1s;animation-delay:-4s">${g[2].join("")}</g></g>`;
}

// ---------- Banner ----------
const W = 920, H = 340, CX = 460, CY = 168, RX = 290, RY = 96;
const NAME = "Eduardo Antonio Cruz Bolaños";
const NODES = [
  ["TypeScript", 150, 62, "up"], ["RAG", 460, 46, "up"], ["Python", 770, 62, "up"],
  ["React", 84, 170, "down"], ["agentes de voz", 828, 170, "down"],
  ["PostgreSQL", 175, 280, "down"], ["Docker", 460, 292, "down"], ["n8n", 745, 280, "down"],
];
const LINKS = [[0, 1], [1, 2], [2, 4], [4, 7], [7, 6], [6, 5], [5, 3], [3, 0]];
const onOrbit = (x, y) => {
  const a = Math.atan2((y - CY) / RY, (x - CX) / RX);
  return [CX + RX * Math.cos(a), CY + RY * Math.sin(a)];
};
function banner() {
  const nameSize = 40, nameW = textWidth(NAME, nameSize);
  const nodes = NODES.map(([label, x, y, side], i) => {
    const [ox, oy] = onOrbit(x, y);
    const dx = ((rnd() - 0.5) * 12).toFixed(1), dy = ((rnd() - 0.5) * 8).toFixed(1);
    const dur = (6 + rnd() * 4).toFixed(1);
    return `<g class="drift" style="--dx:${dx}px;--dy:${dy}px;animation-duration:${dur}s;animation-delay:-${(i * 0.8).toFixed(1)}s">
      <line x1="${x}" y1="${y}" x2="${ox.toFixed(1)}" y2="${oy.toFixed(1)}" stroke="#1e3a8a" stroke-width="1.2"/>
      <circle cx="${x}" cy="${y}" r="11" fill="none" stroke="#38bdf8" stroke-opacity=".35"/>
      <circle cx="${x}" cy="${y}" r="4.5" fill="#38bdf8"/>
      <text x="${x}" y="${side === "up" ? y - 19 : y + 32}" text-anchor="middle" style="${MONO};font-size:18px;font-weight:700" fill="#bae6fd">${label}</text>
    </g>`;
  }).join("\n  ");
  const links = LINKS.map(([a, b]) => `<line x1="${NODES[a][1]}" y1="${NODES[a][2]}" x2="${NODES[b][1]}" y2="${NODES[b][2]}"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${NAME}, desarrollador full stack, al centro de una constelación: TypeScript, Python, React, PostgreSQL, RAG, agentes de voz, n8n y Docker.">
  <defs>${SKY}
    <linearGradient id="tail" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e0f2fe"/><stop offset="1" stop-color="#e0f2fe" stop-opacity="0"/></linearGradient>
    <path id="orbit" d="M${CX - RX} ${CY} a${RX} ${RY} 0 1 0 ${2 * RX} 0 a${RX} ${RY} 0 1 0 -${2 * RX} 0"/>
  </defs>
  <style>${TWINKLE}
    .drift{animation:drift ease-in-out infinite alternate}@keyframes drift{to{transform:translate(var(--dx),var(--dy))}}
    .orbit{animation:flow 30s linear infinite}@keyframes flow{to{stroke-dashoffset:-400}}
    .shoot{animation:shoot 9s ease-in infinite;opacity:0}
    @keyframes shoot{0%{transform:translate(900px,10px);opacity:0}2%{opacity:1}11%{transform:translate(560px,170px);opacity:0}100%{transform:translate(560px,170px);opacity:0}}
    @media (prefers-reduced-motion:reduce){.drift,.orbit{animation:none}.shoot{display:none}}
  </style>
  <rect width="${W}" height="${H}" rx="14" fill="url(#sky)"/>
  ${starfield(W, H, 84)}
  <g class="shoot"><line x1="0" y1="0" x2="80" y2="-38" stroke="url(#tail)" stroke-width="1.6" stroke-linecap="round"/><circle r="1.8" fill="#f0f9ff"/></g>
  <g stroke="#1e3a8a" stroke-width="1" stroke-dasharray="3 5">${links}</g>
  <use href="#orbit" class="orbit" fill="none" stroke="#38bdf8" stroke-opacity=".3" stroke-width="1.2" stroke-dasharray="2 8"/>
  <circle r="3.5" fill="#7dd3fc"><animateMotion dur="24s" repeatCount="indefinite"><mpath href="#orbit"/></animateMotion></circle>
  ${nodes}
  <path d="${textPath(NAME, CX - nameW / 2, CY - 2, nameSize)}" fill="#f8fafc"/>
  <text x="${CX}" y="${CY + 32}" text-anchor="middle" style="${MONO};font-size:16px;letter-spacing:3px;font-weight:700" fill="#7dd3fc">CONECTO DATOS, CÓDIGO E IA</text>
</svg>
`;
}

// ---------- Tarjetas de proyecto ----------
const PROJECTS = [
  { repo: "roofing-business-platform", desc: "Sitio bilingüe y plataforma interna para una empresa de techos: portal de clientes, empleados y administración, CRM y presupuestos en PDF.", stack: "TypeScript · React · Astro · Express · PostgreSQL · Docker" },
  { repo: "ruta-ia", desc: "Orientación académica que recomienda cursos de un catálogo real con RAG y muestra la fuente de cada respuesta.", stack: "RAG · Qdrant · n8n · PostgreSQL · Docker" },
  { repo: "rag-grafo-finetuning", desc: "Convierte documentos en un grafo de conocimiento que se puede explorar y consultar con distintas estrategias de IA.", stack: "Node.js · MongoDB · RAG · grafos" },
  { repo: "applications-api", desc: "API de candidatos, vacantes y postulaciones con arquitectura por capas y validación con Zod. En desarrollo.", stack: "Express · PostgreSQL · Zod" },
];
// Corta el texto en líneas que quepan en el ancho dado (aprox. 0.52 em por carácter).
function wrap(text, size, width) {
  const max = Math.floor(width / (size * 0.52)), lines = [];
  let line = "";
  for (const word of text.split(" ")) {
    if ((line + " " + word).trim().length > max) { lines.push(line.trim()); line = word; } else line += " " + word;
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}
function card({ repo, desc, stack }, i) {
  const lines = wrap(desc, 19, 680).slice(0, 3);
  const CW = 920, CH = 96 + (lines.length - 1) * 27 + 62;
  // Pequeña constelación a la derecha, distinta en cada tarjeta.
  const pts = Array.from({ length: 4 }, () => [Math.round(760 + rnd() * 120), Math.round(36 + rnd() * 118)]);
  const cluster = `<polyline points="${pts.map((p) => p.join(",")).join(" ")}" fill="none" stroke="#1e3a8a" stroke-width="1.2"/>` +
    pts.map(([x, y], k) => `<circle cx="${x}" cy="${y}" r="${k === 0 ? 4 : 2.6}" fill="${k === 0 ? "#7dd3fc" : "#38bdf8"}"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CW} ${CH}" width="${CW}" height="${CH}" role="img" aria-label="${repo}: ${esc(desc)}">
  <defs>${SKY}</defs><style>${TWINKLE}</style>
  <rect x="1" y="1" width="${CW - 2}" height="${CH - 2}" rx="14" fill="url(#sky)" stroke="#1e3a8a" stroke-width="1.5"/>
  ${starfield(CW, CH, 26)}
  ${cluster}
  <path d="${STAR(44, 46, 10)}" fill="#7dd3fc"/>
  <path d="${textPath(repo, 66, 58, 32)}" fill="#f8fafc"/>
  ${lines.map((l, k) => `<text x="36" y="${96 + k * 27}" style="${SANS};font-size:19px" fill="#cbd5e1">${esc(l)}</text>`).join("")}
  <text x="36" y="${CH - 20}" style="${MONO};font-size:15px;font-weight:700" fill="#7dd3fc">${esc(stack)}</text>
</svg>
`;
}

// ---------- Herramientas ----------
const TOOLS = [
  ["LENGUAJES", "TypeScript · JavaScript · Python"],
  ["BACKEND", "Node.js · Express · Prisma · Zod"],
  ["FRONTEND", "React · Astro · Tailwind"],
  ["DATOS E IA", "PostgreSQL · MongoDB · Qdrant · RAG · n8n"],
  ["CALIDAD", "Jest · Vitest · Playwright · Docker · Git"],
];
function tools() {
  const TW = 920, TH = 56 + TOOLS.length * 50;
  const rows = TOOLS.map(([area, list], i) => {
    const y = 64 + i * 50;
    return `<path d="${STAR(44, y - 7, 7)}" fill="#7dd3fc"/>
  <text x="62" y="${y}" style="${MONO};font-size:15px;letter-spacing:2px;font-weight:700" fill="#7dd3fc">${area}</text>
  <text x="250" y="${y}" style="${SANS};font-size:21px" fill="#e2e8f0">${list}</text>`;
  }).join("\n  ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TW} ${TH}" width="${TW}" height="${TH}" role="img" aria-label="Herramientas: ${TOOLS.map(([a, l]) => `${a.toLowerCase()}, ${l}`).join("; ")}">
  <defs>${SKY}</defs><style>${TWINKLE}</style>
  <rect x="1" y="1" width="${TW - 2}" height="${TH - 2}" rx="14" fill="url(#sky)" stroke="#1e3a8a" stroke-width="1.5"/>
  ${starfield(TW, TH, 34)}
  <line x1="44" y1="57" x2="44" y2="${64 + (TOOLS.length - 1) * 50 - 7}" stroke="#1e3a8a" stroke-width="1.2" stroke-dasharray="3 5"/>
  ${rows}
</svg>
`;
}

// ---------- Títulos de sección y cierre (sobre el fondo de GitHub) ----------
const SECTIONS = { proyectos: "Proyectos", commits: "Un año en commits", herramientas: "Herramientas", contacto: "Contacto" };
const pageThemes = {
  dark: { ink: "#e6edf3", accent: "#7dd3fc", muted: "#8d96a0", line: "#30363d" },
  light: { ink: "#1f2328", accent: "#0369a1", muted: "#59636e", line: "#d1d9e0" },
};
const constellationLine = (y, bright, c) => {
  const xs = [4, 150, 330, 520, 700, 916];
  return `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${c.line}" stroke-width="1.5"/>` +
    xs.map((x, i) => `<circle cx="${x}" cy="${y}" r="${i === bright ? 4 : 2.6}" fill="${i === bright ? c.accent : c.muted}"/>`).join("");
};
const section = (label, i, c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 88" width="${W}" height="88" role="img" aria-label="${label}">
  <path d="${STAR(16, 40, 14)}" fill="${c.accent}"/>
  <path d="${textPath(label, 44, 56, 46)}" fill="${c.ink}"/>
  ${constellationLine(78, [1, 3, 2, 4][i % 4], c)}
</svg>
`;
const footer = (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 70" width="${W}" height="70" role="img" aria-label="Fin del mapa">
  ${constellationLine(12, 5, c)}
  <text x="0" y="52" style="${MONO};font-size:18px;letter-spacing:3px;font-weight:700" fill="${c.accent}">FIN DEL MAPA</text>
  <text x="${W}" y="52" text-anchor="end" style="${MONO};font-size:18px;letter-spacing:1px" fill="${c.muted}">14.6349° N · 90.5069° O</text>
</svg>
`;

mkdirSync("assets", { recursive: true });
writeFileSync("assets/banner.svg", banner());
PROJECTS.forEach((p, i) => writeFileSync(`assets/card-${p.repo}.svg`, card(p, i)));
writeFileSync("assets/tools.svg", tools());
for (const [name, c] of Object.entries(pageThemes)) {
  Object.entries(SECTIONS).forEach(([key, label], i) => writeFileSync(`assets/section-${key}-${name}.svg`, section(label, i, c)));
  writeFileSync(`assets/footer-${name}.svg`, footer(c));
}
console.log("banner, tarjetas, herramientas, secciones y cierre listos");
