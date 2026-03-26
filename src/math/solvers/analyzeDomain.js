import * as math from "mathjs";
import { fmt } from "../utils/formatters.js";

// Detecta el tipo de función para dar análisis especializado
function detectFunctionType(expr) {
  const e = expr.toLowerCase();
  const hasFraction = e.includes("/");
  const hasSqrt = e.includes("sqrt");
  const hasLog = e.includes("log") || e.includes("ln(");
  // Exponencial: base^x donde x está en el exponente (no es polinomio)
  const hasExp = /\d+\s*\^\s*x|\^x\b|e\s*\^\s*x/.test(e);
  const hasTrig = e.includes("sin") || e.includes("cos") || e.includes("tan");

  if (hasLog) return "logarithmic";
  if (hasExp) return "exponential";
  if (hasSqrt) return "radical";
  if (hasFraction) return "rational";
  if (hasTrig) return "trigonometric";

  // Detectar grado para polinomios
  const degMatch = expr.match(/x\s*\^\s*(\d+)/g);
  let maxDeg = 0;
  if (degMatch) maxDeg = Math.max(...degMatch.map((m) => parseInt(m.replace(/x\s*\^\s*/, ""))));
  else if (expr.includes("x^2") || expr.includes("x²")) maxDeg = 2;
  else if (expr.includes("x")) maxDeg = 1;

  if (maxDeg >= 2) return "quadratic";
  if (maxDeg === 1) return "linear";
  return "constant";
}

// ── Análisis lineal ────────────────────────────────────────────────────────
function analyzeLinear(expr, displayExpr, steps) {
  steps.push({ type: "text", text: "Tipo: función lineal f(x) = mx + b" });

  let m, b;
  try {
    m = math.evaluate(math.derivative(expr, "x").toString(), {});
    b = math.evaluate(expr, { x: 0 });
    m = Math.round(m * 1e6) / 1e6;
    b = Math.round(b * 1e6) / 1e6;
  } catch {
    steps.push({ type: "text", text: "No se pudieron extraer los coeficientes." });
    return;
  }

  steps.push({ type: "section", text: "[2] Propiedades de la función lineal" });
  steps.push({ type: "text", text: `Pendiente: m = ${fmt(m)}` });
  steps.push({ type: "text", text: `Intersección con eje y: b = ${fmt(b)}  → punto (0, ${fmt(b)})` });

  if (Math.abs(m) > 1e-9) {
    const xIntercept = -b / m;
    steps.push({ type: "text", text: `Intersección con eje x: x = −b/m = ${fmt(xIntercept)}  → punto (${fmt(xIntercept)}, 0)` });
  } else {
    steps.push({ type: "text", text: "Pendiente = 0 → función constante, no corta el eje x (salvo que b = 0)." });
  }

  if (m > 0) steps.push({ type: "text", text: "Comportamiento: función creciente (m > 0)." });
  else if (m < 0) steps.push({ type: "text", text: "Comportamiento: función decreciente (m < 0)." });

  steps.push({ type: "section", text: "[3] Dominio" });
  steps.push({ type: "eq", text: "D = (−∞, +∞) = ℝ" });
  steps.push({ type: "text", text: "Una función lineal está definida para todos los reales." });

  steps.push({ type: "section", text: "[4] Rango" });
  if (Math.abs(m) > 1e-9) {
    steps.push({ type: "eq", text: "R = (−∞, +∞) = ℝ" });
    steps.push({ type: "text", text: "Una línea no horizontal recorre todos los valores." });
  } else {
    steps.push({ type: "eq", text: `R = {${fmt(b)}}` });
    steps.push({ type: "text", text: "Función constante: el rango es un único valor." });
  }

  steps.push({ type: "result", text: `[✓] Resultado — f(x) = ${fmt(m)}x + ${fmt(b)} | D = ℝ, R = ℝ, pendiente = ${fmt(m)}` });
}

