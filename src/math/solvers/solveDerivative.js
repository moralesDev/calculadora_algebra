import * as math from "mathjs";
import { fmt } from "../utils/formatters.js";

// Detecta qué reglas de derivación se aplican a la expresión
function detectRules(expr) {
  const e = expr.toLowerCase();
  const rules = [];

  const hasProduct = /[a-z0-9\)]\s*\*\s*[a-z\(]/.test(e);
  const hasDivision = e.includes("/");
  const hasChain = /\(.*x.*\)\s*\^|\bsqrt\(|\bsin\(|\bcos\(|\btan\(|\bexp\(|\bln\(|\blog\(/.test(e);
  const hasPow = /x\s*\^/.test(e);
  const hasExp = /e\s*\^\s*x|\bexp\(x|\d\s*\^\s*x/.test(e);
  const hasLog = e.includes("log(") || e.includes("ln(");
  const hasTrig = e.includes("sin(") || e.includes("cos(") || e.includes("tan(");

  if (hasProduct) rules.push("producto");
  if (hasDivision) rules.push("cociente");
  if (hasChain) rules.push("cadena");
  if (hasPow && !hasProduct && !hasDivision) rules.push("potencia");
  if (hasExp) rules.push("exponencial");
  if (hasLog) rules.push("logarítmica");
  if (hasTrig) rules.push("trigonométrica");
  if (rules.length === 0) rules.push("constante/suma");

  return rules;
}

// Genera explicación de las reglas detectadas
function explainRules(rules, steps) {
  steps.push({ type: "text", text: "Reglas a aplicar:" });

  if (rules.includes("potencia") || rules.includes("constante/suma")) {
    steps.push({ type: "text", text: "   • Regla de la potencia:  d/dx(xⁿ) = n·xⁿ⁻¹" });
    steps.push({ type: "text", text: "   • Regla de la constante: d/dx(c) = 0" });
    steps.push({ type: "text", text: "   • Regla de la suma:      d/dx(f + g) = f' + g'" });
  }
  if (rules.includes("producto")) {
    steps.push({ type: "text", text: "   • Regla del producto:    d/dx(u·v) = u'v + uv'" });
  }
  if (rules.includes("cociente")) {
    steps.push({ type: "text", text: "   • Regla del cociente:    d/dx(u/v) = (u'v − uv') / v²" });
  }
  if (rules.includes("cadena")) {
    steps.push({ type: "text", text: "   • Regla de la cadena:    d/dx(f(g(x))) = f'(g(x)) · g'(x)" });
  }
  if (rules.includes("exponencial")) {
    steps.push({ type: "text", text: "   • Derivada exponencial:  d/dx(eˣ) = eˣ  |  d/dx(aˣ) = aˣ·ln(a)" });
  }
  if (rules.includes("logarítmica")) {
    steps.push({ type: "text", text: "   • Derivada logarítmica:  d/dx(ln x) = 1/x  |  d/dx(log x) = 1/(x·ln 10)" });
  }
  if (rules.includes("trigonométrica")) {
    steps.push({ type: "text", text: "   • Derivadas trig:        d/dx(sin x) = cos x,  d/dx(cos x) = −sin x" });
  }
}

export function solveDerivative(exprInput, displayInput = exprInput) {
  const steps = [];

  steps.push({ type: "section", text: "[1] Identificación" });
  steps.push({ type: "text", text: `Función: f(x) = ${displayInput}` });
  steps.push({ type: "text", text: "Operación: calcular la derivada f'(x)" });

  const rules = detectRules(exprInput);
  const ruleLabel = rules.join(", ");

  steps.push({ type: "section", text: "[2] Reglas de derivación aplicables" });
  steps.push({ type: "text", text: `Tipo detectado: ${ruleLabel}` });
  explainRules(rules, steps);

  let deriv;
  try {
    deriv = math.derivative(exprInput, "x");
  } catch {
    return [{ type: "text", text: "No se pudo calcular la derivada. Verifica la expresión." }];
  }

  const derivStr = deriv.toString();
  let simplified;
  try {
    simplified = math.simplify(derivStr).toString();
  } catch {
    simplified = derivStr;
  }

  steps.push({ type: "section", text: "[3] Cálculo paso a paso" });

  // Si es regla del producto, intentar mostrar u y v
  if (rules.includes("producto")) {
    const parts = exprInput.split("*");
    if (parts.length === 2) {
      const u = parts[0].trim();
      const v = parts[1].trim();
      try {
        const du = math.simplify(math.derivative(u, "x").toString()).toString();
        const dv = math.simplify(math.derivative(v, "x").toString()).toString();
        steps.push({ type: "step", text: "Paso 1 — Identificamos u y v:" });
        steps.push({ type: "eq", text: `u = ${u}  →  u' = ${du}` });
        steps.push({ type: "eq", text: `v = ${v}  →  v' = ${dv}` });
        steps.push({ type: "step", text: "Paso 2 — Aplicamos la regla del producto:" });
        steps.push({ type: "eq", text: `f'(x) = u'v + uv' = (${du})(${v}) + (${u})(${dv})` });
      } catch { /* sin desglose */ }
    }
  }

  // Si es regla de la cadena, mostrar f(g(x))
  if (rules.includes("cadena") && !rules.includes("producto")) {
    steps.push({ type: "step", text: "Paso 1 — Identificamos función exterior e interior:" });
    steps.push({ type: "text", text: `   f(g(x)) donde g(x) es la función interior.` });
    steps.push({ type: "step", text: "Paso 2 — Aplicamos la regla de la cadena:" });
    steps.push({ type: "eq", text: "f'(x) = f'(g(x)) · g'(x)" });
  }

  steps.push({ type: "step", text: "Paso 3 — Derivada sin simplificar:" });
  steps.push({ type: "eq", text: `f'(x) = ${derivStr}` });

  steps.push({ type: "step", text: "Paso 4 — Simplificamos:" });
  steps.push({ type: "eq", text: `f'(x) = ${simplified}` });

  // Puntos críticos
  steps.push({ type: "section", text: "[4] Puntos críticos (f'(x) = 0)" });
  steps.push({ type: "step", text: "Paso 5 — Igualamos f'(x) = 0:" });
  steps.push({ type: "eq", text: `${simplified} = 0` });

  try {
    const critPoints = [];
    for (let x = -15; x <= 15; x += 0.05) {
      try {
        const v1 = math.evaluate(simplified, { x });
        const v2 = math.evaluate(simplified, { x: x + 0.05 });
        if (Math.sign(v1) !== Math.sign(v2) && isFinite(v1) && isFinite(v2)) {
          let lo = x, hi = x + 0.05;
          for (let it = 0; it < 50; it++) {
            const mid = (lo + hi) / 2;
            const vm = math.evaluate(simplified, { x: mid });
            if (Math.abs(vm) < 1e-9) { lo = mid; break; }
            if (Math.sign(vm) === Math.sign(math.evaluate(simplified, { x: lo }))) lo = mid;
            else hi = mid;
          }
          const cp = Math.round(lo * 1e4) / 1e4;
          if (!critPoints.some((p) => Math.abs(p - cp) < 0.01)) critPoints.push(cp);
        }
      } catch { /* continúa */ }
    }

    if (critPoints.length > 0) {
      steps.push({ type: "section", text: "[5] Análisis de puntos críticos" });
      critPoints.forEach((cp, i) => {
        const label = ["₁", "₂", "₃", "₄", "₅"][i] || (i + 1).toString();
        steps.push({ type: "step", text: `Punto crítico x${label} = ${fmt(cp)}:` });

        // Clasificar máximo/mínimo/inflexión por segunda derivada
        try {
          const d2 = math.derivative(simplified, "x");
          const d2val = math.evaluate(d2.toString(), { x: cp });
          if (d2val > 0.001) steps.push({ type: "text", text: `   f''(${fmt(cp)}) = ${fmt(d2val)} > 0 → mínimo local` });
          else if (d2val < -0.001) steps.push({ type: "text", text: `   f''(${fmt(cp)}) = ${fmt(d2val)} < 0 → máximo local` });
          else steps.push({ type: "text", text: `   f''(${fmt(cp)}) ≈ 0 → posible punto de inflexión` });
        } catch { /* sin segunda derivada */ }

        // Valor de f en el punto crítico
        try {
          // Evaluamos la función original
          const fval = math.evaluate(exprInput, { x: cp });
          steps.push({ type: "eq", text: `f(${fmt(cp)}) = ${fmt(Math.round(fval * 1e4) / 1e4)}` });
        } catch { /* sin evaluación */ }
      });
    } else {
      steps.push({ type: "text", text: "   No se encontraron puntos críticos reales en [−15, 15]." });
    }
  } catch { /* sin puntos críticos */ }

  steps.push({ type: "result", text: `[✓] Resultado final — f'(x) = ${simplified}` });
  return steps;
}
