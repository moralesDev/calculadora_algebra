import * as math from "mathjs";
import { fmt, prettify } from "../utils/formatters.js";
import { findRootsByBisection } from "../utils/mathHelpers.js";

// ── Utilidades internas ──────────────────────────────────────────────────────

// Separa P(x)/Q(x) en numerador y denominador rastreando profundidad de paréntesis
function splitFraction(expr) {
  const e = expr.trim();
  let depth = 0;
  let mainSlash = -1;
  for (let i = 0; i < e.length; i++) {
    const c = e[i];
    if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth--;
    else if (c === "/" && depth === 0) { mainSlash = i; break; }
  }
  if (mainSlash < 0) return null;

  const unwrap = (s) => {
    s = s.trim();
    while (s.startsWith("(") && s.endsWith(")")) {
      // Verificar que los paréntesis exteriores se corresponden
      let d = 0;
      let i;
      for (i = 0; i < s.length - 1; i++) {
        if (s[i] === "(") d++;
        else if (s[i] === ")") d--;
        if (d === 0) break; // El ( inicial cierra antes del final → no envuelven todo
      }
      if (d !== 0) s = s.slice(1, -1).trim(); // sí envuelven todo, eliminar
      else break;
    }
    return s;
  };

  return {
    num: unwrap(e.slice(0, mainSlash)),
    den: unwrap(e.slice(mainSlash + 1)),
  };
}

// Estima el grado de un polinomio: f(200)/f(100) ≈ 2^grado
function estimateDegree(expr) {
  try {
    const f = (x) => math.evaluate(expr, { x });
    const v1 = Math.abs(f(100));
    const v2 = Math.abs(f(200));
    if (v1 < 1e-6 || v2 < 1e-6 || !isFinite(v1) || !isFinite(v2)) return 0;
    return Math.max(0, Math.round(Math.log(v2 / v1) / Math.log(2)));
  } catch { return 0; }
}

// Coeficiente líder aproximado para un grado dado
function getLeadCoeff(expr, degree) {
  try {
    const f = (x) => math.evaluate(expr, { x });
    if (degree === 0) return Math.round(f(1) * 1e6) / 1e6;
    return Math.round((f(1000) / Math.pow(1000, degree)) * 1e4) / 1e4;
  } catch { return null; }
}

// Asíntotas verticales: raíces del denominador donde el numerador ≠ 0
function findVerticalAsymptotes(denExpr, numExpr) {
  return findRootsByBisection(denExpr).filter((r) => {
    try { return Math.abs(math.evaluate(numExpr, { x: r })) > 1e-4; }
    catch { return true; }
  });
}

// Agujeros (discontinuidades removibles): ambos son 0 en ese punto
function findHoles(denExpr, numExpr, fullExpr) {
  return findRootsByBisection(denExpr).flatMap((r) => {
    try {
      if (Math.abs(math.evaluate(numExpr, { x: r })) > 1e-4) return [];
      const yL = math.evaluate(fullExpr, { x: r - 1e-4 });
      const yR = math.evaluate(fullExpr, { x: r + 1e-4 });
      if (!isFinite(yL) || !isFinite(yR) || Math.abs(yL - yR) > 0.1) return [];
      return [{ x: r, y: Math.round(((yL + yR) / 2) * 1e4) / 1e4 }];
    } catch { return []; }
  });
}

// Ceros de la función (numerador = 0 y denominador ≠ 0)
function findXIntercepts(numExpr, denExpr) {
  return findRootsByBisection(numExpr).filter((r) => {
    try { return Math.abs(math.evaluate(denExpr, { x: r })) > 1e-4; }
    catch { return false; }
  });
}

// Comportamiento lateral cerca de una asíntota vertical
function lateralBehavior(expr, x0) {
  try {
    const L = math.evaluate(expr, { x: x0 - 1e-4 });
    const R = math.evaluate(expr, { x: x0 + 1e-4 });
    return {
      left:  isFinite(L) ? (L > 0 ? "+∞" : "−∞") : "?",
      right: isFinite(R) ? (R > 0 ? "+∞" : "−∞") : "?",
    };
  } catch { return null; }
}