// ── Análisis cuadrático ────────────────────────────────────────────────────
function analyzeQuadratic(expr, displayExpr, steps) {
  steps.push({ type: "text", text: "Tipo: función cuadrática f(x) = ax² + bx + c" });

  let a, b, c;
  try {
    const f = (x) => math.evaluate(expr, { x });
    c = f(0);
    a = (f(1) - 2 * f(0) + f(-1)) / 2;
    b = f(1) - f(0) - a;
    a = Math.round(a * 1e6) / 1e6;
    b = Math.round(b * 1e6) / 1e6;
    c = Math.round(c * 1e6) / 1e6;
  } catch {
    steps.push({ type: "text", text: "No se pudieron extraer los coeficientes." });
    return;
  }

  steps.push({ type: "section", text: "[2] Coeficientes" });
  steps.push({ type: "text", text: `a = ${fmt(a)}  (apertura: ${a > 0 ? "hacia arriba ∪" : "hacia abajo ∩"})` });
  steps.push({ type: "text", text: `b = ${fmt(b)},  c = ${fmt(c)}` });

  const h = -b / (2 * a);
  const k = a * h * h + b * h + c;
  const hr = Math.round(h * 1e6) / 1e6;
  const kr = Math.round(k * 1e6) / 1e6;

  steps.push({ type: "section", text: "[3] Vértice y eje de simetría" });
  steps.push({ type: "step", text: "Vértice (h, k) donde h = −b/2a:" });
  steps.push({ type: "eq", text: `h = −(${fmt(b)}) / (2·${fmt(a)}) = ${fmt(hr)}` });
  steps.push({ type: "eq", text: `k = f(${fmt(hr)}) = ${fmt(kr)}` });
  steps.push({ type: "eq", text: `Vértice = (${fmt(hr)}, ${fmt(kr)})` });
  steps.push({ type: "text", text: `Eje de simetría: x = ${fmt(hr)}` });

  steps.push({ type: "section", text: "[4] Intersecciones" });
  steps.push({ type: "text", text: `Intersección eje y: (0, ${fmt(c)})` });
  const disc = b * b - 4 * a * c;
  steps.push({ type: "text", text: `Discriminante: Δ = ${fmt(disc)}` });
  if (disc > 0) {
    const x1 = (-b + Math.sqrt(disc)) / (2 * a);
    const x2 = (-b - Math.sqrt(disc)) / (2 * a);
    steps.push({ type: "text", text: `Intersecciones eje x: (${fmt(x1)}, 0) y (${fmt(x2)}, 0)` });
  } else if (disc === 0) {
    const x1 = -b / (2 * a);
    steps.push({ type: "text", text: `Tangente al eje x: (${fmt(x1)}, 0) — raíz doble` });
  } else {
    steps.push({ type: "text", text: "No corta el eje x (Δ < 0)." });
  }

  steps.push({ type: "section", text: "[5] Dominio y Rango" });
  steps.push({ type: "eq", text: "D = (−∞, +∞) = ℝ" });
  if (a > 0) steps.push({ type: "eq", text: `R = [${fmt(kr)}, +∞)` });
  else steps.push({ type: "eq", text: `R = (−∞, ${fmt(kr)}]` });

  steps.push({ type: "result", text: `[✓] Resultado — Vértice (${fmt(hr)}, ${fmt(kr)}), eje x = ${fmt(hr)}, Δ = ${fmt(disc)}` });
}

// ── Análisis racional ──────────────────────────────────────────────────────
function analyzeRational(expr, displayExpr, steps) {
  steps.push({ type: "text", text: "Tipo: función racional f(x) = p(x)/q(x)" });

  steps.push({ type: "section", text: "[2] Asíntotas verticales" });
  steps.push({ type: "step", text: "Buscamos donde el denominador = 0:" });

  const vertAsymptotes = [];
  try {
    for (let x = -20; x <= 20; x += 0.001) {
      try {
        const v = Math.abs(math.evaluate(expr, { x }));
        if (!isFinite(v) || v > 1e6) {
          const xr = Math.round(x * 100) / 100;
          if (!vertAsymptotes.some((a) => Math.abs(a - xr) < 0.05))
            vertAsymptotes.push(xr);
        }
      } catch { /* continúa */ }
    }
  } catch { /* continúa */ }

  if (vertAsymptotes.length > 0) {
    vertAsymptotes.forEach((va) => {
      steps.push({ type: "eq", text: `Asíntota vertical: x = ${fmt(va)}` });
    });
  } else {
    steps.push({ type: "text", text: "No se detectaron asíntotas verticales en [-20, 20]." });
  }

  steps.push({ type: "section", text: "[3] Asíntota horizontal" });
  try {
    const limInf = math.evaluate(expr, { x: 1e6 });
    const limMinInf = math.evaluate(expr, { x: -1e6 });
    if (isFinite(limInf) && Math.abs(limInf - limMinInf) < 1e-3) {
      const lim = Math.round(limInf * 1e4) / 1e4;
      steps.push({ type: "eq", text: `Asíntota horizontal: y = ${fmt(lim)}` });
      steps.push({ type: "text", text: `lim(x→±∞) f(x) = ${fmt(lim)}` });
    } else {
      steps.push({ type: "text", text: "No existe asíntota horizontal (grado numerador > grado denominador)." });
    }
  } catch { /* continúa */ }

  steps.push({ type: "section", text: "[4] Dominio" });
  if (vertAsymptotes.length > 0) {
    const excl = vertAsymptotes.map((v) => `x ≠ ${fmt(v)}`).join(", ");
    steps.push({ type: "eq", text: `D = ℝ  excepto  {${excl}}` });
  } else {
    steps.push({ type: "eq", text: "D = (−∞, +∞) = ℝ" });
  }

  steps.push({ type: "section", text: "[5] Rango (aproximado)" });
  const rangeVals = [];
  try {
    for (let x = -50; x <= 50; x += 0.1) {
      const v = math.evaluate(expr, { x });
      if (isFinite(v) && Math.abs(v) < 1e4) rangeVals.push(v);
    }
  } catch { /* continúa */ }
  if (rangeVals.length > 0) {
    const minV = Math.round(Math.min(...rangeVals) * 100) / 100;
    const maxV = Math.round(Math.max(...rangeVals) * 100) / 100;
    steps.push({ type: "eq", text: `R ≈ [${fmt(minV)}, ${fmt(maxV)}]  (evaluado en [-50, 50])` });
  }

  const res = vertAsymptotes.length > 0
    ? vertAsymptotes.map((v) => `x = ${fmt(v)}`).join(", ")
    : "Sin asíntotas verticales";
  steps.push({ type: "result", text: `[✓] Resultado — Asíntotas verticales: ${res}` });
}

