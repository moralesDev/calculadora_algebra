import * as math from "mathjs";
import { fmt } from "../utils/formatters.js";

// Extrae todos los denominadores de una expresión con fracciones
// Devuelve array de strings de denominadores encontrados
function extractDenominators(expr) {
  const denoms = [];
  // Buscar patrones del tipo (.../denom) o algo/denom
  // Estrategia: parsear el árbol de mathjs y recolectar nodos OperatorNode '/'
  try {
    const node = math.parse(expr);
    node.traverse((n) => {
      if (n.type === "OperatorNode" && n.op === "/" && n.args.length === 2) {
        denoms.push(n.args[1].toString());
      }
    });
  } catch { /* continuar */ }
  return denoms;
}

// Calcula el MCM simbólico de una lista de denominadores numéricos/literales
// Para denominadores numéricos usa el MCM aritmético
// Para literales, construye la expresión del MCM como producto
function buildMCM(denoms) {
  // Intentar resolver numéricamente
  const nums = denoms.map((d) => {
    try { return math.evaluate(d); } catch { return null; }
  });
  if (nums.every((n) => n !== null && Number.isInteger(n) && n !== 0)) {
    let mcm = Math.abs(nums[0]);
    for (let i = 1; i < nums.length; i++) {
      const a = mcm, b = Math.abs(nums[i]);
      const gcd = (x, y) => (y === 0 ? x : gcd(y, x % y));
      mcm = (a * b) / gcd(a, b);
    }
    return { mcm: mcm.toString(), isNumeric: true, value: mcm };
  }
  // Para denominadores algebraicos: unificar únicos y mostrar producto
  const unique = [...new Set(denoms)];
  return { mcm: unique.join(" · "), isNumeric: false, value: null };
}

