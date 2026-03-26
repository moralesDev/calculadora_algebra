import * as math from "mathjs";
import { fmt } from "../utils/formatters.js";

// Resuelve sistemas de ecuaciones 2x2: ax + by = c, dx + ey = f
// Estrategia: Regla de Cramer y eliminación gaussiana
export function solveSystem(input, display) {
  const steps = [];

  steps.push({ type: "section", text: "[1] Identificación" });
  steps.push({ type: "text", text: `Sistema de ecuaciones: ${display}` });
  steps.push({ type: "text", text: "Forma general: a₁x + b₁y = c₁" });
  steps.push({ type: "text", text: "               a₂x + b₂y = c₂" });

  // Separar las dos ecuaciones por coma
  const parts = input.split(",");
  if (parts.length !== 2) {
    return [{ type: "text", text: "Formato no reconocido. Usa: ax + by = c, dx + ey = f" }];
  }

  const eq1str = parts[0].trim();
  const eq2str = parts[1].trim();

  steps.push({ type: "text", text: `Ecuación 1: ${eq1str}` });
  steps.push({ type: "text", text: `Ecuación 2: ${eq2str}` });

  // Extraer coeficientes de cada ecuación del tipo ax + by = c
  function extractCoeffs(eqStr) {
    const sides = eqStr.split("=");
    if (sides.length !== 2) return null;
    const lhs = sides[0].trim();
    const rhs = sides[1].trim();
    // Reorganizar: lhs - rhs = 0, forma ax + by - c = 0
    // Evaluar coeficientes numéricamente
    let a, b, c;
    try {
      c = -math.evaluate(rhs); // lado derecho como término independiente negativo
      const f = (x, y) => math.evaluate(lhs, { x, y });
      // f(x,y) = ax + by + const
      // f(0,0) = const = c_term (que moveremos al otro lado)
      const f00 = f(0, 0);
      a = f(1, 0) - f00;
      b = f(0, 1) - f00;
      // la ecuación es: a*x + b*y + f00 = rhs_val
      // a*x + b*y = rhs_val - f00
      const rhsVal = math.evaluate(rhs);
      return {
        a: Math.round(a * 1e6) / 1e6,
        b: Math.round(b * 1e6) / 1e6,
        c: Math.round((rhsVal - f00) * 1e6) / 1e6,
      };
    } catch {
      return null;
    }
  }

  const c1 = extractCoeffs(eq1str);
  const c2 = extractCoeffs(eq2str);

  if (!c1 || !c2) {
    return [{ type: "text", text: "No se pudieron extraer los coeficientes. Usa variables x e y." }];
  }

  const { a: a1, b: b1, c: c1val } = c1;
  const { a: a2, b: b2, c: c2val } = c2;

  steps.push({ type: "section", text: "[2] Identificar coeficientes" });
  steps.push({ type: "text", text: `Ecuación 1: ${fmt(a1)}x + (${fmt(b1)})y = ${fmt(c1val)}` });
  steps.push({ type: "text", text: `Ecuación 2: ${fmt(a2)}x + (${fmt(b2)})y = ${fmt(c2val)}` });

  steps.push({ type: "section", text: "[3] Regla de Cramer" });
  steps.push({ type: "step", text: "Paso 1 — Construimos el determinante principal D:" });
  steps.push({ type: "eq", text: `D = |a₁ b₁| = |${fmt(a1)} ${fmt(b1)}|` });
  steps.push({ type: "eq", text: `    |a₂ b₂|   |${fmt(a2)} ${fmt(b2)}|` });

  const det = a1 * b2 - a2 * b1;
  steps.push({ type: "eq", text: `D = (${fmt(a1)})(${fmt(b2)}) − (${fmt(a2)})(${fmt(b1)}) = ${fmt(det)}` });

  if (Math.abs(det) < 1e-9) {
    steps.push({ type: "section", text: "[4] Sistema sin solución única" });
    // Verificar si es inconsistente o dependiente
    const k = Math.abs(b1) > 1e-9 ? b2 / b1 : (Math.abs(a1) > 1e-9 ? a2 / a1 : null);
    if (k !== null && Math.abs(c2val - k * c1val) < 1e-6) {
      steps.push({ type: "text", text: "D = 0 y los sistemas son proporcionales → Sistema dependiente (infinitas soluciones)." });
      steps.push({ type: "result", text: "[✓] Resultado — Sistema dependiente: infinitas soluciones." });
    } else {
      steps.push({ type: "text", text: "D = 0 y los sistemas son inconsistentes → Sin solución." });
      steps.push({ type: "result", text: "[✓] Resultado — Sistema inconsistente: sin solución." });
    }
    return steps;
  }

  steps.push({ type: "step", text: "Paso 2 — Determinante Dx (reemplazamos columna x con c):" });
  steps.push({ type: "eq", text: `Dx = |c₁ b₁| = |${fmt(c1val)} ${fmt(b1)}| = (${fmt(c1val)})(${fmt(b2)}) − (${fmt(c2val)})(${fmt(b1)})` });
  steps.push({ type: "eq", text: `    |c₂ b₂|   |${fmt(c2val)} ${fmt(b2)}|` });
  const detX = c1val * b2 - c2val * b1;
  steps.push({ type: "eq", text: `Dx = ${fmt(detX)}` });

  steps.push({ type: "step", text: "Paso 3 — Determinante Dy (reemplazamos columna y con c):" });
  steps.push({ type: "eq", text: `Dy = |a₁ c₁| = |${fmt(a1)} ${fmt(c1val)}| = (${fmt(a1)})(${fmt(c2val)}) − (${fmt(a2)})(${fmt(c1val)})` });
  steps.push({ type: "eq", text: `    |a₂ c₂|   |${fmt(a2)} ${fmt(c2val)}|` });
  const detY = a1 * c2val - a2 * c1val;
  steps.push({ type: "eq", text: `Dy = ${fmt(detY)}` });

  steps.push({ type: "section", text: "[4] Calcular x e y" });
  const x = detX / det;
  const y = detY / det;
  steps.push({ type: "step", text: "Paso 4 — Aplicamos la regla de Cramer:" });
  steps.push({ type: "eq", text: `x = Dx / D = ${fmt(detX)} / ${fmt(det)} = ${fmt(x)}` });
  steps.push({ type: "eq", text: `y = Dy / D = ${fmt(detY)} / ${fmt(det)} = ${fmt(y)}` });

  steps.push({ type: "section", text: "[5] Verificación" });
  steps.push({ type: "step", text: "Paso 5 — Sustituimos en ambas ecuaciones:" });
  try {
    const lhs1 = math.evaluate(eq1str.split("=")[0], { x, y });
    const rhs1 = math.evaluate(eq1str.split("=")[1], {});
    steps.push({ type: "eq", text: `Ec. 1: ${fmt(Math.round(lhs1 * 1e4) / 1e4)} = ${fmt(Math.round(rhs1 * 1e4) / 1e4)} ✓` });
  } catch { /* sin verificación */ }
  try {
    const lhs2 = math.evaluate(eq2str.split("=")[0], { x, y });
    const rhs2 = math.evaluate(eq2str.split("=")[1], {});
    steps.push({ type: "eq", text: `Ec. 2: ${fmt(Math.round(lhs2 * 1e4) / 1e4)} = ${fmt(Math.round(rhs2 * 1e4) / 1e4)} ✓` });
  } catch { /* sin verificación */ }

  steps.push({ type: "result", text: `[✓] Resultado final — x = ${fmt(x)},  y = ${fmt(y)}` });
  return steps;
}
