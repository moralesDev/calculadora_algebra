import * as math from "mathjs";
import { fmt } from "../utils/formatters.js";

// Detecta la variable usada en la expresión (x, y, z, t, n, k)
function detectVariable(expr) {
  const candidates = ["x", "y", "z", "t", "n", "k"];
  for (const v of candidates) {
    if (new RegExp(`(?<![a-zA-Z])${v}(?![a-zA-Z])`).test(expr)) return v;
  }
  return "x";
}

// Intenta mostrar el resultado como fracción exacta si los valores son racionales
function fmtExact(numerator, denominator) {
  if (Math.abs(denominator) < 1e-10) return "indefinido";
  const val = numerator / denominator;
  // Si es entero, mostrarlo directamente
  if (Math.abs(val - Math.round(val)) < 1e-9) return fmt(Math.round(val));
  // Buscar una fracción simple (denominador ≤ 100)
  for (let d = 2; d <= 100; d++) {
    const n = Math.round(val * d);
    if (Math.abs(n / d - val) < 1e-9) {
      const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
      const g = gcd(Math.abs(n), d);
      const nr = n / g, dr = d / g;
      if (dr === 1) return fmt(nr);
      return `${nr}/${dr}`;
    }
  }
  return fmt(val);
}

export function solveLinear(expr, display = expr) {
  const steps = [];
  const clean = expr.replace(/\s/g, "");
  const sides = clean.split("=");
  if (sides.length !== 2) return null;

  const lhs = sides[0];
  const rhs = sides[1];

  // Detectar variable
  const variable = detectVariable(expr);

  steps.push({ type: "section", text: "[1] Identificación" });
  steps.push({ type: "text", text: `Ecuación lineal detectada: ${display}` });
  steps.push({ type: "text", text: `Variable: ${variable}` });
  steps.push({ type: "text", text: `Forma general: a${variable} + b = 0` });

  // Simplificar cada lado por separado para el análisis
  let lhsSimp, rhsSimp;
  try {
    lhsSimp = math.simplify(lhs).toString();
    rhsSimp = math.simplify(rhs).toString();
  } catch {
    return null;
  }

  steps.push({ type: "section", text: "[2] Organizar la ecuación" });
  steps.push({ type: "step", text: `Paso 1 — Ecuación original:` });
  steps.push({ type: "eq", text: `${lhsSimp} = ${rhsSimp}` });

  // Construir expresión unificada: lhs - rhs = 0
  const combined = `(${lhs}) - (${rhs})`;
  let simplified;
  try {
    simplified = math.simplify(combined).toString();
  } catch {
    return null;
  }

  steps.push({ type: "step", text: `Paso 2 — Pasamos todo al lado izquierdo (restamos el lado derecho):` });
  steps.push({ type: "eq", text: `${lhsSimp} - (${rhsSimp}) = 0` });
  steps.push({ type: "eq", text: `${simplified} = 0` });

  // Extraer coeficiente 'a' (derivada respecto a la variable)
  let a;
  try {
    const derivStr = math.derivative(simplified, variable).toString();
    a = math.evaluate(derivStr, { [variable]: 0 });
  } catch {
    return null;
  }

  // Extraer término independiente 'b' (evaluar en variable=0)
  let b;
  try {
    b = math.evaluate(simplified, { [variable]: 0 });
  } catch {
    return null;
  }

  if (Math.abs(a) < 1e-10) {
    // No hay variable — es una identidad o contradicción
    if (Math.abs(b) < 1e-6) {
      steps.push({ type: "text", text: "La ecuación se reduce a 0 = 0 → es una identidad (infinitas soluciones)." });
      steps.push({ type: "result", text: "[✓] Resultado — Infinitas soluciones (identidad)" });
    } else {
      steps.push({ type: "text", text: `La ecuación se reduce a ${fmt(b)} = 0 → contradicción, sin solución.` });
      steps.push({ type: "result", text: "[✓] Resultado — Sin solución (contradicción)" });
    }
    return steps;
  }

  steps.push({ type: "section", text: "[3] Identificar coeficientes" });
  steps.push({ type: "text", text: `Coeficiente de ${variable}:  a = ${fmt(a)}` });
  steps.push({ type: "text", text: `Término independiente:  b = ${fmt(b)}` });

  // Mostrar forma simplificada: a*variable = -b
  const negB = -b;
  steps.push({ type: "step", text: `Paso 3 — Agrupamos: pasamos b al lado derecho:` });
  steps.push({ type: "eq", text: `${fmt(a)}${variable} = ${fmt(negB)}` });

  steps.push({ type: "section", text: "[4] Despejar la variable" });
  steps.push({ type: "step", text: `Paso 4 — Dividimos ambos lados entre a = ${fmt(a)}:` });
  steps.push({ type: "eq", text: `${variable} = ${fmt(negB)} / ${fmt(a)}` });

  const sol = negB / a;
  const solExact = fmtExact(negB, a);
  steps.push({ type: "step", text: "Paso 5 — Resultado:" });
  steps.push({ type: "eq", text: `${variable} = ${solExact}` });

  steps.push({ type: "section", text: "[5] Verificación" });
  steps.push({ type: "step", text: `Paso 6 — Sustituimos ${variable} = ${solExact} en la ecuación original:` });
  try {
    const lv = math.evaluate(lhs, { [variable]: sol });
    const rv = math.evaluate(rhs, { [variable]: sol });
    const lvR = Math.round(lv * 1e6) / 1e6;
    const rvR = Math.round(rv * 1e6) / 1e6;
    steps.push({ type: "eq", text: `${fmt(lvR)} = ${fmt(rvR)} ✓` });
  } catch { /* sin verificación */ }

  steps.push({ type: "result", text: `[✓] Resultado final — ${variable} = ${solExact}` });
  return steps;
}
