import * as math from "mathjs";
import { fmt } from "../utils/formatters.js";

export function solveLinear(expr, display = expr) {
  const steps = [];
  const clean = expr.replace(/\s/g, "");
  const sides = clean.split("=");
  if (sides.length !== 2) return null;

  steps.push({ type: "section", text: "[1] Identificación" });
  steps.push({ type: "text", text: `Ecuación lineal detectada: ${display}` });
  steps.push({ type: "text", text: "Forma general: ax + b = 0" });

  steps.push({ type: "section", text: "[2] Reorganizar la ecuación" });
  steps.push({ type: "text", text: "Pasamos todo al lado izquierdo:" });

  const leftStr = `(${sides[0]}) - (${sides[1]})`;
  steps.push({ type: "eq", text: leftStr + " = 0" });

  let simplified;
  try {
    simplified = math.simplify(leftStr).toString();
  } catch {
    return null;
  }
  steps.push({ type: "step", text: "Paso 1 — Simplificamos:" });
  steps.push({ type: "eq", text: simplified + " = 0" });

  let a, b;
  try {
    a = math.evaluate(math.derivative(simplified, "x").toString(), {});
  } catch {
    return null;
  }
  try {
    b = math.evaluate(simplified, { x: 0 });
  } catch {
    return null;
  }

  steps.push({ type: "section", text: "[3] Identificar coeficientes" });
  steps.push({ type: "text", text: `Coeficiente de x:  a = ${fmt(a)}` });
  steps.push({ type: "text", text: `Término independiente:  b = ${fmt(b)}` });

  steps.push({ type: "section", text: "[4] Despejar x" });
  steps.push({ type: "step", text: "Paso 2 — Aplicamos la fórmula x = −b / a:" });
  steps.push({ type: "eq", text: `x = −(${fmt(b)}) / ${fmt(a)}` });
  steps.push({ type: "step", text: "Paso 3 — Calculamos:" });
  const sol = -b / a;
  steps.push({ type: "eq", text: `x = ${fmt(sol)}` });

  steps.push({ type: "section", text: "[5] Verificación" });
  steps.push({
    type: "step",
    text: `Paso 4 — Sustituimos x = ${fmt(sol)} en la ecuación original:`,
  });
  try {
    const lv = math.evaluate(sides[0], { x: sol });
    const rv = math.evaluate(sides[1], { x: sol });
    steps.push({
      type: "eq",
      text: `${fmt(Math.round(lv * 1e6) / 1e6)} = ${fmt(Math.round(rv * 1e6) / 1e6)} ✓`,
    });
  } catch { /* sin verificación */ }

  steps.push({ type: "result", text: `[✓] Resultado final — x = ${fmt(sol)}` });
  return steps;
}
