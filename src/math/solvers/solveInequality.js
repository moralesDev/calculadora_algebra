import * as math from "mathjs";
import { fmt } from "../utils/formatters.js";

// Invierte el signo de desigualdad
function flipSign(sign) {
  return sign === ">" ? "<" : sign === "<" ? ">" : sign === ">=" ? "<=" : ">=";
}

// Formatea el resultado como intervalo
function formatInterval(sign, val, isLinear = true) {
  if (!isLinear) return null;
  switch (sign) {
    case ">":  return `x ∈ (${fmt(val)}, +∞)`;
    case ">=": return `x ∈ [${fmt(val)}, +∞)`;
    case "<":  return `x ∈ (-∞, ${fmt(val)})`;
    case "<=": return `x ∈ (-∞, ${fmt(val)}]`;
    default:   return `x ${sign} ${fmt(val)}`;
  }
}

export function solveInequality(input, display = input) {
  const steps = [];

  // Detectar el signo de la desigualdad
  let sign;
  if (input.includes(">=") || input.includes("≥")) sign = ">=";
  else if (input.includes("<=") || input.includes("≤")) sign = "<=";
  else if (input.includes(">")) sign = ">";
  else if (input.includes("<")) sign = "<";
  else return null;

  // Normalizar signos Unicode
  const normalized = input.replace(/≥/g, ">=").replace(/≤/g, "<=");

  // Separar los dos lados
  const sepRegex = sign === ">=" ? />=/
                 : sign === "<=" ? /<=/
                 : sign === ">"  ? />/
                 :                 /</;
  const parts = normalized.split(sepRegex);
  if (parts.length !== 2) return null;

  const lhs = parts[0].trim();
  const rhs = parts[1].trim();

  steps.push({ type: "section", text: "[1] Identificación" });
  steps.push({ type: "text", text: `Inecuación: ${display}` });
  steps.push({ type: "text", text: `Signo de desigualdad: ${sign}` });
  steps.push({ type: "text", text: "Forma general: expresión  " + sign + "  expresión" });

  // Construir expresión unificada: lhs - rhs
  const combined = `(${lhs}) - (${rhs})`;
  let simplified;
  try {
    simplified = math.simplify(combined).toString();
  } catch {
    return [{ type: "text", text: "No se pudo simplificar la inecuación." }];
  }

  steps.push({ type: "section", text: "[2] Reorganizar" });
  steps.push({ type: "step", text: "Paso 1 — Pasamos todo al lado izquierdo:" });
  steps.push({ type: "eq", text: `${simplified} ${sign} 0` });

  // Detectar grado
  let maxDeg = 0;
  const degMatch = simplified.match(/x\s*\^\s*(\d+)/g);
  if (degMatch) maxDeg = Math.max(...degMatch.map((m) => parseInt(m.replace(/x\s*\^\s*/, ""))));
  else if (simplified.includes("x")) maxDeg = 1;

  // ── INECUACIÓN LINEAL ──────────────────────────────────────────────────
  if (maxDeg <= 1) {
    steps.push({ type: "section", text: "[3] Resolver inecuación lineal" });

    let a, b;
    try {
      const f = (x) => math.evaluate(simplified, { x });
      a = f(1) - f(0);
      b = f(0);
      a = Math.round(a * 1e6) / 1e6;
      b = Math.round(b * 1e6) / 1e6;
    } catch {
      return [{ type: "text", text: "No se pudieron extraer los coeficientes." }];
    }

    if (Math.abs(a) < 1e-10) {
      // Sin variable: b sign 0
      const holds = (sign === ">" && b > 0) || (sign === ">=" && b >= 0) ||
                    (sign === "<" && b < 0) || (sign === "<=" && b <= 0);
      steps.push({ type: "text", text: holds
        ? `La inecuación se reduce a ${fmt(b)} ${sign} 0, que es verdadera → cualquier valor de x es solución.`
        : `La inecuación se reduce a ${fmt(b)} ${sign} 0, que es falsa → no hay solución.`
      });
      steps.push({ type: "result", text: holds ? "[✓] Resultado — x ∈ ℝ (todos los reales)" : "[✓] Resultado — Sin solución" });
      return steps;
    }

    steps.push({ type: "step", text: "Paso 2 — Identificamos coeficientes:" });
    steps.push({ type: "text", text: `Coeficiente de x: a = ${fmt(a)}` });
    steps.push({ type: "text", text: `Término independiente: b = ${fmt(b)}` });

    steps.push({ type: "step", text: "Paso 3 — Despejamos x (dividimos entre a):" });
    if (a < 0) {
      steps.push({ type: "text", text: `⚠ Al dividir por a = ${fmt(a)} < 0, el signo de la desigualdad se invierte.` });
    }

    const x = -b / a;
    const finalSign = a < 0 ? flipSign(sign) : sign;

    steps.push({ type: "eq", text: `${fmt(a)}x ${sign} ${fmt(-b)}` });
    steps.push({ type: "eq", text: `x ${finalSign} ${fmt(-b)} / ${fmt(a)}` });
    steps.push({ type: "eq", text: `x ${finalSign} ${fmt(x)}` });

    steps.push({ type: "section", text: "[4] Expresar la solución" });
    const interval = formatInterval(finalSign, x);
    steps.push({ type: "text", text: `Solución: ${interval}` });
    steps.push({ type: "text", text: `Recta numérica: ←——${finalSign === "<" || finalSign === "<=" ? "●" : "○"}——→  con solución hacia la ${finalSign.startsWith("<") ? "izquierda" : "derecha"}` });
    steps.push({ type: "result", text: `[✓] Resultado final — x ${finalSign} ${fmt(x)}   →   ${interval}` });
    return steps;
  }

  // ── INECUACIÓN CUADRÁTICA ─────────────────────────────────────────────
  if (maxDeg === 2) {
    steps.push({ type: "section", text: "[3] Resolver inecuación cuadrática" });
    steps.push({ type: "text", text: "Primero encontramos las raíces de la ecuación asociada." });

    let a, b, c;
    try {
      const f = (x) => math.evaluate(simplified, { x });
      c = f(0);
      a = (f(1) - 2 * f(0) + f(-1)) / 2;
      b = f(1) - f(0) - a;
      a = Math.round(a * 1e6) / 1e6;
      b = Math.round(b * 1e6) / 1e6;
      c = Math.round(c * 1e6) / 1e6;
    } catch {
      return [{ type: "text", text: "No se pudieron extraer los coeficientes." }];
    }

    steps.push({ type: "text", text: `a = ${fmt(a)},  b = ${fmt(b)},  c = ${fmt(c)}` });

    const disc = b * b - 4 * a * c;
    steps.push({ type: "step", text: "Paso 2 — Discriminante:" });
    steps.push({ type: "eq", text: `Δ = b² − 4ac = ${fmt(disc)}` });

    if (disc < 0) {
      // Sin raíces reales: la parábola no corta el eje x
      const fAtZero = math.evaluate(simplified, { x: 0 });
      const parabUpward = a > 0;
      steps.push({ type: "text", text: `Δ < 0 → la parábola no corta el eje x.` });
      steps.push({ type: "text", text: `a ${a > 0 ? "> 0" : "< 0"} → parábola abierta hacia ${parabUpward ? "arriba" : "abajo"} → siempre ${parabUpward ? "positiva" : "negativa"}.` });
      const holds = (parabUpward && (sign === ">" || sign === ">=")) ||
                    (!parabUpward && (sign === "<" || sign === "<="));
      steps.push({ type: "result", text: holds
        ? "[✓] Resultado final — x ∈ ℝ (todos los reales)"
        : "[✓] Resultado final — Sin solución (inecuación nunca se cumple)"
      });
      return steps;
    }

    const sq = Math.sqrt(disc);
    const x1 = Math.round(((-b - sq) / (2 * a)) * 1e6) / 1e6;
    const x2 = Math.round(((-b + sq) / (2 * a)) * 1e6) / 1e6;
    const r1 = Math.min(x1, x2), r2 = Math.max(x1, x2);

    steps.push({ type: "step", text: "Paso 3 — Raíces de la ecuación asociada:" });
    steps.push({ type: "eq", text: `x₁ = ${fmt(r1)},  x₂ = ${fmt(r2)}` });

    steps.push({ type: "section", text: "[4] Analizar el signo según la parábola" });
    steps.push({ type: "text", text: `Parábola abierta hacia ${a > 0 ? "arriba (a > 0)" : "abajo (a < 0)"}:` });

    // Determinar la solución según el signo de 'a' y el tipo de desigualdad
    const strict = sign === ">" || sign === "<";
    let interval;

    if (a > 0) {
      // Parábola ↑: negativa entre raíces, positiva fuera
      if (sign === ">" || sign === ">=") {
        interval = `x ∈ (-∞, ${fmt(r1)}${strict ? ")" : "]"} ∪ ${strict ? "(" : "["}${fmt(r2)}, +∞)`;
        steps.push({ type: "text", text: "La expresión es positiva (> 0) fuera del intervalo [x₁, x₂]." });
      } else {
        interval = `x ∈ ${strict ? "(" : "["}${fmt(r1)}, ${fmt(r2)}${strict ? ")" : "]"}`;
        steps.push({ type: "text", text: "La expresión es negativa (< 0) dentro del intervalo [x₁, x₂]." });
      }
    } else {
      // Parábola ↓: positiva entre raíces, negativa fuera
      if (sign === ">" || sign === ">=") {
        interval = `x ∈ ${strict ? "(" : "["}${fmt(r1)}, ${fmt(r2)}${strict ? ")" : "]"}`;
        steps.push({ type: "text", text: "La expresión es positiva (> 0) dentro del intervalo [x₁, x₂]." });
      } else {
        interval = `x ∈ (-∞, ${fmt(r1)}${strict ? ")" : "]"} ∪ ${strict ? "(" : "["}${fmt(r2)}, +∞)`;
        steps.push({ type: "text", text: "La expresión es negativa (< 0) fuera del intervalo [x₁, x₂]." });
      }
    }

    steps.push({ type: "result", text: `[✓] Resultado final — ${interval}` });
    return steps;
  }

  // Grado > 2: análisis numérico básico
  steps.push({ type: "section", text: "[3] Inecuación de grado superior" });
  steps.push({ type: "text", text: "Para inecuaciones de grado > 2 se analizan los intervalos entre raíces." });
  steps.push({ type: "result", text: "[✓] Usa la gráfica para determinar los intervalos donde la expresión satisface la condición." });
  return steps;
}
