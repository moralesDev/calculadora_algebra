import { fmt } from "../utils/formatters.js";

export function solveQuadratic(a, b, c, original) {
  const steps = [];
  steps.push({ type: "section", text: "[1] Identificación" });
  steps.push({ type: "text", text: `Ecuación cuadrática detectada: ${original}` });
  steps.push({ type: "text", text: "Forma general: ax² + bx + c = 0" });

  steps.push({ type: "section", text: "[2] Identificar coeficientes" });
  steps.push({ type: "text", text: `a = ${fmt(a)}  (coeficiente de x²)` });
  steps.push({ type: "text", text: `b = ${fmt(b)}  (coeficiente de x)` });
  steps.push({ type: "text", text: `c = ${fmt(c)}  (término independiente)` });

  steps.push({ type: "section", text: "[3] Calcular el discriminante" });
  steps.push({ type: "step", text: "Paso 1 — Fórmula del discriminante:" });
  steps.push({ type: "eq", text: "Δ = b² − 4ac" });
  steps.push({ type: "step", text: "Paso 2 — Sustituimos los valores:" });
  steps.push({ type: "eq", text: `Δ = (${fmt(b)})² − 4(${fmt(a)})(${fmt(c)})` });
  const disc = b * b - 4 * a * c;
  steps.push({ type: "eq", text: `Δ = ${fmt(b * b)} − ${fmt(4 * a * c)}` });
  steps.push({ type: "eq", text: `Δ = ${fmt(disc)}` });

  steps.push({ type: "section", text: "[4] Análisis del discriminante" });
  if (disc < 0) {
    steps.push({
      type: "text",
      text: `Como Δ = ${fmt(disc)} < 0, no existen raíces reales — las raíces son números complejos.`,
    });
    steps.push({ type: "text", text: "La parábola no corta el eje x." });

    const realPart = -b / (2 * a);
    const imagPart = Math.sqrt(-disc) / (2 * a);
    const realR = Math.round(realPart * 1e6) / 1e6;
    const imagR = Math.round(Math.abs(imagPart) * 1e6) / 1e6;

    steps.push({ type: "section", text: "[5] Raíces complejas conjugadas" });
    steps.push({ type: "step", text: "Paso 5 — Usando la fórmula con número imaginario i = √(−1):" });
    steps.push({ type: "eq", text: `x = (−b ± √Δ) / 2a = (${fmt(-b)} ± √(${fmt(disc)})) / ${fmt(2 * a)}` });
    steps.push({ type: "eq", text: `x = (${fmt(-b)} ± ${fmt(imagR)}i) / ${fmt(2 * a)}` });
    steps.push({ type: "step", text: "Paso 6 — Separamos en parte real e imaginaria:" });
    steps.push({ type: "eq", text: `x₁ = ${fmt(realR)} + ${fmt(imagR)}i` });
    steps.push({ type: "eq", text: `x₂ = ${fmt(realR)} − ${fmt(imagR)}i` });
    steps.push({ type: "text", text: `Parte real: α = −b/2a = ${fmt(realR)}` });
    steps.push({ type: "text", text: `Parte imaginaria: β = √|Δ|/2a = ${fmt(imagR)}` });
    steps.push({
      type: "result",
      text: `[✓] Resultado final — x₁ = ${fmt(realR)} + ${fmt(imagR)}i,  x₂ = ${fmt(realR)} − ${fmt(imagR)}i`,
    });
    return steps;
  }
  if (disc === 0)
    steps.push({
      type: "text",
      text: "Como Δ = 0, existe exactamente una raíz real (raíz doble).",
    });
  else
    steps.push({
      type: "text",
      text: `Como Δ = ${fmt(disc)} > 0, existen dos raíces reales distintas.`,
    });

  steps.push({ type: "section", text: "[5] Aplicar la fórmula cuadrática" });
  steps.push({ type: "step", text: "Paso 3 — Fórmula general:" });
  steps.push({ type: "eq", text: "x = (−b ± √Δ) / 2a" });
  steps.push({ type: "step", text: "Paso 4 — Sustituimos:" });
  steps.push({
    type: "eq",
    text: `x = (−(${fmt(b)}) ± √${fmt(disc)}) / (2 · ${fmt(a)})`,
  });
  steps.push({
    type: "eq",
    text: `x = (${fmt(-b)} ± √${fmt(disc)}) / ${fmt(2 * a)}`,
  });

  const sqrtDisc = Math.sqrt(disc);
  steps.push({
    type: "step",
    text: `Paso 5 — Calculamos √${fmt(disc)} = ${fmt(sqrtDisc)}:`,
  });

  if (disc === 0) {
    const x1 = -b / (2 * a);
    steps.push({
      type: "eq",
      text: `x = ${fmt(-b)} / ${fmt(2 * a)} = ${fmt(x1)}`,
    });
    steps.push({ type: "section", text: "[6] Análisis de multiplicidad" });
    steps.push({
      type: "text",
      text: `x = ${fmt(x1)} tiene multiplicidad 2 (raíz doble).`,
    });
    steps.push({
      type: "text",
      text: "La parábola toca el eje x en ese punto sin cruzarlo.",
    });
    steps.push({
      type: "result",
      text: `[✓] Resultado final — x = ${fmt(x1)} (multiplicidad 2)`,
    });
  } else {
    const x1 = (-b + sqrtDisc) / (2 * a);
    const x2 = (-b - sqrtDisc) / (2 * a);
    steps.push({ type: "step", text: "Paso 6 — Calculamos x₁ (con +):" });
    steps.push({
      type: "eq",
      text: `x₁ = (${fmt(-b)} + ${fmt(sqrtDisc)}) / ${fmt(2 * a)}`,
    });
    steps.push({
      type: "eq",
      text: `x₁ = ${fmt(-b + sqrtDisc)} / ${fmt(2 * a)} = ${fmt(x1)}`,
    });
    steps.push({ type: "step", text: "Paso 7 — Calculamos x₂ (con −):" });
    steps.push({
      type: "eq",
      text: `x₂ = (${fmt(-b)} − ${fmt(sqrtDisc)}) / ${fmt(2 * a)}`,
    });
    steps.push({
      type: "eq",
      text: `x₂ = ${fmt(-b - sqrtDisc)} / ${fmt(2 * a)} = ${fmt(x2)}`,
    });
    steps.push({ type: "section", text: "[6] Análisis de multiplicidad" });
    steps.push({
      type: "text",
      text: `x₁ = ${fmt(x1)} — multiplicidad 1 (la gráfica cruza el eje x)`,
    });
    steps.push({
      type: "text",
      text: `x₂ = ${fmt(x2)} — multiplicidad 1 (la gráfica cruza el eje x)`,
    });
    steps.push({ type: "section", text: "[7] Verificación" });
    steps.push({ type: "step", text: `Paso 8 — Verificamos x₁ = ${fmt(x1)}:` });
    const v1 = a * x1 * x1 + b * x1 + c;
    steps.push({
      type: "eq",
      text: `f(${fmt(x1)}) = ${fmt(Math.round(v1 * 1e6) / 1e6)} ✓`,
    });
    steps.push({ type: "step", text: `Paso 9 — Verificamos x₂ = ${fmt(x2)}:` });
    const v2 = a * x2 * x2 + b * x2 + c;
    steps.push({
      type: "eq",
      text: `f(${fmt(x2)}) = ${fmt(Math.round(v2 * 1e6) / 1e6)} ✓`,
    });
    steps.push({
      type: "result",
      text: `[✓] Resultado final — x₁ = ${fmt(x1)},  x₂ = ${fmt(x2)}`,
    });
  }
  return steps;
}
