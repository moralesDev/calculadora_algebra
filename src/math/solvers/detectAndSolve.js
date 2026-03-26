import * as math from "mathjs";
import { fmt, prettify } from "../utils/formatters.js";
import { findRootsByBisection } from "../utils/mathHelpers.js";
import { solveLinear } from "./solveLinear.js";
import { solveQuadratic } from "./solveQuadratic.js";
import { solveDerivative } from "./solveDerivative.js";
import { simplifyExpr } from "./simplifyExpr.js";
import { analyzeDomain } from "./analyzeDomain.js";

// Convierte caracteres Unicode matemáticos a ASCII que mathjs puede parsear
function normalize(str) {
  return str
    .replace(/−/g, "-")      // U+2212 menos tipográfico → guion
    .replace(/–/g, "-")      // U+2013 guion largo → guion
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
  // Un símbolo suelto no reconocido (ej: "ergergertg") es texto sin sentido
  if (
    node.type === "SymbolNode" &&
    !KNOWN_MATH_SYMBOLS.has(node.name.toLowerCase())
  ) {
    throw new Error(`"${expr}" no es una función o expresión matemática reconocida.`);
  }
}

// Punto de entrada único: detecta el tipo de problema y delega al solver correcto
// Retorna { steps: Step[], graphExprs: string[] }
export function detectAndSolve(raw) {
  const display = raw.trim();          // versión original para mostrar al usuario
  const input = normalize(display);    // versión ASCII para mathjs
  const lower = input.toLowerCase();

  // ── Derivada ─────────────────────────────────────────────────────────────
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

  // ── Dominio y rango ───────────────────────────────────────────────────────
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

  // ── Ecuación (contiene "=") ───────────────────────────────────────────────
  if (input.includes("=")) {
    const sides = input.split("=");
    const exprLeft = `(${sides[0]}) - (${sides[1]})`;

    let simplified;
    try {
      simplified = math.simplify(exprLeft).toString();
    } catch {
      return { steps: [{ type: "text", text: "No se pudo interpretar la ecuación." }], graphExprs: [] };
    }

    // Detectar grado máximo
    // math.simplify() devuelve "x ^ 2" con espacios, por eso el regex tolera espacios alrededor de ^
    let maxDeg = 0;
    const degMatch = simplified.match(/x\s*\^\s*(\d+)/g);
    if (degMatch)
      maxDeg = Math.max(...degMatch.map((m) => parseInt(m.replace(/x\s*\^\s*/, ""))));
    else if (simplified.match(/x\s*\^\s*2/) || simplified.includes("x²"))
      maxDeg = 2;
    else if (simplified.match(/x[²³⁴⁵]/)) maxDeg = 2;
    else if (simplified.includes("x")) maxDeg = 1;

    if (maxDeg <= 1)
      return { steps: solveLinear(input, display), graphExprs: [simplified] };

    if (maxDeg === 2) {
      try {
        const f = (x) => math.evaluate(exprLeft, { x });
        const c = f(0);
        const a = (f(1) - 2 * f(0) + f(-1)) / 2;
        const b = f(1) - f(0) - a;
        return {
          steps: solveQuadratic(
            Math.round(a * 1e6) / 1e6,
            Math.round(b * 1e6) / 1e6,
            Math.round(c * 1e6) / 1e6,
            display
          ),
          graphExprs: [simplified],
        };
      } catch {
        return { steps: [{ type: "text", text: "No se pudo resolver la ecuación cuadrática." }], graphExprs: [] };
      }
    }

    // Polinomial grado > 2
    const steps = [];
    steps.push({ type: "section", text: "[1] Identificación" });
    steps.push({ type: "text", text: `Ecuación polinomial de grado ${maxDeg}: ${display}` });

    steps.push({ type: "section", text: "[2] Reorganizar" });
    steps.push({ type: "step", text: "Paso 1 — Pasamos todo al lado izquierdo:" });
    steps.push({ type: "eq", text: `${prettify(simplified)} = 0` });

    steps.push({ type: "section", text: "[3] Buscar raíces reales" });
    steps.push({ type: "step", text: "Paso 2 — Buscamos raíces por método numérico (bisección):" });

    const rootsFound = findRootsByBisection(simplified);

    if (rootsFound.length === 0) {
      steps.push({ type: "text", text: "No se encontraron raíces reales en el intervalo [-15, 15]." });
    } else {
      rootsFound.sort((a, b) => a - b);
      rootsFound.forEach((r, i) => {
        steps.push({ type: "step", text: `Paso ${i + 3} — Raíz x${["₁", "₂", "₃", "₄", "₅"][i] || i + 1} = ${fmt(r)}:` });
        try {
          const v = math.evaluate(simplified, { x: r });
          steps.push({ type: "eq", text: `f(${fmt(r)}) = ${fmt(Math.round(v * 1e4) / 1e4)} ✓` });
        } catch { /* continúa */ }
      });
    }

    steps.push({ type: "section", text: "[4] Análisis de multiplicidad" });
    rootsFound.forEach((r) => {
      steps.push({ type: "text", text: `x = ${fmt(r)} — multiplicidad 1 (la gráfica cruza el eje x)` });
    });

    const resStr = rootsFound.length > 0
      ? rootsFound.map((r, i) => `x${["₁", "₂", "₃", "₄", "₅"][i] || i + 1} = ${fmt(r)}`).join(",  ")
      : "Sin raíces reales en [-15, 15]";
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
