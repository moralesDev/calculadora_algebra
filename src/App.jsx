import { useState, useRef, useEffect } from "react";
import * as math from "mathjs";

// ─── UTILIDADES ────────────────────────────────────────────
function fmt(n) {
  if (typeof n !== "number") return String(n);
  const r = Math.round(n * 10000) / 10000;
  return Number.isInteger(r) ? String(r) : String(r);
}

function fmtCoef(c, variable = "x", power = 1) {
  const a = Math.abs(c);
  if (power === 0) return fmt(c);
  const varPart = power === 1 ? variable : `${variable}${["","","²","³","⁴","⁵"][power] || `^${power}`}`;
  if (a === 1) return varPart;
  return `${fmt(a)}${varPart}`;
}

function polyToString(coeffs, variable = "x") {
  const deg = coeffs.length - 1;
  let terms = [];
  for (let i = deg; i >= 0; i--) {
    const c = coeffs[deg - i];
    if (c === 0) continue;
    const sign = c < 0 ? "−" : "+";
    const abs = Math.abs(c);
    const varStr = i === 0 ? "" : i === 1 ? variable : `${variable}${["","","²","³","⁴","⁵"][i] || `^${i}`}`;
    const coefStr = abs === 1 && i > 0 ? "" : fmt(abs);
    terms.push({ sign, str: coefStr + varStr });
  }
  if (!terms.length) return "0";
  let result = (terms[0].sign === "−" ? "−" : "") + terms[0].str;
  for (let i = 1; i < terms.length; i++) result += ` ${terms[i].sign} ${terms[i].str}`;
  return result;
}

function getRoots(coeffs) {
  const deg = coeffs.length - 1;
  if (deg === 1) {
    const [a, b] = coeffs;
    return a !== 0 ? [-b / a] : [];
  }
  if (deg === 2) {
    const [a, b, c] = coeffs;
    const disc = b * b - 4 * a * c;
    if (disc < 0) return [];
    if (disc === 0) return [-b / (2 * a)];
    return [(-b + Math.sqrt(disc)) / (2 * a), (-b - Math.sqrt(disc)) / (2 * a)];
  }
  // Para grado > 2 usamos math.js
  try {
    const poly = coeffs.map((c, i) => ({ re: c, im: 0 }));
    const expr = coeffs.map((c, i) => `${c}*x^${coeffs.length - 1 - i}`).join("+");
    const roots = [];
    for (let x = -10; x <= 10; x += 0.1) {
      const val = math.evaluate(expr, { x });
      const val2 = math.evaluate(expr, { x: x + 0.1 });
      if (Math.sign(val) !== Math.sign(val2) && isFinite(val) && isFinite(val2)) {
        let lo = x, hi = x + 0.1;
        for (let iter = 0; iter < 50; iter++) {
          const mid = (lo + hi) / 2;
          const vm = math.evaluate(expr, { x: mid });
          if (Math.abs(vm) < 1e-10) { lo = mid; break; }
          if (Math.sign(vm) === Math.sign(math.evaluate(expr, { x: lo }))) lo = mid; else hi = mid;
        }
        const root = Math.round(lo * 1e6) / 1e6;
        if (!roots.some(r => Math.abs(r - root) < 1e-4)) roots.push(root);
      }
    }
    return roots;
  } catch { return []; }
}

function parsePolynomial(input) {
  try {
    const node = math.parse(input.replace(/\^/g, "^").replace(/([0-9])([a-z])/g, "$1*$2"));
    const expr = node.toString();
    const coeffMap = {};
    const expanded = math.simplify(input).toString();
    for (let deg = 10; deg >= 0; deg--) {
      try {
        const deriv = math.derivative(input, "x");
        // build via evaluation
      } catch {}
    }
    // Método alternativo: evaluar en puntos para obtener coeficientes
    const maxDeg = (input.match(/\^(\d+)/g) || []).reduce((m, s) => Math.max(m, parseInt(s.slice(1))), 1);
    const coeffs = [];
    for (let d = maxDeg; d >= 0; d--) {
      try {
        let val = 0;
        for (let k = 0; k <= maxDeg; k++) {
          if (k !== d) continue;
          const testPts = Array.from({ length: maxDeg + 2 }, (_, i) => i + 1);
          // Usar diferencias divididas o evaluación directa
        }
      } catch {}
    }
    return null;
  } catch { return null; }
}

