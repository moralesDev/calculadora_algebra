import * as math from "mathjs";
import { fmt } from "../utils/formatters.js";

// Resuelve ecuaciones logarítmicas: log(f(x)) = c, ln(f(x)) = c
// Estrategia: convertir usando la función inversa (exponencial)
export function solveLogarithmic(input, display) {
  const steps = [];

  steps.push({ type: "section", text: "[1] Identificación" });
  steps.push({ type: "text", text: `Ecuación logarítmica: ${display}` });
  steps.push({ type: "text", text: "Restricción: el argumento del logaritmo debe ser > 0." });

  const eqParts = input.split("=");
  if (eqParts.length !== 2) {
    return [{ type: "text", text: "Formato no reconocido." }];
  }

  const lhs = eqParts[0].trim();
  const rhs = eqParts[1].trim();

  // Detectar tipo de logaritmo y extraer argumento
  const isLn = lhs.includes("ln(");
  const isLog10 = lhs.includes("log10(");
  const isLog = lhs.includes("log(");
  const base = isLn ? "e" : isLog10 ? "10" : "10";
  const baseLabel = isLn ? "e" : "10";
  const funcLabel = isLn ? "ln" : "log";

  const logMatch = lhs.match(/(log10|log|ln)\((.+)\)/i);
  if (!logMatch) {
    return [{ type: "text", text: "No se reconoció la función logarítmica. Usa log(x) o ln(x)." }];
  }

  const logArg = logMatch[2].trim();

  steps.push({ type: "text", text: `Función logarítmica: ${funcLabel}(${logArg})` });
  steps.push({ type: "text", text: `Base: ${baseLabel}` });
  steps.push({ type: "text", text: `Lado derecho: c = ${rhs}` });

  steps.push({ type: "section", text: "[2] Condición del dominio" });
  steps.push({ type: "step", text: "Paso 1 — El argumento debe ser estrictamente positivo:" });
  steps.push({ type: "eq", text: `${logArg} > 0` });

  steps.push({ type: "section", text: "[3] Convertir a forma exponencial" });
  steps.push({ type: "step", text: `Paso 2 — Aplicamos la definición del logaritmo:` });
  steps.push({ type: "eq", text: `${funcLabel}(${logArg}) = ${rhs}` });
  steps.push({ type: "step", text: `Paso 3 — Despejamos el argumento:` });

  if (isLn) {
    steps.push({ type: "eq", text: `${logArg} = e^(${rhs})` });
  } else {
    steps.push({ type: "eq", text: `${logArg} = ${baseLabel}^(${rhs})` });
  }

  let rhsNumeric;
  try {
    rhsNumeric = math.evaluate(rhs);
  } catch {
    rhsNumeric = null;
  }

  let rhsExpValue;
  if (rhsNumeric !== null) {
    rhsExpValue = isLn ? Math.exp(rhsNumeric) : Math.pow(10, rhsNumeric);
    steps.push({ type: "step", text: "Paso 4 — Evaluamos el lado derecho:" });
    steps.push({ type: "eq", text: `${logArg} = ${isLn ? "e" : "10"}^(${fmt(rhsNumeric)}) = ${fmt(rhsExpValue)}` });
  } else {
    steps.push({ type: "text", text: "El lado derecho contiene variables, se mantiene en forma simbólica." });
    steps.push({ type: "result", text: `[✓] Resultado — ${logArg} = ${baseLabel}^(${rhs})` });
    return steps;
  }

  steps.push({ type: "section", text: "[4] Resolver la ecuación resultante" });
  steps.push({ type: "step", text: `Paso 5 — Resolvemos: ${logArg} = ${fmt(rhsExpValue)}` });

  const newEq = `(${logArg}) - (${rhsExpValue})`;
  let simplified;
  try {
    simplified = math.simplify(newEq).toString();
    steps.push({ type: "eq", text: `${simplified} = 0` });
  } catch {
    return [...steps, { type: "text", text: "No se pudo simplificar la ecuación." }];
  }

  const candidateRoots = [];
  const degMatch = simplified.match(/x\s*\^\s*(\d+)/g);
  let maxDeg = 0;
  if (degMatch) maxDeg = Math.max(...degMatch.map((m) => parseInt(m.replace(/x\s*\^\s*/, ""))));
  else if (simplified.includes("x")) maxDeg = 1;

  if (maxDeg <= 1) {
    try {
      const a = math.evaluate(math.derivative(simplified, "x").toString(), {});
      const b = math.evaluate(simplified, { x: 0 });
      const sol = -b / a;
      steps.push({ type: "eq", text: `x = ${fmt(sol)}` });
      candidateRoots.push(sol);
    } catch {
      steps.push({ type: "text", text: "No se pudo resolver la ecuación lineal resultante." });
    }
  } else if (maxDeg === 2) {
    try {
      const f = (x) => math.evaluate(newEq, { x });
      const cCoef = f(0);
      const aCoef = (f(1) - 2 * f(0) + f(-1)) / 2;
      const bCoef = f(1) - f(0) - aCoef;
      const disc = bCoef * bCoef - 4 * aCoef * cCoef;
      if (disc >= 0) {
        const x1 = (-bCoef + Math.sqrt(disc)) / (2 * aCoef);
        const x2 = (-bCoef - Math.sqrt(disc)) / (2 * aCoef);
        candidateRoots.push(x1, x2);
        steps.push({ type: "text", text: `Raíces candidatas: x₁ = ${fmt(x1)},  x₂ = ${fmt(x2)}` });
      }
    } catch { /* continúa */ }
  }

  steps.push({ type: "section", text: "[5] Verificación del dominio" });
  steps.push({ type: "step", text: `Paso 6 — Solo aceptamos x donde ${logArg} > 0:` });

  const validRoots = [];
  candidateRoots.forEach((r) => {
    try {
      const argVal = math.evaluate(logArg, { x: r });
      if (argVal > 0) {
        const check = isLn ? Math.log(argVal) : Math.log10(argVal);
        steps.push({ type: "eq", text: `${funcLabel}(${fmt(Math.round(argVal * 1e4) / 1e4)}) = ${fmt(Math.round(check * 1e4) / 1e4)} ≈ ${rhs} ✓` });
        validRoots.push(r);
      } else {
        steps.push({ type: "text", text: `   x = ${fmt(r)} → argumento = ${fmt(argVal)} ≤ 0, se descarta.` });
      }
    } catch { /* sin verificación */ }
  });

  const labels = ["₁", "₂", "₃", "₄"];
  const resStr = validRoots.length > 0
    ? validRoots.map((r, i) => `x${labels[i] || i + 1} = ${fmt(r)}`).join(",  ")
    : "Sin solución (verifica que el argumento sea positivo)";

  steps.push({ type: "result", text: `[✓] Resultado final — ${resStr}` });
  return steps;
}
