// Genera las imágenes fijas del perfil en estilo constelación:
//   assets/banner.svg                      cielo con habilidades conectadas y tu nombre
//   assets/section-*-{dark,light}.svg      títulos de sección
//   assets/footer-{dark,light}.svg         cierre
// El nombre y los títulos se convierten en trazos (Space Grotesk, OFL) para verse
// iguales en cualquier navegador. Las animaciones mueven solo grupos con transform
// u opacity, que el navegador acelera sin trabarse.
// Uso: npm install && node scripts/banner.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import opentype from "opentype.js";

const buf = readFileSync("node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff");
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const textPath = (text, x, y, size) => font.getPath(text, x, y, size, { kerning: true }).toPathData(1);
const textWidth = (text, size) => font.getAdvanceWidth(text, size, { kerning: true });

let seed = 23;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

const W = 920, H = 320, CX = 460, CY = 160, RX = 250, RY = 92;
const NAME = "Eduardo Antonio Cruz Bolaños";
const NODES = [
  ["TypeScript", 120, 70], ["MongoDB", 292, 46], ["Git", 466, 28], ["RAG", 640, 46], ["Qdrant", 800, 72],
  ["agentes de voz", 842, 170], ["n8n", 790, 266], ["Docker", 622, 286], ["Python", 466, 296],
  ["PostgreSQL", 300, 286], ["React", 140, 266], ["Node.js", 74, 170],
];
const LINKS = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [8, 9], [9, 10], [10, 11], [11, 0]];
const MONO = `font-family:ui-monospace,SFMono-Regular,Consolas,'Liberation Mono',Menlo,monospace`;

// Punto de la órbita en la dirección del nodo, para que cada línea "toque" la órbita.
const onOrbit = (x, y) => {
  const a = Math.atan2((y - CY) / RY, (x - CX) / RX);
  return [CX + RX * Math.cos(a), CY + RY * Math.sin(a)];
};