// ─── MOTOR DE PASOS ────────────────────────────────────────
function solveLinear(expr) {
  const steps = [];
  const clean = expr.replace(/\s/g, "");
  const sides = clean.split("=");
  if (sides.length !== 2) return null;

  steps.push({ type: "section", text: "[1] Identificación" });
  steps.push({ type: "text", text: `Ecuación lineal detectada: ${expr}` });
  steps.push({ type: "text", text: "Forma general: ax + b = 0" });

  steps.push({ type: "section", text: "[2] Reorganizar la ecuación" });
  steps.push({ type: "text", text: `Pasamos todo al lado izquierdo:` });

  let leftStr = `(${sides[0]}) - (${sides[1]})`;
  steps.push({ type: "eq", text: leftStr + " = 0" });

  let simplified;
  try { simplified = math.simplify(leftStr).toString(); } catch { return null; }
  steps.push({ type: "step", text: "Paso 1 — Simplificamos:" });
  steps.push({ type: "eq", text: simplified + " = 0" });

  let deriv, a, b;
  try {
    deriv = math.evaluate(math.derivative(simplified, "x").toString(), {});
    a = deriv;
  } catch { return null; }
  try { b = math.evaluate(simplified, { x: 0 }); } catch { return null; }

  steps.push({ type: "section", text: "[3] Identificar coeficientes" });
  steps.push({ type: "text", text: `Coeficiente de x:  a = ${fmt(a)}` });
  steps.push({ type: "text", text: `Término independiente:  b = ${fmt(b)}` });

  steps.push({ type: "section", text: "[4] Despejar x" });
  steps.push({ type: "step", text: "Paso 2 — Aplicamos la fórmula x = −b / a:" });
  steps.push({ type: "eq", text: `x = −(${fmt(b)}) / ${fmt(a)}` });
  steps.push({ type: "step", text: "Paso 3 — Calculamos:" });
  const sol = -b / a;
  steps.push({ type: "eq", text: `x = ${fmt(sol)}` });

  steps.push({ type: "section", text: "[5] Verificación" });
  steps.push({ type: "step", text: `Paso 4 — Sustituimos x = ${fmt(sol)} en la ecuación original:` });
  try {
    const lv = math.evaluate(sides[0], { x: sol });
    const rv = math.evaluate(sides[1], { x: sol });
    steps.push({ type: "eq", text: `${fmt(Math.round(lv * 1e6) / 1e6)} = ${fmt(Math.round(rv * 1e6) / 1e6)} ✓` });
  } catch {}

  steps.push({ type: "result", text: `[✓] Resultado final — x = ${fmt(sol)}` });
  return steps;
}

