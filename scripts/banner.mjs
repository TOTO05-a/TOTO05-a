// Genera assets/banner-dark.svg y assets/banner-light.svg.
// Uso: node scripts/banner.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const NAME = "Eduardo Antonio Cruz Bolaños";
const ROLE = "Desarrollador full stack · Guatemala";
const STACK = "TypeScript · Node.js · React · PostgreSQL · MongoDB · Docker";

const themes = {
  dark: { bg: "#0f172a", fg: "#f8fafc", muted: "#94a3b8", teal: "#14b8a6", mint: "#5eead4", node: "#132036", edge: "#1e3a4a", ok: "#3fb950" },
  light: { bg: "#f0fdfa", fg: "#0f172a", muted: "#475569", teal: "#0f766e", mint: "#0d9488", node: "#ffffff", edge: "#99d5cc", ok: "#1a7f37" },
};

const targets = [
  { y: 195, label: "PostgreSQL", project: "→ roofing-business-platform" },
  { y: 255, label: "Qdrant · RAG", project: "→ ruta-ia · rag-grafo-finetuning" },
  { y: 315, label: "n8n · flujos con IA", project: "→ justificación de inasistencias" },
];

const svg = (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 370" width="880" height="370" role="img" aria-label="${NAME}: ${ROLE}. Diagrama de una petición que entra a una API y se reparte entre PostgreSQL, RAG y n8n.">
  <style>
    .sans{font-family:"Segoe UI",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif}
    .mono{font-family:ui-monospace,SFMono-Regular,Consolas,"Liberation Mono",Menlo,monospace;font-size:12px}
    .name{font-weight:700;font-size:40px;letter-spacing:-0.5px}
    .role{font-weight:500;font-size:17px}
    .node{fill:${c.node};stroke:${c.edge};stroke-width:1.2}
    .edge{fill:none;stroke:${c.edge};stroke-width:1.6}
    .nt{font-weight:600;font-size:13px}
    .pulse{animation:pulse 2s ease-in-out infinite}
    @keyframes pulse{50%{opacity:.35}}
    @media (prefers-reduced-motion:reduce){.pulse{animation:none}}
  </style>
  <rect width="880" height="370" rx="14" fill="${c.bg}"/>
  <text class="mono" x="40" y="52" fill="${c.teal}">// sistema en producción</text>
  <g transform="translate(640 30)">
    <rect class="node" width="200" height="30" rx="15"/>
    <circle class="pulse" cx="18" cy="15" r="4.5" fill="${c.ok}"/>
    <text class="mono" x="32" y="19.5" fill="${c.fg}">disponible para trabajar</text>
  </g>
  <text class="sans name" x="40" y="104" fill="${c.fg}">${NAME}</text>
  <text class="sans role" x="40" y="136" fill="${c.muted}">${ROLE}</text>
  <text class="mono" x="40" y="176" fill="${c.muted}">${STACK}</text>

  <path id="pa" class="edge" d="M150 273 H210"/>
  ${targets.map((t, i) => `<path id="p${i}" class="edge" d="M360 273 C395 273 395 ${t.y + 18} 430 ${t.y + 18}"/>`).join("\n  ")}

  <rect class="node" x="40" y="255" width="110" height="36" rx="8"/>
  <text class="sans nt" x="95" y="278" text-anchor="middle" fill="${c.fg}">petición</text>
  <rect class="node" x="210" y="255" width="150" height="36" rx="8" style="stroke:${c.teal}"/>
  <text class="sans nt" x="285" y="278" text-anchor="middle" fill="${c.fg}">API · Node / Express</text>
  ${targets.map((t) => `<rect class="node" x="430" y="${t.y}" width="150" height="36" rx="8"/>
  <text class="sans nt" x="505" y="${t.y + 23}" text-anchor="middle" fill="${c.fg}">${t.label}</text>
  <text class="mono" x="600" y="${t.y + 22}" fill="${c.mint}">${t.project}</text>`).join("\n  ")}

  <circle r="4" fill="${c.mint}"><animateMotion dur="1s" repeatCount="indefinite"><mpath href="#pa"/></animateMotion></circle>
  ${targets.map((_, i) => `<circle r="4" fill="${c.mint}"><animateMotion dur="1.4s" begin="${(0.2 + i * 0.45).toFixed(2)}s" repeatCount="indefinite"><mpath href="#p${i}"/></animateMotion></circle>`).join("\n  ")}
</svg>
`;

mkdirSync("assets", { recursive: true });
for (const [name, colors] of Object.entries(themes)) {
  writeFileSync(`assets/banner-${name}.svg`, svg(colors));
  console.log(`assets/banner-${name}.svg`);
}
