import * as math from "mathjs";
import { fmt } from "../utils/formatters.js";

export function solveDerivative(exprInput, displayInput = exprInput) {
  const steps = [];
  steps.push({ type: "section", text: "[1] Identificación" });
  steps.push({ type: "text", text: `Función: f(x) = ${displayInput}` });
  steps.push({ type: "text", text: "Operación: calcular la derivada f'(x)" });

  steps.push({ type: "section", text: "[2] Aplicar reglas de derivación" });
  steps.push({
    type: "step",
    text: "Paso 1 — Identificamos los términos de la función:",
  });

  let deriv;
  try {
    deriv = math.derivative(exprInput, "x");
  } catch {
    return [
      {
        type: "text",
        text: "No se pudo calcular la derivada. Verifica la expresión.",
      },
    ];
  }

  const simplified = math.simplify(deriv.toString()).toString();

  steps.push({ type: "text", text: "Se aplican las reglas:" });
  steps.push({ type: "text", text: "   • Regla de la potencia: d/dx(xⁿ) = n·xⁿ⁻¹" });
  steps.push({ type: "text", text: "   • Regla de la constante: d/dx(c) = 0" });
  steps.push({ type: "text", text: "   • Regla de la suma: d/dx(f+g) = f' + g'" });

  steps.push({ type: "step", text: "Paso 2 — Derivamos término a término:" });
  steps.push({ type: "eq", text: `f'(x) = ${deriv.toString()}` });

  steps.push({ type: "step", text: "Paso 3 — Simplificamos:" });
  steps.push({ type: "eq", text: `f'(x) = ${simplified}` });

  steps.push({ type: "section", text: "[3] Puntos críticos (donde f'(x) = 0)" });
  steps.push({ type: "step", text: "Paso 4 — Igualamos f'(x) = 0:" });
  steps.push({ type: "eq", text: `${simplified} = 0` });

  try {
    const critPoints = [];
    for (let x = -10; x <= 10; x += 0.05) {
      try {
        const v1 = math.evaluate(simplified, { x });
        const v2 = math.evaluate(simplified, { x: x + 0.05 });
        if (Math.sign(v1) !== Math.sign(v2) && isFinite(v1) && isFinite(v2)) {
          let lo = x,
            hi = x + 0.05;
          for (let it = 0; it < 40; it++) {
            const mid = (lo + hi) / 2;
            const vm = math.evaluate(simplified, { x: mid });
            if (Math.abs(vm) < 1e-8) { lo = mid; break; }
            if (
              Math.sign(vm) ===
              Math.sign(math.evaluate(simplified, { x: lo }))
            )
              lo = mid;
            else hi = mid;
          }
          const cp = Math.round(lo * 1e4) / 1e4;
          if (!critPoints.some((p) => Math.abs(p - cp) < 0.01))
            critPoints.push(cp);
        }
      } catch { /* continúa */ }
    }
    if (critPoints.length > 0) {
      critPoints.forEach((cp, i) => {
        steps.push({
          type: "text",
          text: `   x${i > 0 ? "₀₁₂₃"[i] || i + 1 : "₀"} = ${fmt(cp)} es un punto crítico`,
        });
      });
    } else {
      steps.push({
        type: "text",
        text: "   No se encontraron puntos críticos reales en [-10, 10]",
      });
    }
  } catch { /* sin puntos críticos */ }

  steps.push({
    type: "result",
    text: `[✓] Resultado final — f'(x) = ${simplified}`,
  });
  return steps;
}
