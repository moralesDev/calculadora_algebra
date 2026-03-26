import * as math from "mathjs";
import { fmt } from "../utils/formatters.js";

// Resuelve ecuaciones exponenciales: a^x = b, a^(f(x)) = b
// Estrategia: aplicar logaritmo a ambos lados
export function solveExponential(input, display) {
  const steps = [];

  steps.push({ type: "section", text: "[1] Identificación" });
  steps.push({ type: "text", text: `Ecuación exponencial: ${display}` });
  steps.push({ type: "text", text: "Forma general: a^x = b  (x está en el exponente)" });

  const eqParts = input.split("=");
  if (eqParts.length !== 2) {
    return [{ type: "text", text: "Formato no reconocido." }];
  }

  let lhs = eqParts[0].trim();
  let rhs = eqParts[1].trim();

  // Normalizar: asegurar que el exponente esté en la izquierda
  const expOnRight = /\d+\s*\^\s*x/.test(rhs) || /e\s*\^\s*x/.test(rhs);
  if (expOnRight) { [lhs, rhs] = [rhs, lhs]; }

  // Detectar forma a^x = b  o  a^(f(x)) = b  o  e^x = b
  const expMatch = lhs.match(/^(.+?)\s*\^\s*\(?(.+?)\)?$/);
  if (!expMatch) {
    return [{ type: "text", text: "No se reconoció la forma exponencial. Usa: base^x = valor" }];
  }

  const base = expMatch[1].trim();
  const exponent = expMatch[2].trim();

  let baseValue;
  try {
    baseValue = math.evaluate(base);
  } catch {
    baseValue = null;
  }

  let rhsValue;
  try {
    rhsValue = math.evaluate(rhs);
  } catch {
    rhsValue = null;
  }

  steps.push({ type: "text", text: `Base: a = ${base}` });
  steps.push({ type: "text", text: `Exponente: ${exponent}` });
  steps.push({ type: "text", text: `Lado derecho: b = ${rhs}` });

  if (baseValue !== null && baseValue <= 0) {
    steps.push({ type: "text", text: "La base debe ser positiva y distinta de 1 para que sea función exponencial." });
    steps.push({ type: "result", text: "[✓] Resultado — Ecuación no válida: base ≤ 0." });
    return steps;
  }
  if (baseValue !== null && Math.abs(baseValue - 1) < 1e-9) {
    steps.push({ type: "text", text: "Si la base es 1, la ecuación es 1 = b, sin solución para b ≠ 1." });
    steps.push({ type: "result", text: "[✓] Resultado — Sin solución (base = 1)." });
    return steps;
  }
  if (rhsValue !== null && rhsValue <= 0) {
    steps.push({ type: "text", text: `b = ${fmt(rhsValue)} ≤ 0 → Una exponencial siempre es positiva.` });
    steps.push({ type: "result", text: "[✓] Resultado final — Sin solución real." });
    return steps;
  }

  steps.push({ type: "section", text: "[2] Propiedades del exponente" });
  steps.push({ type: "text", text: "Recuerda:" });
  steps.push({ type: "text", text: `   • a^x > 0 siempre que a > 0` });
  steps.push({ type: "text", text: `   • Si a > 1: función creciente` });
  steps.push({ type: "text", text: `   • Si 0 < a < 1: función decreciente` });

  steps.push({ type: "section", text: "[3] Aplicar logaritmo a ambos lados" });
  steps.push({ type: "step", text: "Paso 1 — Tomamos logaritmo natural en ambos lados:" });
  steps.push({ type: "eq", text: `ln(${lhs}) = ln(${rhs})` });
  steps.push({ type: "step", text: "Paso 2 — Aplicamos la propiedad ln(aˣ) = x·ln(a):" });
  steps.push({ type: "eq", text: `(${exponent}) · ln(${base}) = ln(${rhs})` });

  if (baseValue !== null && rhsValue !== null) {
    const lnBase = Math.log(baseValue);
    const lnRhs = Math.log(rhsValue);

    steps.push({ type: "step", text: "Paso 3 — Evaluamos los logaritmos:" });
    steps.push({ type: "eq", text: `ln(${base}) = ${fmt(lnBase)}` });
    steps.push({ type: "eq", text: `ln(${rhs}) = ${fmt(lnRhs)}` });

    steps.push({ type: "section", text: "[4] Despejar el exponente" });
    steps.push({ type: "step", text: "Paso 4 — Dividimos ambos lados entre ln(a):" });
    steps.push({ type: "eq", text: `${exponent} = ln(${rhs}) / ln(${base})` });
    steps.push({ type: "eq", text: `${exponent} = ${fmt(lnRhs)} / ${fmt(lnBase)}` });

    if (exponent.trim() === "x") {
      // Caso simple: a^x = b → x = ln(b)/ln(a)
      const sol = lnRhs / lnBase;
      steps.push({ type: "eq", text: `x = ${fmt(sol)}` });

      steps.push({ type: "section", text: "[5] Verificación" });
      steps.push({ type: "step", text: `Paso 5 — Verificamos: ${fmt(baseValue)}^(${fmt(sol)}) = ?` });
      const check = Math.pow(baseValue, sol);
      steps.push({ type: "eq", text: `${fmt(baseValue)}^(${fmt(sol)}) = ${fmt(Math.round(check * 1e4) / 1e4)} ≈ ${fmt(rhsValue)} ✓` });

      // Forma exacta con fracción
      steps.push({ type: "section", text: "[6] Forma exacta" });
      steps.push({ type: "step", text: "Paso 6 — Solución en forma de logaritmo:" });
      if (base === "e") {
        steps.push({ type: "eq", text: `x = ln(${rhs})` });
      } else {
        steps.push({ type: "eq", text: `x = log(${rhs}) / log(${base}) = log${base}(${rhs})` });
      }

      steps.push({ type: "result", text: `[✓] Resultado final — x = ${fmt(sol)} (forma exacta: log${base}(${rhs}))` });
    } else {
      // Caso: a^(f(x)) = b → f(x) = lnRhs/lnBase, resolver f(x)
      const newRhs = lnRhs / lnBase;
      steps.push({ type: "eq", text: `${exponent} = ${fmt(newRhs)}` });
      steps.push({ type: "text", text: "Ahora resolvemos la ecuación resultante en x." });

      const newEq = `(${exponent}) - (${newRhs})`;
      let simplified;
      try {
        simplified = math.simplify(newEq).toString();
        steps.push({ type: "eq", text: `${simplified} = 0` });
      } catch {
        return [...steps, { type: "result", text: `[✓] Resultado — ${exponent} = ${fmt(newRhs)}` }];
      }

      try {
        const a = math.evaluate(math.derivative(simplified, "x").toString(), {});
        const b = math.evaluate(simplified, { x: 0 });
        const sol = -b / a;
        steps.push({ type: "eq", text: `x = ${fmt(sol)}` });
        steps.push({ type: "result", text: `[✓] Resultado final — x = ${fmt(sol)}` });
      } catch {
        steps.push({ type: "result", text: `[✓] Resultado — ${exponent} = ${fmt(newRhs)}` });
      }
    }
  } else {
    steps.push({ type: "step", text: "Paso 3 — Despejamos:" });
    if (exponent.trim() === "x") {
      steps.push({ type: "eq", text: `x = ln(${rhs}) / ln(${base})` });
      steps.push({ type: "result", text: `[✓] Resultado final — x = log${base}(${rhs})` });
    } else {
      steps.push({ type: "eq", text: `${exponent} = ln(${rhs}) / ln(${base})` });
      steps.push({ type: "result", text: `[✓] Resultado — ${exponent} = log${base}(${rhs})` });
    }
  }

  return steps;
}