// ── Análisis radical ───────────────────────────────────────────────────────
function analyzeRadical(expr, displayExpr, steps) {
  steps.push({ type: "text", text: "Tipo: función radical  f(x) = √(expresión)" });

  const sqrtMatch = expr.match(/sqrt\((.+?)\)/i);
  const radicand = sqrtMatch ? sqrtMatch[1].trim() : null;

  steps.push({ type: "section", text: "[2] Condición del radicando" });
  if (radicand) {
    steps.push({ type: "step", text: "Para que f(x) esté definida, el radicando debe ser ≥ 0:" });
    steps.push({ type: "eq", text: `${radicand} ≥ 0` });
  }

  steps.push({ type: "section", text: "[3] Dominio" });
  let domainMin = null;
  if (radicand) {
    try {
      for (let x = -100; x <= 100; x += 0.01) {
        if (math.evaluate(radicand, { x }) >= 0) {
          domainMin = Math.round(x * 100) / 100;
          break;
        }
      }
    } catch { /* continúa */ }
  }

  if (domainMin !== null) {
    steps.push({ type: "eq", text: `D = [${fmt(domainMin)}, +∞)` });
    steps.push({ type: "text", text: `La función existe para x ≥ ${fmt(domainMin)}.` });
  } else {
    steps.push({ type: "eq", text: "D = (−∞, +∞) = ℝ  (radicando siempre positivo)" });
  }

  steps.push({ type: "section", text: "[4] Rango" });
  steps.push({ type: "eq", text: "R = [0, +∞)" });
  steps.push({ type: "text", text: "La raíz cuadrada siempre es ≥ 0." });

  const domStr = domainMin !== null ? `[${fmt(domainMin)}, +∞)` : "ℝ";
  steps.push({ type: "result", text: `[✓] Resultado — D = ${domStr}, R = [0, +∞)` });
}

// ── Análisis exponencial ───────────────────────────────────────────────────
function analyzeExponential(expr, displayExpr, steps) {
  steps.push({ type: "text", text: "Tipo: función exponencial  f(x) = a^x" });

  // Detectar la base
  const baseMatch = expr.match(/^(.+?)\s*\^\s*x/);
  const base = baseMatch ? baseMatch[1].trim() : "a";
  let baseVal;
  try { baseVal = math.evaluate(base); } catch { baseVal = null; }

  steps.push({ type: "section", text: "[2] Propiedades de la función exponencial" });
  steps.push({ type: "text", text: `Base: a = ${base}` });
  if (baseVal !== null) {
    if (baseVal > 1) steps.push({ type: "text", text: `a = ${fmt(baseVal)} > 1 → función creciente.` });
    else if (baseVal > 0) steps.push({ type: "text", text: `0 < a = ${fmt(baseVal)} < 1 → función decreciente.` });
  }
  steps.push({ type: "text", text: "Punto de referencia: f(0) = a⁰ = 1 → pasa por (0, 1)." });
  steps.push({ type: "text", text: "Asíntota horizontal: y = 0 (eje x)." });

  steps.push({ type: "section", text: "[3] Dominio" });
  steps.push({ type: "eq", text: "D = (−∞, +∞) = ℝ" });
  steps.push({ type: "text", text: "El exponente x puede ser cualquier número real." });

  steps.push({ type: "section", text: "[4] Rango" });
  steps.push({ type: "eq", text: "R = (0, +∞)" });
  steps.push({ type: "text", text: "Una función exponencial con base positiva siempre es positiva." });

  steps.push({ type: "result", text: `[✓] Resultado — D = ℝ, R = (0, +∞), asíntota y = 0, pasa por (0, 1)` });
}

