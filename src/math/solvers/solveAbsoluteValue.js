import * as math from "mathjs";
import { fmt } from "../utils/formatters.js";

// Resuelve ecuaciones con valor absoluto: abs(f(x)) = c
// Estrategia: divide en dos casos: f(x) = c  y  f(x) = -c
export function solveAbsoluteValue(input, display) {
  const steps = [];

  steps.push({ type: "section", text: "[1] Identificación" });
  steps.push({ type: "text", text: `Ecuación con valor absoluto: ${display}` });
  steps.push({ type: "text", text: "Forma general: |f(x)| = c" });

  // Extraer lo que está dentro del abs() y el lado derecho
  const eqParts = input.split("=");
  if (eqParts.length !== 2) {
    return [{ type: "text", text: "Formato no reconocido. Usa: abs(expresión) = valor" }];
  }

  const lhs = eqParts[0].trim();
  const rhs = eqParts[1].trim();

  let innerExpr = null;
  const absMatch = lhs.match(/abs\((.+)\)/i);
  if (absMatch) {
    innerExpr = absMatch[1].trim();
  } else {
    return [{ type: "text", text: "No se encontró abs() en la ecuación. Usa la forma: abs(expresión) = valor" }];
  }

  let rhsValue;
  try {
    rhsValue = math.evaluate(rhs);
  } catch {
    return [{ type: "text", text: `No se pudo evaluar el lado derecho: "${rhs}"` }];
  }

  steps.push({ type: "text", text: `Expresión dentro del valor absoluto: f(x) = ${innerExpr}` });
  steps.push({ type: "text", text: `Valor del lado derecho: c = ${fmt(rhsValue)}` });

  steps.push({ type: "section", text: "[2] Propiedad del valor absoluto" });
  steps.push({ type: "step", text: "Paso 1 — Aplicamos la definición:" });
  steps.push({ type: "eq", text: "|f(x)| = c  ⟺  f(x) = c  ó  f(x) = −c" });

  if (rhsValue < 0) {
    steps.push({ type: "text", text: `c = ${fmt(rhsValue)} < 0 → El valor absoluto nunca puede ser negativo.` });
    steps.push({ type: "result", text: "[✓] Resultado final — La ecuación no tiene solución." });
    return steps;
  }

  if (rhsValue === 0) {
    steps.push({ type: "text", text: "c = 0 → Solo existe un caso: f(x) = 0" });
  }

  const allRoots = [];

  function solveCase(rhs_str, label) {
    const caseEq = `(${innerExpr}) - (${rhs_str})`;
    steps.push({ type: "step", text: `${label}: ${innerExpr} = ${rhs_str}` });
    try {
      const simplified = math.simplify(caseEq).toString();
      const degMatch = simplified.match(/x\s*\^\s*(\d+)/g);
      let maxDeg = 0;
      if (degMatch) maxDeg = Math.max(...degMatch.map((m) => parseInt(m.replace(/x\s*\^\s*/, ""))));
      else if (simplified.includes("x")) maxDeg = 1;

      if (maxDeg <= 1) {
        // Lineal
        const a = math.evaluate(math.derivative(simplified, "x").toString(), {});
        const b = math.evaluate(simplified, { x: 0 });
        if (Math.abs(a) < 1e-10) {
          steps.push({ type: "text", text: "   → Ecuación inconsistente para este caso." });
          return;
        }
        const sol = -b / a;
        steps.push({ type: "eq", text: `x = ${fmt(sol)}` });
        allRoots.push(sol);
      } else if (maxDeg === 2) {
        const f = (x) => math.evaluate(caseEq, { x });
        const cCoef = f(0);
        const aCoef = (f(1) - 2 * f(0) + f(-1)) / 2;
        const bCoef = f(1) - f(0) - aCoef;
        const disc = bCoef * bCoef - 4 * aCoef * cCoef;
        if (disc < 0) {
          steps.push({ type: "text", text: `   → Sin raíces reales (Δ = ${fmt(disc)} < 0).` });
          return;
        }
        const x1 = (-bCoef + Math.sqrt(disc)) / (2 * aCoef);
        const x2 = (-bCoef - Math.sqrt(disc)) / (2 * aCoef);
        steps.push({ type: "eq", text: `x₁ = ${fmt(x1)},  x₂ = ${fmt(x2)}` });
        allRoots.push(x1, x2);
      }
    } catch {
      steps.push({ type: "text", text: "   → No se pudo resolver este caso." });
    }
  }

  steps.push({ type: "section", text: "[3] Caso 1: f(x) = c" });
  solveCase(`${rhs}`, "Paso 2");

  if (rhsValue !== 0) {
    steps.push({ type: "section", text: "[4] Caso 2: f(x) = −c" });
    solveCase(`-(${rhs})`, "Paso 3");
  }

  steps.push({ type: "section", text: "[5] Verificación" });
  const validRoots = [];
  allRoots.forEach((r) => {
    try {
      const lhsVal = Math.abs(math.evaluate(innerExpr, { x: r }));
      const rhsVal = math.evaluate(rhs);
      if (Math.abs(lhsVal - rhsVal) < 0.001) {
        steps.push({ type: "eq", text: `|f(${fmt(r)})| = ${fmt(Math.round(lhsVal * 1e4) / 1e4)} = ${fmt(rhsVal)} ✓` });
        validRoots.push(r);
      } else {
        steps.push({ type: "text", text: `   x = ${fmt(r)} → no verifica (solución extraña, se descarta).` });
      }
    } catch { /* sin verificación */ }
  });

  const labels = ["₁", "₂", "₃", "₄"];
  const resStr = validRoots.length > 0
    ? validRoots.map((r, i) => `x${labels[i] || i + 1} = ${fmt(r)}`).join(",  ")
    : "Sin solución real";

  steps.push({ type: "result", text: `[✓] Resultado final — ${resStr}` });
  return steps;
}
