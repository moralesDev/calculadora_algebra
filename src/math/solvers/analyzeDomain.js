import * as math from "mathjs";
import { fmt } from "../utils/formatters.js";

export function analyzeDomain(exprInput, displayInput = exprInput) {
  const steps = [];
  const expr = exprInput.replace(/f\(x\)\s*=\s*/i, "").trim();
  const displayExpr = displayInput.replace(/f\(x\)\s*=\s*/i, "").trim();

  steps.push({ type: "section", text: "[1] Identificación de la función" });
  steps.push({ type: "text", text: `f(x) = ${displayExpr}` });

  const hasFraction = expr.includes("/");
  const hasSqrt = expr.includes("sqrt") || expr.includes("√");
  const hasLog = expr.includes("log") || expr.includes("ln");

  steps.push({ type: "section", text: "[2] Identificar restricciones" });

  const restrictions = [];

  if (hasFraction) {
    steps.push({ type: "step", text: "Paso 1 — La función tiene denominador:" });
    steps.push({ type: "text", text: "   Regla: el denominador no puede ser cero." });
    try {
      const denomMatch = expr.match(/\/\((.+?)\)/);
      if (denomMatch) {
        const denom = denomMatch[1];
        steps.push({ type: "eq", text: `Denominador: ${denom} ≠ 0` });
        for (let x = -20; x <= 20; x += 0.001) {
          try {
            const v = Math.abs(math.evaluate(denom, { x }));
            if (v < 0.001) {
              const xr = Math.round(x * 100) / 100;
              if (!restrictions.some((r) => Math.abs(r - xr) < 0.01))
                restrictions.push(xr);
            }
          } catch { /* continúa */ }
        }
        if (restrictions.length > 0) {
          restrictions.forEach((r) =>
            steps.push({ type: "text", text: `   x ≠ ${fmt(r)}` })
          );
        } else {
          steps.push({
            type: "text",
            text: "   No se encontraron valores excluidos.",
          });
        }
      }
    } catch { /* continúa */ }
  }

  if (hasSqrt) {
    steps.push({
      type: "step",
      text: `${hasFraction ? "Paso 2" : "Paso 1"} — La función tiene raíz cuadrada:`,
    });
    steps.push({
      type: "text",
      text: "   Regla: el radicando debe ser ≥ 0.",
    });
    try {
      const sqrtMatch = expr.match(/sqrt\((.+?)\)/);
      if (sqrtMatch) {
        const radicand = sqrtMatch[1];
        steps.push({ type: "eq", text: `Radicando: ${radicand} ≥ 0` });
        steps.push({ type: "text", text: `Resolvemos: ${radicand} ≥ 0` });
        steps.push({
          type: "text",
          text: "   La restricción limita el dominio inferior.",
        });
      }
    } catch { /* continúa */ }
  }

  if (hasLog) {
    steps.push({ type: "step", text: "Restricción logarítmica:" });
    steps.push({
      type: "text",
      text: "   Regla: el argumento del logaritmo debe ser > 0.",
    });
  }

  if (!hasFraction && !hasSqrt && !hasLog) {
    steps.push({
      type: "text",
      text: "No se detectan restricciones en la función.",
    });
    steps.push({
      type: "text",
      text: "Al ser una función polinómica, acepta cualquier número real.",
    });
  }

  steps.push({ type: "section", text: "[3] Dominio" });
  if (restrictions.length > 0) {
    const restrStr = restrictions.map((r) => `x ≠ ${fmt(r)}`).join(", ");
    steps.push({
      type: "text",
      text: `Dominio: ℝ excepto donde ${restrStr}`,
    });
    if (restrictions.length === 1) {
      const r = restrictions[0];
      steps.push({
        type: "eq",
        text: `D = (−∞, ${fmt(r)}) ∪ (${fmt(r)}, +∞)`,
      });
    }
  } else if (hasSqrt) {
    steps.push({ type: "eq", text: "D = [valor_mínimo, +∞)" });
    steps.push({
      type: "text",
      text: "Evalúa la inecuación del radicando para encontrar el valor exacto.",
    });
  } else {
    steps.push({ type: "eq", text: "D = (−∞, +∞)" });
    steps.push({
      type: "text",
      text: "La función está definida para todos los números reales.",
    });
  }

  steps.push({ type: "section", text: "[4] Rango" });
  const rangeVals = [];
  try {
    for (let x = -100; x <= 100; x += 0.5) {
      const v = math.evaluate(expr, { x });
      if (isFinite(v)) rangeVals.push(v);
    }
  } catch { /* continúa */ }
  if (rangeVals.length > 0) {
    const minV = Math.round(Math.min(...rangeVals) * 100) / 100;
    const maxV = Math.round(Math.max(...rangeVals) * 100) / 100;
    const range = maxV - minV;
    if (range > 150) steps.push({ type: "eq", text: "R = (−∞, +∞)" });
    else if (minV > -Infinity && maxV < Infinity) {
      steps.push({ type: "eq", text: `R ≈ [${fmt(minV)}, ${fmt(maxV)}]` });
      steps.push({
        type: "text",
        text: "Nota: rango aproximado evaluado en [-100, 100].",
      });
    }
  }

  steps.push({
    type: "result",
    text: "[✓] Resultado final — Dominio y rango calculados. Ver secciones [3] y [4].",
  });
  return steps;
}