function banner() {
  const stars = [[], [], []];
  for (let i = 0; i < 84; i++) {
    const x = (rnd() * W).toFixed(1), y = (rnd() * H).toFixed(1), r = (rnd() * 1.1 + 0.35).toFixed(2);
    stars[i % 3].push(`<circle cx="${x}" cy="${y}" r="${r}"/>`);
  }
  const nameW = textWidth(NAME, 36);
  const nodes = NODES.map(([label, x, y], i) => {
    const [ox, oy] = onOrbit(x, y);
    const dx = ((rnd() - 0.5) * 12).toFixed(1), dy = ((rnd() - 0.5) * 9).toFixed(1);
    const dur = (6 + rnd() * 4).toFixed(1);
    const above = y < CY;
    return `<g class="drift" style="--dx:${dx}px;--dy:${dy}px;animation-duration:${dur}s;animation-delay:-${(i * 0.7).toFixed(1)}s">
      <line x1="${x}" y1="${y}" x2="${ox.toFixed(1)}" y2="${oy.toFixed(1)}" stroke="#1e3a8a" stroke-width="1"/>
      <circle cx="${x}" cy="${y}" r="9" fill="none" stroke="#38bdf8" stroke-opacity=".35"/>
      <circle cx="${x}" cy="${y}" r="3.6" fill="#38bdf8"/>
      <text x="${x}" y="${above ? y - 15 : y + 24}" text-anchor="middle" style="${MONO};font-size:12px" fill="#bae6fd">${label}</text>
    </g>`;
  }).join("\n    ");
  const links = LINKS.map(([a, b]) => `<line x1="${NODES[a][1]}" y1="${NODES[a][2]}" x2="${NODES[b][1]}" y2="${NODES[b][2]}"/>`).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${NAME}, desarrollador full stack en Guatemala, al centro de una constelación de habilidades: TypeScript, Python, Node.js, React, PostgreSQL, MongoDB, RAG, Qdrant, agentes de voz, n8n, Docker y Git.">
  <defs>
    <radialGradient id="sky" cx="50%" cy="50%" r="70%"><stop offset="0" stop-color="#0d1a3a"/><stop offset="1" stop-color="#050816"/></radialGradient>
    <linearGradient id="tail" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e0f2fe"/><stop offset="1" stop-color="#e0f2fe" stop-opacity="0"/></linearGradient>
    <path id="orbit" d="M${CX - RX} ${CY} a${RX} ${RY} 0 1 0 ${2 * RX} 0 a${RX} ${RY} 0 1 0 -${2 * RX} 0"/>
  </defs>
  <style>
    .tw{animation:tw ease-in-out infinite alternate}
    @keyframes tw{from{opacity:.25}to{opacity:1}}
    .drift{animation:drift ease-in-out infinite alternate}
    @keyframes drift{to{transform:translate(var(--dx),var(--dy))}}
    .orbit{animation:flow 30s linear infinite}
    @keyframes flow{to{stroke-dashoffset:-400}}
    .shoot{animation:shoot 9s ease-in infinite;opacity:0}
    @keyframes shoot{0%{transform:translate(900px,10px);opacity:0}2%{opacity:1}11%{transform:translate(560px,170px);opacity:0}100%{transform:translate(560px,170px);opacity:0}}
    .rise{animation:rise 1s cubic-bezier(.2,.7,.2,1) both}
    @keyframes rise{from{opacity:0;transform:translateY(10px)}}
    @media (prefers-reduced-motion:reduce){.tw,.drift,.orbit,.shoot,.rise{animation:none}.shoot{display:none}}
  </style>
  <rect width="${W}" height="${H}" rx="14" fill="url(#sky)"/>
  <g fill="#cbd5e1">
    <g class="tw" style="animation-duration:3.2s">${stars[0].join("")}</g>
    <g class="tw" style="animation-duration:4.7s;animation-delay:-2s">${stars[1].join("")}</g>
    <g class="tw" style="animation-duration:6.1s;animation-delay:-4s">${stars[2].join("")}</g>
  </g>
  <g class="shoot"><line x1="0" y1="0" x2="80" y2="-38" stroke="url(#tail)" stroke-width="1.6" stroke-linecap="round"/><circle r="1.8" fill="#f0f9ff"/></g>
  <g stroke="#1e3a8a" stroke-width="1" stroke-dasharray="3 5">${links}</g>
  <use href="#orbit" class="orbit" fill="none" stroke="#38bdf8" stroke-opacity=".28" stroke-width="1" stroke-dasharray="2 8"/>
  <circle r="3" fill="#7dd3fc"><animateMotion dur="24s" repeatCount="indefinite"><mpath href="#orbit"/></animateMotion></circle>
  ${nodes}
  <g class="rise">
    <path d="${textPath(NAME, CX - nameW / 2, 154, 36)}" fill="#f8fafc"/>
    <text x="${CX}" y="184" text-anchor="middle" style="${MONO};font-size:12px;letter-spacing:3px" fill="#7dd3fc">CONECTO DATOS, CÓDIGO E IA</text>
    <text x="${CX}" y="206" text-anchor="middle" style="${MONO};font-size:11px;letter-spacing:2px" fill="#64748b">FULL STACK · GUATEMALA</text>
  </g>
</svg>
`;
}

// Títulos de sección y cierre, sobre el fondo de GitHub de cada tema.
const SECTIONS = {
  proyectos: ["Proyectos", "trabajo reciente"],
  commits: ["Un año en commits", "se actualiza cada noche"],
  herramientas: ["Herramientas", "lo que uso a diario"],
  contacto: ["Contacto", "hablemos"],
};
const pageThemes = {
  dark: { ink: "#e6edf3", accent: "#7dd3fc", muted: "#8d96a0", line: "#30363d" },
  light: { ink: "#1f2328", accent: "#0369a1", muted: "#59636e", line: "#d1d9e0" },
};
const STAR = (x, y, s) => `M${x} ${y - s}L${x + s * 0.28} ${y - s * 0.28}L${x + s} ${y}L${x + s * 0.28} ${y + s * 0.28}L${x} ${y + s}L${x - s * 0.28} ${y + s * 0.28}L${x - s} ${y}L${x - s * 0.28} ${y - s * 0.28}Z`;
const constellationLine = (y, bright, c) => {
  const xs = [4, 150, 330, 520, 700, 916];
  return `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${c.line}" stroke-width="1"/>` +
    xs.map((x, i) => `<circle cx="${x}" cy="${y}" r="${i === bright ? 3 : 2}" fill="${i === bright ? c.accent : c.muted}"/>`).join("");
};
const section = ([label, note], i, c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 64" width="${W}" height="64" role="img" aria-label="${label}">
  <path d="${STAR(10, 31, 9)}" fill="${c.accent}"/>
  <path d="${textPath(label, 30, 41, 28)}" fill="${c.ink}"/>
  <text x="${W}" y="40" text-anchor="end" style="${MONO};font-size:12px;letter-spacing:2px;font-weight:700" fill="${c.muted}">${note.toUpperCase()}</text>
  ${constellationLine(56, [1, 3, 2, 4][i % 4], c)}
</svg>
`;
const footer = (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 56" width="${W}" height="56" role="img" aria-label="Fin del mapa">
  ${constellationLine(10, 5, c)}
  <text x="0" y="42" style="${MONO};font-size:12px;letter-spacing:2px;font-weight:700" fill="${c.accent}">FIN DEL MAPA</text>
  <text x="${W / 2}" y="42" text-anchor="middle" style="${MONO};font-size:12px;letter-spacing:2px;font-weight:700" fill="${c.muted}">EDUARDO ANTONIO CRUZ BOLAÑOS</text>
  <text x="${W}" y="42" text-anchor="end" style="${MONO};font-size:12px;letter-spacing:1px" fill="${c.muted}">14.6349° N · 90.5069° O</text>
</svg>
`;

mkdirSync("assets", { recursive: true });
writeFileSync("assets/banner.svg", banner());
for (const [name, c] of Object.entries(pageThemes)) {
  Object.entries(SECTIONS).forEach(([key, value], i) => writeFileSync(`assets/section-${key}-${name}.svg`, section(value, i, c)));
  writeFileSync(`assets/footer-${name}.svg`, footer(c));
}
console.log("banner, secciones y cierre listos");