// ── Solver principal ─────────────────────────────────────────────────────────

export function solveRational(rawExpr, displayExpr = rawExpr) {
  const steps = [];
  const asymptotes = { vertical: [], horizontal: [], oblique: [] };

  steps.push({ type: "section", text: "[1] Identificación" });
  steps.push({ type: "text", text: `Función racional: f(x) = ${displayExpr}` });
  steps.push({ type: "text", text: "Forma: f(x) = P(x) / Q(x)  donde P y Q son polinomios" });

  // ── [2] Separar numerador / denominador ──────────────────────────────────
  const parts = splitFraction(rawExpr);
  if (!parts) {
    steps.push({ type: "text", text: "No se pudo separar numerador y denominador." });
    return { steps, asymptotes };
  }
  const { num, den } = parts;

  let numS, denS;
  try { numS = math.simplify(num).toString(); } catch { numS = num; }
  try { denS = math.simplify(den).toString(); } catch { denS = den; }

  steps.push({ type: "section", text: "[2] Numerador y denominador" });
  steps.push({ type: "eq", text: `P(x) = ${prettify(numS)}` });
  steps.push({ type: "eq", text: `Q(x) = ${prettify(denS)}` });

  const degP = estimateDegree(numS);
  const degQ = estimateDegree(denS);
  steps.push({ type: "text", text: `Grado de P(x) = ${degP}  |  Grado de Q(x) = ${degQ}` });

  // ── [3] Asíntotas verticales ─────────────────────────────────────────────
  steps.push({ type: "section", text: "[3] Asíntotas verticales — Q(x) = 0" });
  steps.push({ type: "step", text: "Paso 1 — Igualamos el denominador a cero:" });
  steps.push({ type: "eq", text: `${prettify(denS)} = 0` });

  const vertAV = findVerticalAsymptotes(denS, numS);
  const holes  = findHoles(denS, numS, rawExpr);

  if (vertAV.length > 0) {
    vertAV.forEach((va) => {
      steps.push({ type: "eq", text: `Asíntota vertical: x = ${fmt(va)}` });
      const beh = lateralBehavior(rawExpr, va);
      if (beh) {
        steps.push({ type: "text", text: `   • lím(x → ${fmt(va)}⁻) f(x) = ${beh.left}` });
        steps.push({ type: "text", text: `   • lím(x → ${fmt(va)}⁺) f(x) = ${beh.right}` });
      }
    });
    asymptotes.vertical = vertAV;
  } else {
    steps.push({ type: "text", text: "No existen asíntotas verticales en [−15, 15]." });
  }

  if (holes.length > 0) {
    steps.push({ type: "step", text: "Discontinuidades removibles (agujeros):" });
    holes.forEach((h) =>
      steps.push({ type: "text", text: `   Agujero en x = ${fmt(h.x)}  →  lím f(x) = ${fmt(h.y)}  →  punto (${fmt(h.x)}, ${fmt(h.y)})` })
    );
  }

  // ── [4] Asíntota horizontal u oblicua ────────────────────────────────────
  const lcP = getLeadCoeff(numS, degP);
  const lcQ = getLeadCoeff(denS, degQ);

  if (degP < degQ) {
    steps.push({ type: "section", text: "[4] Asíntota horizontal" });
    steps.push({ type: "step", text: "Paso 2 — grado(P) < grado(Q)  →  límite en ±∞ es 0:" });
    steps.push({ type: "eq", text: "lím(x → ±∞) f(x) = 0" });
    steps.push({ type: "eq", text: "Asíntota horizontal: y = 0  (eje x)" });
    asymptotes.horizontal = [0];

  } else if (degP === degQ) {
    steps.push({ type: "section", text: "[4] Asíntota horizontal" });
    steps.push({ type: "step", text: "Paso 2 — grado(P) = grado(Q)  →  cociente de coeficientes líderes:" });
    if (lcP !== null && lcQ !== null) {
      const ha = Math.round((lcP / lcQ) * 1e4) / 1e4;
      steps.push({ type: "eq", text: `lím(x → ±∞) f(x) = ${fmt(lcP)} / ${fmt(lcQ)} = ${fmt(ha)}` });
      steps.push({ type: "eq", text: `Asíntota horizontal: y = ${fmt(ha)}` });
      asymptotes.horizontal = [ha];
    }

  } else if (degP === degQ + 1) {
    steps.push({ type: "section", text: "[4] Asíntota oblicua (inclinada)" });
    steps.push({ type: "step", text: "Paso 2 — grado(P) = grado(Q) + 1  →  asíntota oblicua y = mx + b:" });
    try {
      const f  = (x) => math.evaluate(rawExpr, { x });
      const BIG = 1e5;
      const m  = Math.round(((f(BIG) - f(-BIG)) / (2 * BIG)) * 1e4) / 1e4;
      const b  = Math.round((f(BIG) - m * BIG) * 1e4) / 1e4;
      steps.push({ type: "eq", text: `Pendiente: m ≈ ${fmt(m)}` });
      steps.push({ type: "eq", text: `Término independiente: b ≈ ${fmt(b)}` });
      const bStr = b >= 0 ? `+ ${fmt(b)}` : `− ${fmt(-b)}`;
      steps.push({ type: "eq", text: `Asíntota oblicua: y = ${fmt(m)}x ${bStr}` });
      asymptotes.oblique = [{ m, b }];
    } catch { steps.push({ type: "text", text: "No se pudo calcular la asíntota oblicua." }); }

  } else {
    steps.push({ type: "section", text: "[4] Comportamiento en el infinito" });
    steps.push({ type: "text", text: `grado(P) = ${degP} > grado(Q) + 1 = ${degQ + 1}.` });
    steps.push({ type: "text", text: "La función no tiene asíntota horizontal ni oblicua." });
  }

  // ── [5] Intersecciones ───────────────────────────────────────────────────
  steps.push({ type: "section", text: "[5] Intersecciones" });

  // Con eje y
  try {
    const y0 = Math.round(math.evaluate(rawExpr, { x: 0 }) * 1e4) / 1e4;
    if (isFinite(y0)) {
      steps.push({ type: "step", text: "Paso 3 — Intersección con eje y (x = 0):" });
      steps.push({ type: "eq", text: `f(0) = ${fmt(y0)}  →  punto (0, ${fmt(y0)})` });
    } else {
      steps.push({ type: "text", text: "f(0) no existe — asíntota vertical en x = 0." });
    }
  } catch { /* continúa */ }

  // Con eje x
  const xInts = findXIntercepts(numS, denS);
  if (xInts.length > 0) {
    steps.push({ type: "step", text: "Paso 4 — Intersecciones con eje x  (P(x) = 0, Q(x) ≠ 0):" });
    xInts.forEach((xi) =>
      steps.push({ type: "eq", text: `x = ${fmt(xi)}  →  punto (${fmt(xi)}, 0)` })
    );
  } else {
    steps.push({ type: "text", text: "No hay intersecciones con el eje x en [−15, 15]." });
  }

  // ── [6] Dominio ──────────────────────────────────────────────────────────
  steps.push({ type: "section", text: "[6] Dominio" });
  const excluded = [...vertAV, ...holes.map((h) => h.x)].sort((a, b) => a - b);

  if (excluded.length > 0) {
    const exclStr = excluded.map((v) => `x ≠ ${fmt(v)}`).join(", ");
    steps.push({ type: "eq", text: `D = ℝ  excepto  {${exclStr}}` });
    const parts2 = [];
    let prev = "−∞";
    for (const xv of excluded) { parts2.push(`(${prev}, ${fmt(xv)})`); prev = fmt(xv); }
    parts2.push(`(${prev}, +∞)`);
    steps.push({ type: "eq", text: `D = ${parts2.join(" ∪ ")}` });
  } else {
    steps.push({ type: "eq", text: "D = (−∞, +∞) = ℝ" });
  }

  // ── [7] Monotonía ────────────────────────────────────────────────────────
  steps.push({ type: "section", text: "[7] Monotonía — f'(x)" });
  steps.push({ type: "step", text: "Paso 5 — Calculamos f'(x):" });

  try {
    const derivStr = math.simplify(math.derivative(rawExpr, "x").toString()).toString();
    steps.push({ type: "eq", text: `f'(x) = ${prettify(derivStr)}` });

    // Puntos críticos (f'=0 sin ser asíntota)
    const critPts = [];
    for (let x = -14.9; x <= 14.9; x += 0.05) {
      try {
        const v1 = math.evaluate(derivStr, { x });
        const v2 = math.evaluate(derivStr, { x: x + 0.05 });
        if (Math.sign(v1) !== Math.sign(v2) && isFinite(v1) && isFinite(v2)) {
          let lo = x, hi = x + 0.05;
          for (let it = 0; it < 50; it++) {
            const mid = (lo + hi) / 2;
            const vm = math.evaluate(derivStr, { x: mid });
            if (Math.abs(vm) < 1e-8) { lo = mid; break; }
            if (Math.sign(vm) === Math.sign(math.evaluate(derivStr, { x: lo }))) lo = mid;
            else hi = mid;
          }
          const cp = Math.round(lo * 1e4) / 1e4;
          const nearAV = vertAV.some((va) => Math.abs(va - cp) < 0.05);
          if (!nearAV && !critPts.some((p) => Math.abs(p - cp) < 0.02)) critPts.push(cp);
        }
      } catch { /* continúa */ }
    }

    if (critPts.length > 0) {
      steps.push({ type: "step", text: "Paso 6 — Puntos críticos (f'(x) = 0):" });
      critPts.forEach((cp) => {
        try {
          const fval = Math.round(math.evaluate(rawExpr, { x: cp }) * 1e4) / 1e4;
          const d2   = math.simplify(math.derivative(derivStr, "x").toString()).toString();
          const d2v  = math.evaluate(d2, { x: cp });
          const label = d2v > 1e-3 ? "mínimo local" : d2v < -1e-3 ? "máximo local" : "punto de inflexión";
          steps.push({ type: "eq", text: `x = ${fmt(cp)},  f(${fmt(cp)}) = ${fmt(fval)}  → ${label}` });
        } catch {
          steps.push({ type: "eq", text: `x = ${fmt(cp)}  → punto crítico` });
        }
      });
    }

    // Intervalos de monotonía
    const bps = [...vertAV, ...critPts].sort((a, b) => a - b).filter((x) => x > -15 && x < 15);
    if (bps.length > 0) {
      steps.push({ type: "step", text: "Paso 7 — Intervalos de crecimiento:" });
      const testXs = [-14.5, ...bps.slice(0, -1).map((b, i) => (b + bps[i + 1]) / 2), 14.5];
      const edges  = ["−∞", ...bps.map(fmt), "+∞"];
      testXs.forEach((tx, i) => {
        try {
          const dv = math.evaluate(derivStr, { x: tx });
          if (!isFinite(dv)) return;
          const symbol = dv > 0 ? "↗ creciente" : "↘ decreciente";
          steps.push({ type: "text", text: `   (${edges[i]}, ${edges[i + 1]}): ${symbol}` });
        } catch { /* continúa */ }
      });
    }
  } catch {
    steps.push({ type: "text", text: "No se pudo calcular la derivada de esta función." });
  }

  // ── Resultado ────────────────────────────────────────────────────────────
  const vaStr = asymptotes.vertical.length > 0
    ? asymptotes.vertical.map((v) => `x = ${fmt(v)}`).join(", ")
    : "ninguna";
  const haStr = asymptotes.horizontal.length > 0
    ? asymptotes.horizontal.map((y) => `y = ${fmt(y)}`).join(", ")
    : asymptotes.oblique.length > 0
    ? asymptotes.oblique.map(({ m, b }) => `y = ${fmt(m)}x ${b >= 0 ? "+ " + fmt(b) : "− " + fmt(-b)}`).join(", ")
    : "ninguna";

  steps.push({
    type: "result",
    text: `[✓] Resultado — A.Verticales: ${vaStr}  |  A.H./A.O.: ${haStr}`,
  });

  return { steps, asymptotes };
}
