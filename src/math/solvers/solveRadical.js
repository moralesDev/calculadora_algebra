import * as math from "mathjs";
import { fmt } from "../utils/formatters.js";

// Resuelve ecuaciones con radicales: sqrt(f(x)) = g(x)
// Estrategia: aislar el radical, elevar al cuadrado, verificar soluciones
export function solveRadical(input, display) {
  const steps = [];

  steps.push({ type: "section", text: "[1] Identificación" });
  steps.push({ type: "text", text: `Ecuación con radical: ${display}` });
  steps.push({ type: "text", text: "Forma general: √(f(x)) = g(x)" });
  steps.push({ type: "text", text: "Restricción implícita: el radicando debe ser ≥ 0." });

  const eqParts = input.split("=");
  if (eqParts.length !== 2) {
    return [{ type: "text", text: "Formato no reconocido. Usa: sqrt(expresión) = valor" }];
  }

  let lhs = eqParts[0].trim();
  let rhs = eqParts[1].trim();

  // Intentar aislar sqrt() en el lado izquierdo
  const sqrtMatch = lhs.match(/sqrt\((.+?)\)/i) || rhs.match(/sqrt\((.+?)\)/i);
  if (!sqrtMatch) {
    return [{ type: "text", text: "No se encontró sqrt() en la ecuación." }];
  }

  // Si sqrt está en la derecha, intercambiar
  if (!lhs.includes("sqrt(") && rhs.includes("sqrt(")) {
    [lhs, rhs] = [rhs, lhs];
  }

  const radicand = sqrtMatch[1].trim();

  steps.push({ type: "text", text: `Radicando: ${radicand}` });
  steps.push({ type: "text", text: `Lado derecho: ${rhs}` });

  steps.push({ type: "section", text: "[2] Condición del radicando" });
  steps.push({ type: "step", text: "Paso 1 — Condición necesaria para que exista solución:" });
  steps.push({ type: "eq", text: `${radicand} ≥ 0` });

  // Encontrar el límite inferior del dominio para el radicando
  let domainMin = null;
  try {
    for (let x = -100; x <= 100; x += 0.01) {
      const v = math.evaluate(radicand, { x });
      if (v >= 0) {
        domainMin = Math.round(x * 100) / 100;
        break;
      }
    }
    if (domainMin !== null) {
      steps.push({ type: "text", text: `   El radicando es ≥ 0 para x ≥ ${fmt(domainMin)} (aproximado).` });
    }
  } catch { /* continúa */ }

  steps.push({ type: "section", text: "[3] Elevar al cuadrado ambos lados" });
  steps.push({ type: "step", text: "Paso 2 — Elevamos ambos lados al cuadrado para eliminar el radical:" });
  steps.push({ type: "eq", text: `(${lhs})² = (${rhs})²` });
  steps.push({ type: "eq", text: `${radicand} = (${rhs})²` });
  steps.push({ type: "text", text: "Nota: al elevar al cuadrado pueden aparecer soluciones extrañas. Se deben verificar." });

  // Construir la nueva ecuación: radicand = rhs^2
  const newEq = `(${radicand}) - (${rhs})^2`;

  steps.push({ type: "section", text: "[4] Resolver la ecuación resultante" });
  steps.push({ type: "step", text: "Paso 3 — La nueva ecuación a resolver es:" });

  let simplified;
  try {
    simplified = math.simplify(newEq).toString();
    steps.push({ type: "eq", text: `${simplified} = 0` });
  } catch {
    return [...steps, { type: "text", text: "No se pudo simplificar la ecuación resultante." }];
  }

  const degMatch = simplified.match(/x\s*\^\s*(\d+)/g);
  let maxDeg = 0;
  if (degMatch) maxDeg = Math.max(...degMatch.map((m) => parseInt(m.replace(/x\s*\^\s*/, ""))));
  else if (simplified.includes("x")) maxDeg = 1;

  const candidateRoots = [];

  if (maxDeg <= 1) {
    try {
      const a = math.evaluate(math.derivative(simplified, "x").toString(), {});
      const b = math.evaluate(simplified, { x: 0 });
      const sol = -b / a;
      steps.push({ type: "eq", text: `x = ${fmt(sol)}` });
      candidateRoots.push(sol);
    } catch {
      steps.push({ type: "text", text: "No se pudo resolver la ecuación lineal." });
    }
  } else if (maxDeg === 2) {
    try {
      const f = (x) => math.evaluate(newEq, { x });
      const cCoef = f(0);
      const aCoef = (f(1) - 2 * f(0) + f(-1)) / 2;
      const bCoef = f(1) - f(0) - aCoef;
      const disc = bCoef * bCoef - 4 * aCoef * cCoef;
      if (disc < 0) {
        steps.push({ type: "text", text: `Δ = ${fmt(disc)} < 0 → No hay raíces reales.` });
      } else {
        const x1 = (-bCoef + Math.sqrt(disc)) / (2 * aCoef);
        const x2 = (-bCoef - Math.sqrt(disc)) / (2 * aCoef);
        steps.push({ type: "text", text: `Raíces candidatas: x₁ = ${fmt(x1)},  x₂ = ${fmt(x2)}` });
        candidateRoots.push(x1, x2);
      }
    } catch {
      steps.push({ type: "text", text: "No se pudo resolver la ecuación cuadrática." });
    }
  } else {
    // Búsqueda numérica
    try {
      for (let x = -20; x <= 20; x += 0.1) {
        const v1 = math.evaluate(simplified, { x });
        const v2 = math.evaluate(simplified, { x: x + 0.1 });
        if (Math.sign(v1) !== Math.sign(v2) && isFinite(v1) && isFinite(v2)) {
          let lo = x, hi = x + 0.1;
          for (let it = 0; it < 50; it++) {
            const mid = (lo + hi) / 2;
            const vm = math.evaluate(simplified, { x: mid });
            if (Math.abs(vm) < 1e-8) { lo = mid; break; }
            if (Math.sign(vm) === Math.sign(math.evaluate(simplified, { x: lo }))) lo = mid;
            else hi = mid;
          }
          candidateRoots.push(Math.round(lo * 1e4) / 1e4);
        }
      }
      if (candidateRoots.length > 0) {
        steps.push({ type: "text", text: `Raíces candidatas: ${candidateRoots.map((r) => fmt(r)).join(", ")}` });
      }
    } catch { /* continúa */ }
  }

  steps.push({ type: "section", text: "[5] Verificación (descartar soluciones extrañas)" });
  steps.push({ type: "step", text: "Paso 4 — Sustituimos en la ecuación ORIGINAL √(f(x)) = g(x):" });

  const validRoots = [];
  candidateRoots.forEach((r) => {
    try {
      const rad = math.evaluate(radicand, { x: r });
      const rhsVal = math.evaluate(rhs, { x: r });
      if (rad < -1e-6) {
        steps.push({ type: "text", text: `   x = ${fmt(r)} → radicando = ${fmt(rad)} < 0, se descarta.` });
        return;
      }
      const lhsVal = Math.sqrt(Math.max(0, rad));
      if (Math.abs(lhsVal - rhsVal) < 0.001) {
        steps.push({ type: "eq", text: `√(${fmt(Math.round(rad * 1e4) / 1e4)}) = ${fmt(Math.round(lhsVal * 1e4) / 1e4)} = ${fmt(Math.round(rhsVal * 1e4) / 1e4)} ✓` });
        validRoots.push(r);
      } else {
        steps.push({ type: "text", text: `   x = ${fmt(r)} → no verifica (solución extraña, se descarta).` });
      }
    } catch { /* sin verificación */ }
  });

  const labels = ["₁", "₂", "₃", "₄"];
  const resStr = validRoots.length > 0
    ? validRoots.map((r, i) => `x${labels[i] || i + 1} = ${fmt(r)}`).join(",  ")
    : "Sin solución real (verifica las condiciones del radical)";

  steps.push({ type: "result", text: `[✓] Resultado final — ${resStr}` });
  return steps;
}