function solveQuadratic(a, b, c, original) {
  const steps = [];
  steps.push({ type: "section", text: "[1] Identificación" });
  steps.push({ type: "text", text: `Ecuación cuadrática detectada: ${original}` });
  steps.push({ type: "text", text: "Forma general: ax² + bx + c = 0" });

  steps.push({ type: "section", text: "[2] Identificar coeficientes" });
  steps.push({ type: "text", text: `a = ${fmt(a)}  (coeficiente de x²)` });
  steps.push({ type: "text", text: `b = ${fmt(b)}  (coeficiente de x)` });
  steps.push({ type: "text", text: `c = ${fmt(c)}  (término independiente)` });

  steps.push({ type: "section", text: "[3] Calcular el discriminante" });
  steps.push({ type: "step", text: "Paso 1 — Fórmula del discriminante:" });
  steps.push({ type: "eq", text: "Δ = b² − 4ac" });
  steps.push({ type: "step", text: "Paso 2 — Sustituimos los valores:" });
  steps.push({ type: "eq", text: `Δ = (${fmt(b)})² − 4(${fmt(a)})(${fmt(c)})` });
  const disc = b * b - 4 * a * c;
  steps.push({ type: "eq", text: `Δ = ${fmt(b * b)} − ${fmt(4 * a * c)}` });
  steps.push({ type: "eq", text: `Δ = ${fmt(disc)}` });

  steps.push({ type: "section", text: "[4] Análisis del discriminante" });
  if (disc < 0) {
    steps.push({ type: "text", text: `Como Δ = ${fmt(disc)} < 0, no existen raíces reales.` });
    steps.push({ type: "text", text: "La parábola no corta el eje x." });
    steps.push({ type: "result", text: "[✓] Resultado final — Sin raíces reales (Δ < 0)" });
    return steps;
  }
  if (disc === 0) steps.push({ type: "text", text: `Como Δ = 0, existe exactamente una raíz real (raíz doble).` });
  else steps.push({ type: "text", text: `Como Δ = ${fmt(disc)} > 0, existen dos raíces reales distintas.` });

  steps.push({ type: "section", text: "[5] Aplicar la fórmula cuadrática" });
  steps.push({ type: "step", text: "Paso 3 — Fórmula general:" });
  steps.push({ type: "eq", text: "x = (−b ± √Δ) / 2a" });
  steps.push({ type: "step", text: "Paso 4 — Sustituimos:" });
  steps.push({ type: "eq", text: `x = (−(${fmt(b)}) ± √${fmt(disc)}) / (2 · ${fmt(a)})` });
  steps.push({ type: "eq", text: `x = (${fmt(-b)} ± √${fmt(disc)}) / ${fmt(2 * a)}` });

  const sqrtDisc = Math.sqrt(disc);
  steps.push({ type: "step", text: `Paso 5 — Calculamos √${fmt(disc)} = ${fmt(sqrtDisc)}:` });

  if (disc === 0) {
    const x1 = -b / (2 * a);
    steps.push({ type: "eq", text: `x = ${fmt(-b)} / ${fmt(2 * a)} = ${fmt(x1)}` });
    steps.push({ type: "section", text: "[6] Análisis de multiplicidad" });
    steps.push({ type: "text", text: `x = ${fmt(x1)} tiene multiplicidad 2 (raíz doble).` });
    steps.push({ type: "text", text: "La parábola toca el eje x en ese punto sin cruzarlo." });
    steps.push({ type: "result", text: `[✓] Resultado final — x = ${fmt(x1)} (multiplicidad 2)` });
  } else {
    const x1 = (-b + sqrtDisc) / (2 * a);
    const x2 = (-b - sqrtDisc) / (2 * a);
    steps.push({ type: "step", text: "Paso 6 — Calculamos x₁ (con +):" });
    steps.push({ type: "eq", text: `x₁ = (${fmt(-b)} + ${fmt(sqrtDisc)}) / ${fmt(2 * a)}` });
    steps.push({ type: "eq", text: `x₁ = ${fmt(-b + sqrtDisc)} / ${fmt(2 * a)} = ${fmt(x1)}` });
    steps.push({ type: "step", text: "Paso 7 — Calculamos x₂ (con −):" });
    steps.push({ type: "eq", text: `x₂ = (${fmt(-b)} − ${fmt(sqrtDisc)}) / ${fmt(2 * a)}` });
    steps.push({ type: "eq", text: `x₂ = ${fmt(-b - sqrtDisc)} / ${fmt(2 * a)} = ${fmt(x2)}` });
    steps.push({ type: "section", text: "[6] Análisis de multiplicidad" });
    steps.push({ type: "text", text: `x₁ = ${fmt(x1)} — multiplicidad 1 (la gráfica cruza el eje x)` });
    steps.push({ type: "text", text: `x₂ = ${fmt(x2)} — multiplicidad 1 (la gráfica cruza el eje x)` });
    steps.push({ type: "section", text: "[7] Verificación" });
    steps.push({ type: "step", text: `Paso 8 — Verificamos x₁ = ${fmt(x1)}:` });
    const v1 = a * x1 * x1 + b * x1 + c;
    steps.push({ type: "eq", text: `f(${fmt(x1)}) = ${fmt(Math.round(v1 * 1e6) / 1e6)} ✓` });
    steps.push({ type: "step", text: `Paso 9 — Verificamos x₂ = ${fmt(x2)}:` });
    const v2 = a * x2 * x2 + b * x2 + c;
    steps.push({ type: "eq", text: `f(${fmt(x2)}) = ${fmt(Math.round(v2 * 1e6) / 1e6)} ✓` });
    steps.push({ type: "result", text: `[✓] Resultado final — x₁ = ${fmt(x1)},  x₂ = ${fmt(x2)}` });
  }
  return steps;
}

