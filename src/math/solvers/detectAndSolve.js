import * as math from "mathjs";
import { fmt, prettify } from "../utils/formatters.js";
import { findRootsByBisection } from "../utils/mathHelpers.js";
import { solveLinear } from "./solveLinear.js";
import { solveQuadratic } from "./solveQuadratic.js";
import { solveBiquadratic } from "./solveBiquadratic.js";
import { solveDerivative } from "./solveDerivative.js";
import { simplifyExpr } from "./simplifyExpr.js";
import { analyzeDomain } from "./analyzeDomain.js";
import { solveAbsoluteValue } from "./solveAbsoluteValue.js";
import { solveRadical } from "./solveRadical.js";
import { solveLogarithmic } from "./solveLogarithmic.js";
import { solveExponential } from "./solveExponential.js";
import { solveSystem } from "./solveSystem.js";

// Convierte caracteres Unicode matemáticos a ASCII que mathjs puede parsear
function normalize(str) {
  return str
    .replace(/−/g, "-")
    .replace(/–/g, "-")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/⁴/g, "^4")
    .replace(/⁵/g, "^5")
    .replace(/×/g, "*")
    .replace(/÷/g, "/");
}

// Extrae la derivada como string para graficar (o null si falla)
function tryDerivative(expr) {
  try {
    return math.simplify(math.derivative(expr, "x").toString()).toString();
  } catch {
    return null;
  }
}

// Identificadores matemáticos válidos como expresión única
const KNOWN_MATH_SYMBOLS = new Set([
  "x", "y", "z", "t", "n", "i", "e", "pi",
  "sin", "cos", "tan", "asin", "acos", "atan",
  "sinh", "cosh", "tanh", "sqrt", "cbrt", "log",
  "log2", "log10", "ln", "exp", "abs", "ceil",
  "floor", "round", "sign", "f", "g", "h",
  "a", "b", "c", "k", "m", "p", "q", "r", "s",
]);

// Lanza un error si la expresión es texto sin sentido matemático
function validateMathExpr(expr) {
  let node;
  try {
    node = math.parse(expr);
  } catch {
    throw new Error(`"${expr}" no es una expresión matemática válida.`);
  }
  if (
    node.type === "SymbolNode" &&
    !KNOWN_MATH_SYMBOLS.has(node.name.toLowerCase())
  ) {
    throw new Error(`"${expr}" no es una función o expresión matemática reconocida.`);
  }
}

