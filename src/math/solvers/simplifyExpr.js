import * as math from "mathjs";

export function simplifyExpr(exprInput, displayInput = exprInput) {
  const steps = [];
  steps.push({ type: "section", text: "[1] Expresión original" });
  steps.push({ type: "eq", text: displayInput });

  steps.push({ type: "section", text: "[2] Proceso de simplificación" });
  steps.push({ type: "step", text: "Paso 1 — Expandimos la expresión:" });

  let expanded;
  try {
    expanded = math.expand(exprInput).toString();
  } catch {
    expanded = exprInput;
  }
  steps.push({ type: "eq", text: expanded });

  steps.push({ type: "step", text: "Paso 2 — Agrupamos términos semejantes:" });
  let simplified;
  try {
    simplified = math.simplify(exprInput).toString();
  } catch {
    simplified = expanded;
  }
  steps.push({ type: "eq", text: simplified });

  steps.push({ type: "step", text: "Paso 3 — Forma final simplificada:" });
  steps.push({ type: "eq", text: simplified });

  steps.push({ type: "result", text: `[✓] Resultado final — ${simplified}` });
  return steps;
}