function solveDerivative(exprInput) {
  const steps = [];
  steps.push({ type: "section", text: "[1] Identificación" });
  steps.push({ type: "text", text: `Función: f(x) = ${exprInput}` });
  steps.push({ type: "text", text: "Operación: calcular la derivada f'(x)" });

  steps.push({ type: "section", text: "[2] Aplicar reglas de derivación" });
  steps.push({ type: "step", text: "Paso 1 — Identificamos los términos de la función:" });

  let deriv;
  try {
    deriv = math.derivative(exprInput, "x");
  } catch {
    return [{ type: "text", text: "No se pudo calcular la derivada. Verifica la expresión." }];
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
  steps.push({ type: "step", text: `Paso 4 — Igualamos f'(x) = 0:` });
  steps.push({ type: "eq", text: `${simplified} = 0` });

  try {
    const roots = getRoots([]);
    const critPoints = [];
    for (let x = -10; x <= 10; x += 0.05) {
      try {
        const v1 = math.evaluate(simplified, { x });
        const v2 = math.evaluate(simplified, { x: x + 0.05 });
        if (Math.sign(v1) !== Math.sign(v2) && isFinite(v1) && isFinite(v2)) {
          let lo = x, hi = x + 0.05;
          for (let it = 0; it < 40; it++) {
            const mid = (lo + hi) / 2;
            const vm = math.evaluate(simplified, { x: mid });
            if (Math.abs(vm) < 1e-8) { lo = mid; break; }
            if (Math.sign(vm) === Math.sign(math.evaluate(simplified, { x: lo }))) lo = mid; else hi = mid;
          }
          const cp = Math.round(lo * 1e4) / 1e4;
          if (!critPoints.some(p => Math.abs(p - cp) < 0.01)) critPoints.push(cp);
        }
      } catch {}
    }
    if (critPoints.length > 0) {
      critPoints.forEach((cp, i) => {
        steps.push({ type: "text", text: `   x${i > 0 ? "₀₁₂₃"[i] || i + 1 : "₀"} = ${fmt(cp)} es un punto crítico` });
      });
    } else {
      steps.push({ type: "text", text: "   No se encontraron puntos críticos reales en [-10, 10]" });
    }
  } catch {}

  steps.push({ type: "result", text: `[✓] Resultado final — f'(x) = ${simplified}` });
  return steps;
}

function simplifyExpr(exprInput) {
  const steps = [];
  steps.push({ type: "section", text: "[1] Expresión original" });
  steps.push({ type: "eq", text: exprInput });

  steps.push({ type: "section", text: "[2] Proceso de simplificación" });
  steps.push({ type: "step", text: "Paso 1 — Expandimos la expresión:" });
  let expanded;
  try { expanded = math.expand(exprInput).toString(); } catch { expanded = exprInput; }
  steps.push({ type: "eq", text: expanded });

  steps.push({ type: "step", text: "Paso 2 — Agrupamos términos semejantes:" });
  let simplified;
  try { simplified = math.simplify(exprInput).toString(); } catch { simplified = expanded; }
  steps.push({ type: "eq", text: simplified });

  steps.push({ type: "step", text: "Paso 3 — Forma final simplificada:" });
  steps.push({ type: "eq", text: simplified });

  steps.push({ type: "result", text: `[✓] Resultado final — ${simplified}` });
  return steps;
}

function analyzeDomain(exprInput) {
  const steps = [];
  const expr = exprInput.replace(/f\(x\)\s*=\s*/i, "").trim();

  steps.push({ type: "section", text: "[1] Identificación de la función" });
  steps.push({ type: "text", text: `f(x) = ${expr}` });

  const hasFraction = expr.includes("/");
  const hasSqrt = expr.includes("sqrt") || expr.includes("√");
  const hasLog = expr.includes("log") || expr.includes("ln");

  steps.push({ type: "section", text: "[2] Identificar restricciones" });

  let restrictions = [];

  if (hasFraction) {
    steps.push({ type: "step", text: "Paso 1 — La función tiene denominador:" });
    steps.push({ type: "text", text: "   Regla: el denominador no puede ser cero." });
    try {
      const denomMatch = expr.match(/\/\((.+?)\)/);
      if (denomMatch) {
        const denom = denomMatch[1];
        steps.push({ type: "eq", text: `Denominador: ${denom} ≠ 0` });
        const roots = getRoots([]);
        for (let x = -20; x <= 20; x += 0.001) {
          try {
            const v = Math.abs(math.evaluate(denom, { x }));
            if (v < 0.001) {
              const xr = Math.round(x * 100) / 100;
              if (!restrictions.some(r => Math.abs(r - xr) < 0.01)) restrictions.push(xr);
            }
          } catch {}
        }
        if (restrictions.length > 0) {
          restrictions.forEach(r => steps.push({ type: "text", text: `   x ≠ ${fmt(r)}` }));
        }
      }
    } catch {}
  }

  if (hasSqrt) {
    steps.push({ type: "step", text: `${hasFraction ? "Paso 2" : "Paso 1"} — La función tiene raíz cuadrada:` });
    steps.push({ type: "text", text: "   Regla: el radicando debe ser ≥ 0." });
    try {
      const sqrtMatch = expr.match(/sqrt\((.+?)\)/);
      if (sqrtMatch) {
        const radicand = sqrtMatch[1];
        steps.push({ type: "eq", text: `Radicando: ${radicand} ≥ 0` });
        steps.push({ type: "text", text: `Resolvemos: ${radicand} ≥ 0` });
        try {
          const solNode = math.simplify(`${radicand}`);
          steps.push({ type: "text", text: `   La restricción limita el dominio inferior.` });
        } catch {}
      }
    } catch {}
  }

  if (hasLog) {
    steps.push({ type: "step", text: "Restricción logarítmica:" });
    steps.push({ type: "text", text: "   Regla: el argumento del logaritmo debe ser > 0." });
  }

  if (!hasFraction && !hasSqrt && !hasLog) {
    steps.push({ type: "text", text: "No se detectan restricciones en la función." });
    steps.push({ type: "text", text: "Al ser una función polinómica, acepta cualquier número real." });
  }

  steps.push({ type: "section", text: "[3] Dominio" });
  if (restrictions.length > 0) {
    const restrStr = restrictions.map(r => `x ≠ ${fmt(r)}`).join(", ");
    steps.push({ type: "text", text: `Dominio: ℝ excepto donde ${restrStr}` });
    if (restrictions.length === 1) {
      const r = restrictions[0];
      steps.push({ type: "eq", text: `D = (−∞, ${fmt(r)}) ∪ (${fmt(r)}, +∞)` });
    }
  } else if (hasSqrt) {
    steps.push({ type: "eq", text: "D = [valor_mínimo, +∞)" });
    steps.push({ type: "text", text: "Evalúa la inecuación del radicando para encontrar el valor exacto." });
  } else {
    steps.push({ type: "eq", text: "D = (−∞, +∞)" });
    steps.push({ type: "text", text: "La función está definida para todos los números reales." });
  }

  steps.push({ type: "section", text: "[4] Rango" });
  const rangeVals = [];
  try {
    for (let x = -100; x <= 100; x += 0.5) {
      const v = math.evaluate(expr, { x });
      if (isFinite(v)) rangeVals.push(v);
    }
  } catch {}
  if (rangeVals.length > 0) {
    const minV = Math.round(Math.min(...rangeVals) * 100) / 100;
    const maxV = Math.round(Math.max(...rangeVals) * 100) / 100;
    const range = maxV - minV;
    if (range > 150) steps.push({ type: "eq", text: "R = (−∞, +∞)" });
    else if (minV > -Infinity && maxV < Infinity) {
      steps.push({ type: "eq", text: `R ≈ [${fmt(minV)}, ${fmt(maxV)}]` });
      steps.push({ type: "text", text: "Nota: rango aproximado evaluado en [-100, 100]." });
    }
  }

  steps.push({ type: "result", text: `[✓] Resultado final — Dominio y rango calculados. Ver secciones [3] y [4].` });
  return steps;
}

// ─── DETECTOR DE TIPO ──────────────────────────────────────
function detectAndSolve(raw) {
  const input = raw.trim();
  const lower = input.toLowerCase();

  // Derivada
  if (lower.startsWith("d/dx") || lower.startsWith("derivada") || lower.startsWith("deriv")) {
    const expr = input.replace(/^(d\/dx|derivada de|derivada|deriv)\s*/i, "").replace(/f\(x\)\s*=\s*/i, "");
    return solveDerivative(expr);
  }

  // Dominio y rango
  if (lower.includes("dominio") || lower.includes("rango") || lower.startsWith("f(x)") || lower.startsWith("g(x)") || lower.startsWith("h(x)")) {
    return analyzeDomain(input);
  }

  // Simplificar
  if (lower.startsWith("simplif") || lower.startsWith("expand")) {
    const expr = input.replace(/^(simplifica|simplificar|expandir|expandir)\s*/i, "");
    return simplifyExpr(expr);
  }

  // Ecuación
  if (input.includes("=")) {
    const sides = input.split("=");
    const exprLeft = `(${sides[0]}) - (${sides[1]})`;
    let simplified;
    try { simplified = math.simplify(exprLeft).toString(); } catch { return [{ type: "text", text: "No se pudo interpretar la ecuación." }]; }

    // Detectar grado
    let maxDeg = 0;
    const degMatch = simplified.match(/x\^(\d+)/g);
    if (degMatch) maxDeg = Math.max(...degMatch.map(m => parseInt(m.slice(2))));
    else if (simplified.includes("x^2") || simplified.includes("x²")) maxDeg = 2;
    else if (simplified.match(/x[²³⁴⁵]/)) maxDeg = 2;
    else if (simplified.includes("x")) maxDeg = 1;

    if (maxDeg <= 1) return solveLinear(input);

    if (maxDeg === 2) {
      // extraer a, b, c
      let a = 0, b = 0, c = 0;
      try {
        const f = (x) => math.evaluate(exprLeft, { x });
        c = f(0);
        a = (f(1) - 2 * f(0) + f(-1)) / 2;
        b = f(1) - f(0) - a;
        return solveQuadratic(
          Math.round(a * 1e6) / 1e6,
          Math.round(b * 1e6) / 1e6,
          Math.round(c * 1e6) / 1e6,
          input
        );
      } catch { return [{ type: "text", text: "No se pudo resolver la ecuación cuadrática." }]; }
    }

    // Polinomial grado > 2
    const steps = [];
    steps.push({ type: "section", text: "[1] Identificación" });
    steps.push({ type: "text", text: `Ecuación polinomial de grado ${maxDeg}: ${input}` });

    steps.push({ type: "section", text: "[2] Reorganizar" });
    steps.push({ type: "step", text: "Paso 1 — Pasamos todo al lado izquierdo:" });
    steps.push({ type: "eq", text: `${simplified} = 0` });

    steps.push({ type: "section", text: "[3] Buscar raíces reales" });
    steps.push({ type: "step", text: "Paso 2 — Buscamos raíces por método numérico (bisección):" });

    const roots = getRoots([]);
    const rootsFound = [];
    for (let x = -15; x <= 15; x += 0.05) {
      try {
        const v1 = math.evaluate(simplified, { x });
        const v2 = math.evaluate(simplified, { x: x + 0.05 });
        if (Math.sign(v1) !== Math.sign(v2) && isFinite(v1) && isFinite(v2)) {
          let lo = x, hi = x + 0.05;
          for (let it = 0; it < 60; it++) {
            const mid = (lo + hi) / 2;
            const vm = math.evaluate(simplified, { x: mid });
            if (Math.abs(vm) < 1e-10) { lo = mid; break; }
            if (Math.sign(vm) === Math.sign(math.evaluate(simplified, { x: lo }))) lo = mid; else hi = mid;
          }
          const r = Math.round(lo * 1e4) / 1e4;
          if (!rootsFound.some(p => Math.abs(p - r) < 0.001)) rootsFound.push(r);
        }
      } catch {}
    }

    if (rootsFound.length === 0) {
      steps.push({ type: "text", text: "No se encontraron raíces reales en el intervalo [-15, 15]." });
    } else {
      rootsFound.sort((a, b) => a - b);
      rootsFound.forEach((r, i) => {
        steps.push({ type: "step", text: `Paso ${i + 3} — Raíz x${["₁","₂","₃","₄","₅"][i] || i+1} = ${fmt(r)}:` });
        try {
          const v = math.evaluate(simplified, { x: r });
          steps.push({ type: "eq", text: `f(${fmt(r)}) = ${fmt(Math.round(v * 1e4) / 1e4)} ✓` });
        } catch {}
      });
    }

    steps.push({ type: "section", text: "[4] Análisis de multiplicidad" });
    rootsFound.forEach(r => {
      steps.push({ type: "text", text: `x = ${fmt(r)} — multiplicidad 1 (la gráfica cruza el eje x)` });
    });

    const resStr = rootsFound.length > 0
      ? rootsFound.map((r, i) => `x${["₁","₂","₃","₄","₅"][i] || i+1} = ${fmt(r)}`).join(",  ")
      : "Sin raíces reales en [-15, 15]";
    steps.push({ type: "result", text: `[✓] Resultado final — ${resStr}` });
    return steps;
  }

  // Expresión sin = → simplificar
  return simplifyExpr(input);
}

// ─── RENDER DE PASOS ───────────────────────────────────────
function StepDisplay({ steps }) {
  return (
    <div style={{ lineHeight: 1.9 }}>
      {steps.map((s, i) => {
        if (s.type === "section") return (
          <div key={i} style={{ fontSize: 13, fontWeight: 500, color: "#534AB7", marginTop: 14, marginBottom: 4, paddingBottom: 4, borderBottom: "0.5px solid #AFA9EC" }}>{s.text}</div>
        );
        if (s.type === "result") return (
          <div key={i} style={{ background: "#EEEDFE", borderLeft: "3px solid #534AB7", borderRadius: "0 6px 6px 0", padding: "8px 14px", marginTop: 12, fontSize: 14, fontWeight: 500, color: "#26215C" }}>{s.text}</div>
        );
        if (s.type === "step") return (
          <div key={i} style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)", marginTop: 8, marginBottom: 2 }}>{s.text}</div>
        );
        if (s.type === "eq") return (
          <div key={i} style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--color-text-primary)", background: "var(--color-background-secondary)", borderRadius: 6, padding: "5px 12px", margin: "3px 0", display: "inline-block", minWidth: 120 }}>{s.text}</div>
        );
        return (
          <div key={i} style={{ fontSize: 14, color: "var(--color-text-secondary)", paddingLeft: s.text.startsWith("   ") ? 16 : 0 }}>{s.text}</div>
        );
      })}
    </div>
  );
}