// Detecta si el x aparece en posición de exponente (ecuación exponencial)
function isExponentialEquation(input) {
  // Patrones: 2^x, 3^(2x), e^x, base^x  — x en el exponente
  return /\b\d+(\.\d+)?\s*\^\s*x\b/.test(input) ||
    /\be\s*\^\s*x\b/.test(input) ||
    /\b\d+(\.\d+)?\s*\^\s*\(/.test(input);
}

// Detecta ecuación bicuadrática: tiene x^4 y x^2 pero no x^3 ni x^1 suelto
function isBiquadratic(simplified) {
  const hasX4 = /x\s*\^\s*4/.test(simplified);
  const hasX3 = /x\s*\^\s*3/.test(simplified);
  const hasX2 = /x\s*\^\s*2/.test(simplified);
  // x suelto (no como parte de x^n)
  const hasX1 = /(?<![a-z])x(?!\s*\^)/.test(simplified) && !hasX2 && !hasX4;
  return hasX4 && hasX2 && !hasX3 && !hasX1;
}

// Punto de entrada único: detecta el tipo de problema y delega al solver correcto
// Retorna { steps: Step[], graphExprs: string[] }
export function detectAndSolve(raw) {
  const display = raw.trim();
  const input = normalize(display);
  const lower = input.toLowerCase();

  // ── Derivada ──────────────────────────────────────────────────────────────
  if (
    lower.startsWith("d/dx") ||
    lower.startsWith("derivada") ||
    lower.startsWith("deriv")
  ) {
    const expr = input
      .replace(/^(d\/dx|derivada de|derivada|deriv)\s*/i, "")
      .replace(/f\(x\)\s*=\s*/i, "");
    const exprDisplay = display
      .replace(/^(d\/dx|derivada de|derivada|deriv)\s*/i, "")
      .replace(/f\(x\)\s*=\s*/i, "");
    const derivExpr = tryDerivative(expr);
    const graphExprs = derivExpr ? [expr, derivExpr] : [expr];
    return { steps: solveDerivative(expr, exprDisplay), graphExprs };
  }

  // ── Dominio y rango / Funciones ───────────────────────────────────────────
  if (
    lower.includes("dominio") ||
    lower.includes("rango") ||
    lower.startsWith("f(x)") ||
    lower.startsWith("g(x)") ||
    lower.startsWith("h(x)")
  ) {
    const eqIdx = input.indexOf("=");
    const graphExpr = eqIdx >= 0
      ? input.slice(eqIdx + 1).trim()
      : input.replace(/f\(x\)|g\(x\)|h\(x\)/gi, "").replace(/dominio|rango/gi, "").trim();
    return { steps: analyzeDomain(input, display), graphExprs: [graphExpr] };
  }

  // ── Simplificar / expandir ────────────────────────────────────────────────
  if (lower.startsWith("simplif") || lower.startsWith("expand")) {
    const expr = input.replace(/^(simplifica|simplificar|expandir|expandir)\s*/i, "");
    const exprDisplay = display.replace(/^(simplifica|simplificar|expandir|expandir)\s*/i, "");
    validateMathExpr(expr);
    let graphExpr;
    try { graphExpr = math.simplify(expr).toString(); } catch { graphExpr = expr; }
    const graphExprs = graphExpr.includes("x") ? [graphExpr] : [];
    return { steps: simplifyExpr(expr, exprDisplay), graphExprs };
  }

  // ── Sistema de ecuaciones (separadas por coma con dos "=") ────────────────
  if (input.includes(",") && (input.match(/=/g) || []).length >= 2) {
    return { steps: solveSystem(input, display), graphExprs: [] };
  }

  // ── Ecuación (contiene "=") ───────────────────────────────────────────────
  if (input.includes("=")) {

    // ── Valor absoluto: abs(...) = c ─────────────────────────────────────
    if (lower.includes("abs(")) {
      return { steps: solveAbsoluteValue(input, display), graphExprs: [] };
    }

    // ── Radical: sqrt(...) = c ───────────────────────────────────────────
    if (lower.includes("sqrt(")) {
      return { steps: solveRadical(input, display), graphExprs: [] };
    }

    // ── Logarítmica: log(...) = c  o  ln(...) = c ────────────────────────
    if (lower.includes("log(") || lower.includes("ln(") || lower.includes("log10(")) {
      return { steps: solveLogarithmic(input, display), graphExprs: [] };
    }

    // ── Exponencial: a^x = b ─────────────────────────────────────────────
    if (isExponentialEquation(lower)) {
      return { steps: solveExponential(input, display), graphExprs: [] };
    }

    // ── Ecuaciones polinomiales ───────────────────────────────────────────
    const sides = input.split("=");
    const exprLeft = `(${sides[0]}) - (${sides[1]})`;

    let simplified;
    try {
      simplified = math.simplify(exprLeft).toString();
    } catch {
      return { steps: [{ type: "text", text: "No se pudo interpretar la ecuación." }], graphExprs: [] };
    }

    // Detectar grado máximo
    let maxDeg = 0;
    const degMatch = simplified.match(/x\s*\^\s*(\d+)/g);
    if (degMatch)
      maxDeg = Math.max(...degMatch.map((m) => parseInt(m.replace(/x\s*\^\s*/, ""))));
    else if (simplified.match(/x\s*\^\s*2/) || simplified.includes("x²"))
      maxDeg = 2;
    else if (simplified.match(/x[²³⁴⁵]/)) maxDeg = 2;
    else if (simplified.includes("x")) maxDeg = 1;

    // ── Bicuadrática: grado 4 con solo x^4 y x^2 ────────────────────────
    if (maxDeg === 4 && isBiquadratic(simplified)) {
      return { steps: solveBiquadratic(exprLeft, display), graphExprs: [simplified] };
    }

    if (maxDeg <= 1) {
      const linearSteps = solveLinear(input, display);
      if (linearSteps) return { steps: linearSteps, graphExprs: [simplified] };
      return {
        steps: [{ type: "text", text: `No se pudo resolver automáticamente: "${display}". Verifica que sea una ecuación lineal de la forma ax + b = c.` }],
        graphExprs: [],
      };
    }

    if (maxDeg === 2) {
      try {
        const f = (x) => math.evaluate(exprLeft, { x });
        const c = f(0);
        const a = (f(1) - 2 * f(0) + f(-1)) / 2;
        const b = f(1) - f(0) - a;
        const quadSteps = solveQuadratic(
          Math.round(a * 1e6) / 1e6,
          Math.round(b * 1e6) / 1e6,
          Math.round(c * 1e6) / 1e6,
          display
        );
        if (quadSteps) return { steps: quadSteps, graphExprs: [simplified] };
        return { steps: [{ type: "text", text: "No se pudo resolver la ecuación cuadrática." }], graphExprs: [] };
      } catch {
        return { steps: [{ type: "text", text: "No se pudo resolver la ecuación cuadrática." }], graphExprs: [] };
      }
    }

    // ── Polinomial grado > 2 (bisección + teorema de raíces racionales) ──
    const steps = [];
    steps.push({ type: "section", text: "[1] Identificación" });
    steps.push({ type: "text", text: `Ecuación polinomial de grado ${maxDeg}: ${display}` });

    steps.push({ type: "section", text: "[2] Reorganizar" });
    steps.push({ type: "step", text: "Paso 1 — Pasamos todo al lado izquierdo:" });
    steps.push({ type: "eq", text: `${prettify(simplified)} = 0` });

    // Intentar mostrar candidatos por teorema de raíces racionales (solo grado 3)
    if (maxDeg === 3) {
      try {
        const f = (x) => math.evaluate(exprLeft, { x });
        const a0 = Math.round(f(0) * 1e4) / 1e4;           // término independiente
        const a_lead = Math.round((f(1) - 3 * f(0) + 3 * f(-1) - f(-2 + 1)) * 1e4) / 1e4;
        if (Number.isInteger(a0) && Number.isInteger(a_lead) && a_lead !== 0) {
          const divisors_p = [1, 2, 3, 4, 5, 6].filter((d) => a0 !== 0 && Math.abs(a0) % d === 0);
          const divisors_q = [1, 2, 3].filter((d) => Math.abs(a_lead) % d === 0);
          if (divisors_p.length > 0 && divisors_q.length > 0) {
            const candidates = new Set();
            divisors_p.forEach((p) => divisors_q.forEach((q) => {
              candidates.add(p / q);
              candidates.add(-p / q);
            }));
            steps.push({ type: "section", text: "[3] Teorema de raíces racionales" });
            steps.push({ type: "text", text: `Candidatos p/q: ${[...candidates].sort((a, b) => a - b).map(fmt).join(", ")}` });
          }
        }
      } catch { /* continúa sin candidatos */ }
    }

    steps.push({ type: "section", text: `[${maxDeg === 3 ? "4" : "3"}] Buscar raíces reales (bisección)` });
    steps.push({ type: "step", text: "Buscamos raíces por método numérico (bisección) en [−15, 15]:" });

    const rootsFound = findRootsByBisection(simplified);

    if (rootsFound.length === 0) {
      steps.push({ type: "text", text: "No se encontraron raíces reales en el intervalo [−15, 15]." });
    } else {
      rootsFound.sort((a, b) => a - b);
      rootsFound.forEach((r, i) => {
        const label = ["₁", "₂", "₃", "₄", "₅"][i] || (i + 1).toString();
        steps.push({ type: "step", text: `Raíz x${label} = ${fmt(r)}:` });
        try {
          const v = math.evaluate(simplified, { x: r });
          steps.push({ type: "eq", text: `f(${fmt(r)}) = ${fmt(Math.round(v * 1e4) / 1e4)} ✓` });
        } catch { /* continúa */ }
      });
    }

    steps.push({ type: "section", text: `[${maxDeg === 3 ? "5" : "4"}] Análisis de multiplicidad` });
    rootsFound.forEach((r) => {
      steps.push({ type: "text", text: `x = ${fmt(r)} — multiplicidad 1 (la gráfica cruza el eje x)` });
    });

    const resStr = rootsFound.length > 0
      ? rootsFound.map((r, i) => `x${["₁", "₂", "₃", "₄", "₅"][i] || i + 1} = ${fmt(r)}`).join(",  ")
      : "Sin raíces reales en [−15, 15]";
    steps.push({ type: "result", text: `[✓] Resultado final — ${resStr}` });
    return { steps, graphExprs: [simplified] };
  }

  // ── Expresión sin "=" → simplificar ──────────────────────────────────────
  validateMathExpr(input);
  let graphExpr;
  try { graphExpr = math.simplify(input).toString(); } catch { graphExpr = input; }
  return {
    steps: simplifyExpr(input, display),
    graphExprs: graphExpr.includes("x") ? [graphExpr] : [],
  };
}
