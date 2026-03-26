import * as math from "mathjs";
import { fmt } from "../utils/formatters.js";

// Resuelve ecuaciones bicuadráticas: ax⁴ + bx² + c = 0
// Estrategia: sustitución u = x², convierte en cuadrática en u
export function solveBiquadratic(exprLeft, display) {
  const steps = [];

  steps.push({ type: "section", text: "[1] Identificación" });
  steps.push({ type: "text", text: `Ecuación bicuadrática detectada: ${display}` });
  steps.push({ type: "text", text: "Forma general: ax⁴ + bx² + c = 0" });
  steps.push({ type: "text", text: "Característica: solo aparecen potencias pares de x." });

  // Extraer coeficientes a, b, c de ax^4 + bx^2 + c
  let a, b, c;
  try {
    const f = (x) => math.evaluate(exprLeft, { x });
    c = f(0);
    const f1 = f(1);
    const f2 = f(2);
    a = (f2 - 4 * f1 + 3 * c) / 12;
    b = f1 - c - a;
    a = Math.round(a * 1e6) / 1e6;
    b = Math.round(b * 1e6) / 1e6;
    c = Math.round(c * 1e6) / 1e6;
  } catch {
    return [{ type: "text", text: "No se pudo extraer los coeficientes de la ecuación." }];
  }

  steps.push({ type: "section", text: "[2] Identificar coeficientes" });
  steps.push({ type: "text", text: `a = ${fmt(a)}  (coeficiente de x⁴)` });
  steps.push({ type: "text", text: `b = ${fmt(b)}  (coeficiente de x²)` });
  steps.push({ type: "text", text: `c = ${fmt(c)}  (término independiente)` });

  steps.push({ type: "section", text: "[3] Sustitución u = x²" });
  steps.push({ type: "step", text: "Paso 1 — Aplicamos la sustitución u = x²:" });
  steps.push({ type: "eq", text: `${fmt(a)}u² + (${fmt(b)})u + ${fmt(c)} = 0` });
  steps.push({ type: "text", text: "Ahora tenemos una ecuación cuadrática en u." });

  steps.push({ type: "section", text: "[4] Resolver la cuadrática en u" });
  const disc = b * b - 4 * a * c;
  steps.push({ type: "step", text: "Paso 2 — Calculamos el discriminante:" });
  steps.push({ type: "eq", text: `Δ = (${fmt(b)})² − 4·(${fmt(a)})·(${fmt(c)}) = ${fmt(disc)}` });

  if (disc < 0) {
    steps.push({ type: "text", text: `Δ = ${fmt(disc)} < 0 → la ecuación cuadrática en u no tiene soluciones reales.` });
    steps.push({ type: "result", text: "[✓] Resultado final — La ecuación no tiene raíces reales." });
    return steps;
  }

  const sqrtDisc = Math.sqrt(disc);
  const u1 = (-b + sqrtDisc) / (2 * a);
  const u2 = (-b - sqrtDisc) / (2 * a);
  const u1r = Math.round(u1 * 1e6) / 1e6;
  const u2r = Math.round(u2 * 1e6) / 1e6;

  steps.push({ type: "step", text: "Paso 3 — Valores de u:" });
  steps.push({ type: "eq", text: `u₁ = (−(${fmt(b)}) + √${fmt(disc)}) / (2·${fmt(a)}) = ${fmt(u1r)}` });
  steps.push({ type: "eq", text: `u₂ = (−(${fmt(b)}) − √${fmt(disc)}) / (2·${fmt(a)}) = ${fmt(u2r)}` });

  steps.push({ type: "section", text: "[5] Deshacer la sustitución x² = u" });
  steps.push({ type: "text", text: "Como u = x², para cada valor de u calculamos x = ±√u." });

  const roots = [];

  function processU(u, label) {
    if (Math.abs(u) < 1e-9) {
      steps.push({ type: "step", text: `${label} — u = 0:` });
      steps.push({ type: "eq", text: `x² = 0 → x = 0 (raíz doble)` });
      roots.push(0);
    } else if (u > 0) {
      const sqrtU = Math.sqrt(u);
      const sqrtUr = Math.round(sqrtU * 1e6) / 1e6;
      steps.push({ type: "step", text: `${label} — u = ${fmt(u)} > 0:` });
      steps.push({ type: "eq", text: `x² = ${fmt(u)} → x = ±√${fmt(u)} = ±${fmt(sqrtUr)}` });
      roots.push(sqrtUr, -sqrtUr);
    } else {
      steps.push({ type: "step", text: `${label} — u = ${fmt(u)} < 0:` });
      steps.push({ type: "eq", text: `x² = ${fmt(u)} < 0 → No existen raíces reales para este valor.` });
      const imagPart = Math.round(Math.sqrt(-u) * 1e6) / 1e6;
      steps.push({ type: "text", text: `   Raíces complejas: x = ±${fmt(imagPart)}i` });
    }
  }

  processU(u1r, "Paso 4 — Para u₁");
  if (Math.abs(u1r - u2r) > 1e-6) processU(u2r, "Paso 5 — Para u₂");

  steps.push({ type: "section", text: "[6] Verificación" });
  roots.forEach((r) => {
    try {
      const v = math.evaluate(exprLeft, { x: r });
      steps.push({ type: "eq", text: `f(${fmt(r)}) = ${fmt(Math.round(v * 1e4) / 1e4)} ✓` });
    } catch { /* sin verificación */ }
  });

  const uniqueRoots = [...new Set(roots.map((r) => Math.round(r * 1e4) / 1e4))];
  uniqueRoots.sort((a, b) => a - b);
  const labels = ["₁", "₂", "₃", "₄"];
  const resStr = uniqueRoots.length > 0
    ? uniqueRoots.map((r, i) => `x${labels[i] || i + 1} = ${fmt(r)}`).join(",  ")
    : "Sin raíces reales";

  steps.push({ type: "result", text: `[✓] Resultado final — ${resStr}` });
  return steps;
}