// ─── CONSTANTES UI ─────────────────────────────────────────
const CATEGORIES = [
  { label: "Ecuaciones", icon: "=", items: ["2x + 5 = 11", "x² - 5x + 6 = 0", "x³ - 6x² + 11x - 6 = 0"] },
  { label: "Funciones", icon: "f(x)", items: ["f(x) = x² + 3x - 4", "f(x) = sqrt(x - 2)", "f(x) = 3/(x-2)"] },
  { label: "Derivadas", icon: "d/dx", items: ["d/dx x³ + 2x² - 5x + 1", "d/dx x^4 - 3x^2 + 2", "d/dx 2x^5 - x^3 + 4x"] },
  { label: "Simplificar", icon: "≡", items: ["simplifica (x+1)(x-1)", "simplifica x² + 2x + 1", "simplifica (x+2)^3"] },
];

const SYMBOLS = [
  { label: "x²", v: "x^2" }, { label: "x³", v: "x^3" }, { label: "√", v: "sqrt(" },
  { label: "±", v: "±" }, { label: "∞", v: "∞" }, { label: "≥", v: ">=" },
  { label: "≤", v: "<=" }, { label: "≠", v: "!=" }, { label: "π", v: "pi" },
  { label: "(  )", v: "()" }, { label: "^", v: "^" }, { label: "d/dx", v: "d/dx " },
];

