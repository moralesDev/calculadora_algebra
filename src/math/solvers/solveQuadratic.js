import { fmt } from "../utils/formatters.js";

// Devuelve true si n es un cuadrado perfecto (entero)
function isPerfectSquare(n) {
  if (n < 0) return false;
  const s = Math.round(Math.sqrt(n));
  return Math.abs(s * s - n) < 1e-9;
}

export function solveQuadratic(a, b, c, original) {
  const steps = [];
  steps.push({ type: "section", text: "[1] Identificación" });
  steps.push({ type: "text", text: `Ecuación cuadrática detectada: ${original}` });
  steps.push({ type: "text", text: "Forma general: ax² + bx + c = 0" });

  // Detectar tipo de ecuación cuadrática
  const isIncompleteNoB = Math.abs(b) < 1e-10;  // ax² + c = 0
  const isIncompleteNoC = Math.abs(c) < 1e-10;  // ax² + bx = 0
  if (isIncompleteNoB || isIncompleteNoC) {
    steps.push({ type: "text", text: `Tipo: ecuación cuadrática incompleta${isIncompleteNoB ? " (falta término en x)" : " (falta término independiente)"}.` });
  } else {
    steps.push({ type: "text", text: "Tipo: ecuación cuadrática completa." });
  }

  steps.push({ type: "section", text: "[2] Identificar coeficientes" });
  steps.push({ type: "text", text: `a = ${fmt(a)}  (coeficiente de x²)` });
  steps.push({ type: "text", text: `b = ${fmt(b)}  (coeficiente de x)` });
  steps.push({ type: "text", text: `c = ${fmt(c)}  (término independiente)` });

  // Caso incompleta tipo ax² + bx = 0: factor común x
  if (isIncompleteNoC) {
    steps.push({ type: "section", text: "[3] Resolver por factor común" });
    steps.push({ type: "step", text: "Paso 1 — Sacamos factor común x:" });
    steps.push({ type: "eq", text: `x(${fmt(a)}x + ${fmt(b)}) = 0` });
    steps.push({ type: "step", text: "Paso 2 — Igualamos cada factor a cero:" });
    steps.push({ type: "eq", text: "x = 0" });
    const x2 = -b / a;
    steps.push({ type: "eq", text: `${fmt(a)}x + ${fmt(b)} = 0  →  x = ${fmt(-b)} / ${fmt(a)} = ${fmt(x2)}` });
    steps.push({ type: "section", text: "[4] Fórmulas de Vieta" });
    steps.push({ type: "text", text: `Suma de raíces: x₁ + x₂ = 0 + ${fmt(x2)} = ${fmt(x2)} = −b/a = ${fmt(-b/a)} ✓` });
    steps.push({ type: "text", text: `Producto de raíces: x₁ · x₂ = 0 · ${fmt(x2)} = 0 = c/a = ${fmt(c/a)} ✓` });
    steps.push({ type: "result", text: `[✓] Resultado final — x₁ = 0,  x₂ = ${fmt(x2)}` });
    return steps;
  }

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
    steps.push({ type: "text", text: `Δ = ${fmt(disc)} < 0 → las raíces son imaginarias conjugadas. La parábola no corta el eje x.` });

    const realPart = -b / (2 * a);
    const imagPart = Math.sqrt(-disc) / (2 * a);
    const realR = Math.round(realPart * 1e6) / 1e6;
    const imagR = Math.round(Math.abs(imagPart) * 1e6) / 1e6;

    steps.push({ type: "section", text: "[5] Raíces complejas conjugadas" });
    steps.push({ type: "step", text: "Paso 3 — Usando la fórmula con número imaginario i = √(−1):" });
    steps.push({ type: "eq", text: `x = (−b ± √Δ) / 2a = (${fmt(-b)} ± √(${fmt(disc)})) / ${fmt(2 * a)}` });
    steps.push({ type: "eq", text: `x = (${fmt(-b)} ± ${fmt(imagR)}i) / ${fmt(2 * a)}` });
    steps.push({ type: "step", text: "Paso 4 — Separamos en parte real e imaginaria:" });
    steps.push({ type: "eq", text: `x₁ = ${fmt(realR)} + ${fmt(imagR)}i` });
    steps.push({ type: "eq", text: `x₂ = ${fmt(realR)} − ${fmt(imagR)}i` });
    steps.push({ type: "text", text: `Parte real: α = −b/2a = ${fmt(realR)}` });
    steps.push({ type: "text", text: `Parte imaginaria: β = √|Δ|/2a = ${fmt(imagR)}` });
    steps.push({
      type: "result",
      text: `[✓] Resultado final — x₁ = ${fmt(realR)} + ${fmt(imagR)}i,  x₂ = ${fmt(realR)} − ${fmt(imagR)}i`,
    });
    return steps;
  }

  if (disc === 0) {
    steps.push({ type: "text", text: "Δ = 0 → existe exactamente una raíz real (raíz doble)." });
  } else {
    const rational = isPerfectSquare(disc);
    steps.push({
      type: "text",
      text: `Δ = ${fmt(disc)} > 0 → dos raíces reales distintas${rational ? ", racionales (Δ es cuadrado perfecto)" : ", irracionales (Δ no es cuadrado perfecto)"}.`,
    });
  }

  // ── Completar el cuadrado (método alternativo) ──────────────────────────
  steps.push({ type: "section", text: "[5] Método: completar el cuadrado" });
  steps.push({ type: "step", text: "Paso 3 — Dividimos toda la ecuación entre a:" });
  const ba = Math.round((-b / a) * 1e6) / 1e6;
  const ca = Math.round((-c / a) * 1e6) / 1e6;
  steps.push({ type: "eq", text: `x² ${b/a <= 0 ? "+" : "−"} ${fmt(Math.abs(b/a))}x = ${fmt(ca)}` });
  steps.push({ type: "step", text: "Paso 4 — Sumamos (b/2a)² a ambos lados para completar el cuadrado:" });
  const halfB = Math.round((b / (2 * a)) * 1e6) / 1e6;
  const halfBSq = Math.round(halfB * halfB * 1e6) / 1e6;
  steps.push({ type: "eq", text: `(b/2a)² = (${fmt(b)}/${fmt(2 * a)})² = ${fmt(halfBSq)}` });
  steps.push({ type: "eq", text: `x² ${b/a <= 0 ? "+" : "−"} ${fmt(Math.abs(b/a))}x + ${fmt(halfBSq)} = ${fmt(ca)} + ${fmt(halfBSq)}` });
  const rhs = Math.round((ca + halfBSq) * 1e6) / 1e6;
  steps.push({ type: "step", text: "Paso 5 — El lado izquierdo es un cuadrado perfecto:" });
  steps.push({ type: "eq", text: `(x ${halfB >= 0 ? "+" : "−"} ${fmt(Math.abs(halfB))})² = ${fmt(rhs)}` });
  if (rhs >= 0) {
    steps.push({ type: "step", text: "Paso 6 — Extraemos raíz cuadrada:" });
    steps.push({ type: "eq", text: `x ${halfB >= 0 ? "+" : "−"} ${fmt(Math.abs(halfB))} = ±√${fmt(rhs)} = ±${fmt(Math.sqrt(rhs))}` });
  }

  steps.push({ type: "section", text: "[6] Aplicar la fórmula cuadrática" });
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
    steps.push({ type: "section", text: "[7] Análisis de multiplicidad" });
    steps.push({ type: "text", text: `x = ${fmt(x1)} tiene multiplicidad 2 (raíz doble). La parábola toca el eje x sin cruzarlo.` });
    steps.push({ type: "section", text: "[8] Fórmulas de Vieta" });
    steps.push({ type: "text", text: `Suma de raíces: x₁ + x₂ = ${fmt(x1)} + ${fmt(x1)} = ${fmt(2*x1)} = −b/a = ${fmt(-b/a)} ✓` });
    steps.push({ type: "text", text: `Producto de raíces: x₁ · x₂ = ${fmt(x1)} · ${fmt(x1)} = ${fmt(x1*x1)} = c/a = ${fmt(c/a)} ✓` });
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
    steps.push({ type: "section", text: "[7] Verificación" });
    const v1 = a * x1 * x1 + b * x1 + c;
    const v2 = a * x2 * x2 + b * x2 + c;
    steps.push({ type: "eq", text: `f(${fmt(x1)}) = ${fmt(Math.round(v1 * 1e6) / 1e6)} ✓` });
    steps.push({ type: "eq", text: `f(${fmt(x2)}) = ${fmt(Math.round(v2 * 1e6) / 1e6)} ✓` });
    steps.push({ type: "section", text: "[8] Fórmulas de Vieta" });
    steps.push({ type: "step", text: "Verificación por propiedades de las raíces:" });
    const sumRoots = Math.round((x1 + x2) * 1e6) / 1e6;
    const prodRoots = Math.round((x1 * x2) * 1e6) / 1e6;
    const vietaSum = Math.round((-b / a) * 1e6) / 1e6;
    const vietaProd = Math.round((c / a) * 1e6) / 1e6;
    steps.push({ type: "eq", text: `x₁ + x₂ = ${fmt(sumRoots)}  =  −b/a = ${fmt(vietaSum)} ✓` });
    steps.push({ type: "eq", text: `x₁ · x₂ = ${fmt(prodRoots)}  =  c/a = ${fmt(vietaProd)} ✓` });
    steps.push({ type: "result", text: `[✓] Resultado final — x₁ = ${fmt(x1)},  x₂ = ${fmt(x2)}` });
  }
  return steps;
}