// ── Análisis logarítmico ───────────────────────────────────────────────────
function analyzeLogarithmic(expr, displayExpr, steps) {
  steps.push({ type: "text", text: "Tipo: función logarítmica  f(x) = log(x) o ln(x)" });

  const isLn = expr.includes("ln(");
  const baseLabel = isLn ? "e" : "10";
  const funcLabel = isLn ? "ln" : "log";

  const logMatch = expr.match(/(log10|log|ln)\((.+)\)/i);
  const logArg = logMatch ? logMatch[2].trim() : "x";

  steps.push({ type: "section", text: "[2] Condición del dominio" });
  steps.push({ type: "step", text: "El argumento del logaritmo debe ser estrictamente positivo:" });
  steps.push({ type: "eq", text: `${logArg} > 0` });

  let domainMin = null;
  try {
    for (let x = -50; x <= 50; x += 0.01) {
      if (math.evaluate(logArg, { x }) > 0) {
        domainMin = Math.round(x * 100) / 100;
        break;
      }
    }
  } catch { /* continúa */ }

  steps.push({ type: "section", text: "[3] Propiedades" });
  steps.push({ type: "text", text: `Función: ${funcLabel}(${logArg})` });
  steps.push({ type: "text", text: `Base: ${baseLabel}` });
  steps.push({ type: "text", text: `Punto de referencia: ${funcLabel}(1) = 0 → corta el eje x.` });
  steps.push({ type: "text", text: "Asíntota vertical: x = 0 (o donde el argumento = 0)." });
  steps.push({ type: "text", text: "Función creciente para base > 1." });

  steps.push({ type: "section", text: "[4] Dominio" });
  if (domainMin !== null) {
    steps.push({ type: "eq", text: `D = (${fmt(domainMin)}, +∞)` });
  } else {
    steps.push({ type: "eq", text: "D = (0, +∞)" });
  }

  steps.push({ type: "section", text: "[5] Rango" });
  steps.push({ type: "eq", text: "R = (−∞, +∞) = ℝ" });
  steps.push({ type: "text", text: "El logaritmo puede tomar cualquier valor real." });

  const domStr = domainMin !== null ? `(${fmt(domainMin)}, +∞)` : "(0, +∞)";
  steps.push({ type: "result", text: `[✓] Resultado — D = ${domStr}, R = ℝ, asíntota vertical en argumento = 0` });
}

// ── Entrada principal ──────────────────────────────────────────────────────
export function analyzeDomain(exprInput, displayInput = exprInput) {
  const steps = [];
  const expr = exprInput.replace(/f\(x\)\s*=\s*/i, "").trim();
  const displayExpr = displayInput.replace(/f\(x\)\s*=\s*/i, "").trim();

  steps.push({ type: "section", text: "[1] Identificación de la función" });
  steps.push({ type: "text", text: `f(x) = ${displayExpr}` });

  const type = detectFunctionType(expr);

  if (type === "linear") {
    analyzeLinear(expr, displayExpr, steps);
    return steps;
  }
  if (type === "quadratic") {
    analyzeQuadratic(expr, displayExpr, steps);
    return steps;
  }
  if (type === "rational") {
    analyzeRational(expr, displayExpr, steps);
    return steps;
  }
  if (type === "radical") {
    analyzeRadical(expr, displayExpr, steps);
    return steps;
  }
  if (type === "exponential") {
    analyzeExponential(expr, displayExpr, steps);
    return steps;
  }
  if (type === "logarithmic") {
    analyzeLogarithmic(expr, displayExpr, steps);
    return steps;
  }

  // Fallback genérico para funciones no clasificadas
  steps.push({ type: "text", text: "Función general — análisis básico de dominio." });
  steps.push({ type: "section", text: "[2] Dominio" });
  steps.push({ type: "eq", text: "D = (−∞, +∞) = ℝ" });
  steps.push({ type: "section", text: "[3] Rango (aproximado)" });
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
    steps.push({ type: "eq", text: `R ≈ [${fmt(minV)}, ${fmt(maxV)}]` });
  }
  steps.push({ type: "result", text: "[✓] Resultado final — Dominio y rango calculados." });
  return steps;
}