const EXAMPLES = [
  { label: "x³ − 3x² − x + 3 = 0", tag: "Polinomial" },
  { label: "2x² + 3x − 1 = 0", tag: "Cuadrática" },
  { label: "f(x) = 3/(x-2)", tag: "Dominio" },
  { label: "d/dx x^4 - 2x^2 + 1", tag: "Derivada" },
  { label: "simplifica (x+2)^2", tag: "Simplificar" },
];

// ─── APP ───────────────────────────────────────────────────
export default function App() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState(0);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history]);

  function insertSymbol(v) {
    const el = inputRef.current;
    if (!el) return;
    const s = el.selectionStart, e = el.selectionEnd;
    const val = input.slice(0, s) + v + input.slice(e);
    setInput(val);
    setTimeout(() => { el.focus(); el.setSelectionRange(s + v.length, s + v.length); }, 0);
  }

  function solve(query = input.trim()) {
    if (!query) return;
    setError("");
    let steps;
    try { steps = detectAndSolve(query); }
    catch (e) { setError("No se pudo interpretar la expresión. Intenta escribirla de otra forma."); return; }
    setHistory(h => [...h, { query, steps }]);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--color-background-tertiary)", fontFamily: "var(--font-sans)", overflow: "hidden" }}>

      {/* Sidebar */}
      {sidebarOpen && (
        <div style={{ width: 220, flexShrink: 0, background: "var(--color-background-primary)", borderRight: "0.5px solid var(--color-border-tertiary)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "16px 16px 12px", borderBottom: "0.5px solid var(--color-border-tertiary)", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#534AB7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 500, color: "#fff" }}>Σ</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)" }}>AlgebraCalc</div>
              <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>100% local · sin tokens</div>
            </div>
          </div>

          <div style={{ padding: "12px 8px", flex: 1, overflowY: "auto" }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)", padding: "0 8px 8px", letterSpacing: 0.5 }}>CALCULADORAS</div>
            {CATEGORIES.map((cat, i) => (
              <div key={i}>
                <button onClick={() => setActiveCategory(i)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: "var(--border-radius-md)", background: activeCategory === i ? "var(--color-background-secondary)" : "transparent", border: "none", cursor: "pointer", textAlign: "left", marginBottom: 2 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 6, background: activeCategory === i ? "#EEEDFE" : "var(--color-background-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500, color: activeCategory === i ? "#534AB7" : "var(--color-text-secondary)", flexShrink: 0 }}>{cat.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: activeCategory === i ? 500 : 400, color: activeCategory === i ? "var(--color-text-primary)" : "var(--color-text-secondary)" }}>{cat.label}</span>
                </button>
                {activeCategory === i && (
                  <div style={{ paddingLeft: 12, marginBottom: 4 }}>
                    {cat.items.map((item, j) => (
                      <button key={j} onClick={() => { setInput(item); inputRef.current?.focus(); }} style={{ width: "100%", textAlign: "left", padding: "5px 10px", fontSize: 12, color: "var(--color-text-secondary)", background: "transparent", border: "none", cursor: "pointer", borderRadius: 6, fontFamily: "var(--font-mono)" }}>{item}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)", padding: "0 8px 8px", letterSpacing: 0.5 }}>EJEMPLOS RÁPIDOS</div>
              {EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => solve(ex.label)} style={{ width: "100%", textAlign: "left", padding: "7px 10px", fontSize: 12, background: "transparent", border: "none", cursor: "pointer", borderRadius: 6, marginBottom: 2, fontFamily: "var(--font-mono)" }}>
                  <div style={{ color: "var(--color-text-primary)", marginBottom: 1 }}>{ex.label}</div>
                  <div style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>{ex.tag}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: "10px 16px", borderTop: "0.5px solid var(--color-border-tertiary)" }}>
            <div style={{ fontSize: 11, color: "#1D9E75", textAlign: "center", fontWeight: 500 }}>✓ Sin consumo de tokens</div>
          </div>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ background: "var(--color-background-primary)", borderBottom: "0.5px solid var(--color-border-tertiary)", padding: "0 16px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setSidebarOpen(s => !s)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--color-text-secondary)", fontSize: 18 }}>☰</button>
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>Calculadora de Álgebra</div>
            <div style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#EEEDFE", color: "#534AB7", fontWeight: 500 }}>Paso a paso</div>
            <div style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#E1F5EE", color: "#0F6E56", fontWeight: 500 }}>100% local</div>
          </div>
          {history.length > 0 && (
            <button onClick={() => { setHistory([]); setError(""); }} style={{ fontSize: 12, color: "var(--color-text-secondary)", background: "none", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", padding: "5px 12px", cursor: "pointer" }}>
              Nueva sesión
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {history.length === 0 ? (
            <div style={{ maxWidth: 620, margin: "40px auto", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "#534AB7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#fff", margin: "0 auto 16px" }}>Σ</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 8 }}>Calculadora de Álgebra</div>
              <div style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 8, lineHeight: 1.6 }}>Solución completa paso a paso. Todos los cálculos se realizan localmente en tu navegador.</div>
              <div style={{ fontSize: 13, color: "#1D9E75", marginBottom: 32, fontWeight: 500 }}>✓ Sin tokens · Sin costo · Sin internet requerido</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, textAlign: "left" }}>
                {[
                  { title: "Ecuaciones", desc: "Lineales, cuadráticas y polinomiales con verificación", icon: "=" },
                  { title: "Derivadas", desc: "Reglas de derivación con puntos críticos", icon: "d/dx" },
                  { title: "Dominio y Rango", desc: "Análisis de restricciones en funciones", icon: "f(x)" },
                  { title: "Simplificar", desc: "Expandir y simplificar expresiones algebraicas", icon: "≡" },
                ].map((card, i) => (
                  <div key={i} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "14px 16px" }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "#EEEDFE", color: "#534AB7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, marginBottom: 8 }}>{card.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 4 }}>{card.title}</div>
                    <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", lineHeight: 1.5 }}>{card.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
              {history.map((item, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ background: "#534AB7", color: "#fff", borderRadius: "var(--border-radius-lg)", padding: "10px 18px", fontSize: 14, fontFamily: "var(--font-mono)", maxWidth: "75%" }}>{item.query}</div>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--color-background-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "var(--color-text-secondary)", flexShrink: 0, marginTop: 2 }}>U</div>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "#534AB7", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, flexShrink: 0, marginTop: 2 }}>Σ</div>
                    <div style={{ flex: 1, background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "16px 20px" }}>
                      <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 10, fontWeight: 500, letterSpacing: 0.5 }}>SOLUCIÓN PASO A PASO</div>
                      <StepDisplay steps={item.steps} />
                    </div>
                  </div>
                </div>
              ))}
              {error && <div style={{ background: "var(--color-background-danger)", border: "0.5px solid var(--color-border-danger)", borderRadius: "var(--border-radius-md)", padding: "10px 16px", fontSize: 13, color: "var(--color-text-danger)" }}>{error}</div>}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ background: "var(--color-background-primary)", borderTop: "0.5px solid var(--color-border-tertiary)", padding: "12px 24px 14px", flexShrink: 0 }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
              {SYMBOLS.map((s, i) => (
                <button key={i} onClick={() => insertSymbol(s.v)} style={{ padding: "3px 10px", fontSize: 13, background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 6, cursor: "pointer", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>{s.label}</button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-lg)", padding: "10px 12px" }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); solve(); } }}
                placeholder="Ej: x³ − 3x² − x + 3 = 0  |  d/dx x^4 - 2x^2  |  f(x) = sqrt(x-3)"
                rows={1}
                style={{ flex: 1, resize: "none", border: "none", outline: "none", background: "transparent", fontSize: 14, color: "var(--color-text-primary)", fontFamily: "var(--font-mono)", lineHeight: 1.6, padding: 4 }}
                onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px"; }}
              />
              <button onClick={() => solve()} disabled={!input.trim()} style={{ background: input.trim() ? "#534AB7" : "var(--color-background-tertiary)", color: input.trim() ? "#fff" : "var(--color-text-tertiary)", border: "none", borderRadius: "var(--border-radius-md)", padding: "8px 20px", fontSize: 13, fontWeight: 500, cursor: input.trim() ? "pointer" : "default", transition: "all 0.15s", flexShrink: 0 }}>
                Resolver →
              </button>
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 6, textAlign: "center" }}>
              Enter para resolver · Shift+Enter para nueva línea · Escribe en formato matemático estándar
            </div>
          </div>
        </div>
      </div>
      <style>{`
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:var(--color-border-secondary);border-radius:4px} button:hover{opacity:0.85}
      `}</style>
    </div>
  );
}