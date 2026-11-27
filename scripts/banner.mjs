// Genera assets/banner-dark.svg y assets/banner-light.svg (estilo portada de revista).
// Las letras grandes se convierten en trazos con la fuente Anton (OFL), así se ven
// iguales en cualquier navegador aunque GitHub no cargue fuentes externas.
// Uso: npm install && node scripts/banner.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import opentype from "opentype.js";

const fontBuf = readFileSync("node_modules/@fontsource/anton/files/anton-latin-400-normal.woff");
const font = opentype.parse(fontBuf.buffer.slice(fontBuf.byteOffset, fontBuf.byteOffset + fontBuf.byteLength));
const capRatio = font.tables.os2.sCapHeight / font.unitsPerEm;

const W = 920, H = 300, X = 40, BLOCK = 410;
const LINE1 = "EDUARDO";
const LINE2 = "ANTONIO CRUZ BOLAÑOS";
const COVER = ["APIs y bases de datos", "Aplicaciones web completas", "IA aplicada: RAG y voz"];

const themes = {
  dark: { bg: "#0b1416", ink: "#eef6f5", accent: "#5eead4", muted: "#9fb3b1" },
  light: { bg: "#eaf8f5", ink: "#0f172a", accent: "#0f766e", muted: "#334155" },
};

// Ajusta el tamaño para que la línea mida exactamente BLOCK px de ancho.
function fitted(text, width) {
  const size = width / font.getAdvanceWidth(text, 1, { kerning: true });
  return { size, cap: size * capRatio };
}
const l1 = fitted(LINE1, BLOCK);
const l2 = fitted(LINE2, BLOCK);
const top = 76;
const y1 = top + l1.cap;
const y2 = y1 + 16 + l2.cap;
const path = (text, y, size) => font.getPath(text, X, y, size, { kerning: true }).toPathData(1);
const p1 = path(LINE1, y1, l1.size);
const p2 = path(LINE2, y2, l2.size);
const bottomRule = Math.round(y2 + 22);

const svg = (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Eduardo Antonio Cruz Bolaños. Desarrollador full stack en Guatemala: APIs y bases de datos, aplicaciones web completas e IA aplicada.">
  <style>
    .mono{font-family:ui-monospace,SFMono-Regular,Consolas,"Liberation Mono",Menlo,monospace;font-size:12px;letter-spacing:2px;font-weight:700}
    .sans{font-family:"Segoe UI",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif}
    .rule{transform-box:fill-box;transform-origin:left;animation:draw .9s cubic-bezier(.2,.7,.2,1) both}
    .rise{animation:rise .8s cubic-bezier(.2,.7,.2,1) both}
    .fade{animation:fade .6s ease-out both}
    @keyframes draw{from{transform:scaleX(0)}}
    @keyframes rise{from{transform:translateY(46px);opacity:0}}
    @keyframes fade{from{opacity:0;transform:translateY(6px)}}
    @media (prefers-reduced-motion:reduce){.rule,.rise,.fade{animation:none}}
  </style>
  <defs>
    <clipPath id="c1"><rect x="0" y="${top - 4}" width="${W}" height="${Math.ceil(l1.cap) + 8}"/></clipPath>
    <clipPath id="c2"><rect x="0" y="${Math.floor(y2 - l2.cap) - 4}" width="${W}" height="${Math.ceil(l2.cap) + 10}"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" rx="12" fill="${c.bg}"/>
  <text class="mono" x="${X}" y="44" fill="${c.accent}">Nº 001 · DESARROLLADOR FULL STACK</text>
  <text class="mono" x="${W - X}" y="44" text-anchor="end" fill="${c.accent}">GUATEMALA · 2026</text>
  <rect class="rule" x="${X}" y="57" width="${W - 2 * X}" height="2" fill="${c.ink}"/>
  <g clip-path="url(#c1)"><path class="rise" style="animation-delay:.15s" d="${p1}" fill="${c.ink}"/></g>
  <g clip-path="url(#c2)"><path class="rise" style="animation-delay:.35s" d="${p2}" fill="${c.accent}"/></g>
  <g class="fade" style="animation-delay:.7s">
    <text class="mono" x="580" y="${top + 12}" fill="${c.muted}">EN ESTA EDICIÓN</text>
  </g>
  ${COVER.map((t, i) => {
    const y = top + 50 + i * ((y2 - 6 - (top + 50)) / 2);
    return `<g class="fade" style="animation-delay:${(0.85 + i * 0.15).toFixed(2)}s">
    <rect x="580" y="${y - 20}" width="18" height="3" fill="${c.accent}"/>
    <text class="sans" x="580" y="${y + 6}" font-size="21" font-weight="600" fill="${c.ink}">${t}</text>
  </g>`;
  }).join("\n  ")}
  <rect class="rule" style="animation-delay:.2s" x="${X}" y="${bottomRule}" width="${W - 2 * X}" height="2" fill="${c.ink}"/>
  <text class="sans" x="${X}" y="${bottomRule + 24}" font-size="13" font-weight="500" fill="${c.muted}">Disponible para mi primer rol como desarrollador</text>
  <text class="mono" x="${W - X}" y="${bottomRule + 24}" text-anchor="end" style="letter-spacing:1px;font-weight:400" fill="${c.muted}">14.6349° N · 90.5069° O</text>
</svg>
`;

mkdirSync("assets", { recursive: true });
for (const [name, colors] of Object.entries(themes)) {
  writeFileSync(`assets/banner-${name}.svg`, svg(colors));
  console.log(`assets/banner-${name}.svg`);
}
console.log({ l1: Math.round(l1.size), l2: Math.round(l2.size), y1: Math.round(y1), y2: Math.round(y2), bottomRule });