export function solveFractional(input, display = input) {
  const steps = [];

  steps.push({ type: "section", text: "[1] Identificación" });
  steps.push({ type: "text", text: `Ecuación fraccionaria: ${display}` });
  steps.push({ type: "text", text: "Método: multiplicar ambos miembros por el MCM de los denominadores." });

  const sides = input.split("=");
  if (sides.length !== 2) {
    return [{ type: "text", text: "Formato no reconocido. Verifica que la ecuación tenga exactamente un signo '='." }];
  }

  const lhs = sides[0].trim();
  const rhs = sides[1].trim();

  // Recolectar denominadores de ambos lados
  const denomsLeft  = extractDenominators(lhs);
  const denomsRight = extractDenominators(rhs);
  const allDenoms   = [...denomsLeft, ...denomsRight];

  steps.push({ type: "section", text: "[2] Identificar denominadores" });
  if (allDenoms.length === 0) {
    steps.push({ type: "text", text: "No se detectaron fracciones. Intentando resolver como ecuación lineal." });
    // Fallback: la ecuación no tenía fracciones reales con variable
    return null;
  }
  steps.push({ type: "text", text: `Denominadores encontrados: ${allDenoms.join(", ")}` });

  const { mcm, isNumeric, value: mcmVal } = buildMCM(allDenoms);
  steps.push({ type: "section", text: "[3] Calcular el MCM" });
  steps.push({ type: "eq", text: `MCM = ${mcm}` });

  steps.push({ type: "section", text: "[4] Eliminar denominadores" });
  steps.push({ type: "step", text: `Paso 1 — Multiplicamos ambos miembros por MCM = ${mcm}:` });
  steps.push({ type: "text", text: `(${mcm}) · (${lhs}) = (${mcm}) · (${rhs})` });

  // Construir la ecuación multiplicada
  let lhsCleared, rhsCleared;
  const mcmExpr = isNumeric ? String(mcmVal) : `(${mcm})`;
  try {
    lhsCleared = math.simplify(`(${mcmExpr}) * (${lhs})`).toString();
    rhsCleared = math.simplify(`(${mcmExpr}) * (${rhs})`).toString();
  } catch {
    lhsCleared = `${mcmExpr} * (${lhs})`;
    rhsCleared = `${mcmExpr} * (${rhs})`;
  }

  steps.push({ type: "step", text: "Paso 2 — Simplificamos (los denominadores se cancelan):" });
  steps.push({ type: "eq", text: `${lhsCleared} = ${rhsCleared}` });

  // Resolver la ecuación resultante (lineal o cuadrática)
  const combined = `(${lhsCleared}) - (${rhsCleared})`;
  let simplified;
  try {
    simplified = math.simplify(combined).toString();
  } catch {
    steps.push({ type: "text", text: "No se pudo simplificar la ecuación resultante." });
    return steps;
  }

  steps.push({ type: "eq", text: `${simplified} = 0` });

  // Detectar grado
  let maxDeg = 0;
  const degMatch = simplified.match(/x\s*\^\s*(\d+)/g);
  if (degMatch) maxDeg = Math.max(...degMatch.map((m) => parseInt(m.replace(/x\s*\^\s*/, ""))));
  else if (simplified.includes("x")) maxDeg = 1;

  steps.push({ type: "section", text: "[5] Resolver la ecuación resultante" });

  const roots = [];

  if (maxDeg <= 1) {
    steps.push({ type: "text", text: "La ecuación resultante es lineal." });
    let a, b;
    try {
      const f = (x) => math.evaluate(simplified, { x });
      a = f(1) - f(0);
      b = f(0);
      a = Math.round(a * 1e6) / 1e6;
      b = Math.round(b * 1e6) / 1e6;
    } catch {
      steps.push({ type: "text", text: "No se pudieron extraer coeficientes." });
      return steps;
    }
    if (Math.abs(a) < 1e-10) {
      steps.push({ type: "text", text: Math.abs(b) < 1e-6 ? "Identidad: infinitas soluciones." : "Contradicción: sin solución." });
      steps.push({ type: "result", text: Math.abs(b) < 1e-6 ? "[✓] Infinitas soluciones" : "[✓] Sin solución" });
      return steps;
    }
    const x = -b / a;
    steps.push({ type: "step", text: "Paso 3 — Despejamos x:" });
    steps.push({ type: "eq", text: `${fmt(a)}x = ${fmt(-b)}` });
    steps.push({ type: "eq", text: `x = ${fmt(-b)} / ${fmt(a)} = ${fmt(x)}` });
    roots.push(Math.round(x * 1e6) / 1e6);

  } else if (maxDeg === 2) {
    steps.push({ type: "text", text: "La ecuación resultante es cuadrática." });
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
      steps.push({ type: "text", text: "No se pudieron extraer coeficientes cuadráticos." });
      return steps;
    }
    const disc = b * b - 4 * a * c;
    steps.push({ type: "eq", text: `Δ = ${fmt(b)}² − 4·${fmt(a)}·${fmt(c)} = ${fmt(disc)}` });
    if (disc < 0) {
      steps.push({ type: "text", text: "Δ < 0 → no hay raíces reales." });
    } else {
      const sq = Math.sqrt(disc);
      const x1 = (-b + sq) / (2 * a);
      const x2 = (-b - sq) / (2 * a);
      roots.push(Math.round(x1 * 1e6) / 1e6);
      if (Math.abs(x1 - x2) > 1e-6) roots.push(Math.round(x2 * 1e6) / 1e6);
      steps.push({ type: "eq", text: `x₁ = ${fmt(roots[0])}${roots[1] !== undefined ? `,  x₂ = ${fmt(roots[1])}` : ""}` });
    }
  }

  // ── Verificación: detectar soluciones extrañas ────────────────────────────
  steps.push({ type: "section", text: "[6] Verificar soluciones extrañas" });
  steps.push({ type: "text", text: "Al multiplicar por el MCM pueden aparecer soluciones que anulan denominadores originales." });

  const validRoots = [];
  roots.forEach((r) => {
    let valid = true;
    for (const d of allDenoms) {
      try {
        const dVal = math.evaluate(d, { x: r });
        if (Math.abs(dVal) < 1e-9) {
          steps.push({ type: "step", text: `x = ${fmt(r)} anula el denominador "${d}" → solución extraña, se descarta.` });
          valid = false;
          break;
        }
      } catch { /* no evalúa, asumir válido */ }
    }
    if (valid) {
      // Verificar en la ecuación original
      try {
        const lv = math.evaluate(lhs, { x: r });
        const rv = math.evaluate(rhs, { x: r });
        const diff = Math.abs(lv - rv);
        if (diff < 1e-6) {
          steps.push({ type: "eq", text: `x = ${fmt(r)}: ${fmt(Math.round(lv * 1e4) / 1e4)} = ${fmt(Math.round(rv * 1e4) / 1e4)} ✓` });
          validRoots.push(r);
        } else {
          steps.push({ type: "step", text: `x = ${fmt(r)}: no satisface la ecuación original, se descarta.` });
        }
      } catch {
        steps.push({ type: "step", text: `x = ${fmt(r)}: no se pudo verificar.` });
      }
    }
  });

  if (validRoots.length === 0) {
    steps.push({ type: "result", text: "[✓] Resultado final — La ecuación no tiene soluciones válidas." });
  } else {
    const labels = ["₁", "₂", "₃", "₄"];
    const resStr = validRoots.map((r, i) => `x${labels[i]} = ${fmt(r)}`).join(",  ");
    steps.push({ type: "result", text: `[✓] Resultado final — ${resStr}` });
  }

  return steps;
}
