import * as math from "mathjs";
import { fmt } from "../utils/formatters.js";

// ── Utilidades para manejo de términos ──────────────────────────────────────

// Separa una expresión en sus términos aditivos individuales como strings
// "3a - 2b + 5c" → ["3a", "-2b", "5c"]
function splitTerms(exprStr) {
  const s = exprStr.replace(/\s+/g, "");
  const terms = [];
  let current = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if ((ch === "+" || ch === "-") && i > 0) {
      if (current) terms.push(current);
      current = ch;
    } else {
      current += ch;
    }
  }
  if (current) terms.push(current);
  return terms.filter(t => t && t !== "+" && t !== "-");
}

// Extrae la "clave de variables" de un término para agrupar semejantes
// "3a^2b" → "a^2·b", "-5xy" → "x·y", "7" → ""
function varKey(termStr) {
  // Quitar signo y coeficiente numérico (incluyendo fracciones)
  const s = termStr.replace(/^[+-]/, "").trim();
  // Quitar coeficiente al inicio: número entero, decimal o fracción
  const clean = s.replace(/^\d+(\.\d+)?(\/\d+(\.\d+)?)?\*?/, "").trim();
  // Si queda vacío, era un término constante
  if (!clean || /^\d/.test(clean)) return "";
  return clean.toLowerCase();
}

// Agrupa los términos de un array por su clave de variables
function groupLikeTerms(terms) {
  const groups = {};
  for (const t of terms) {
    const key = varKey(t);
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  }
  return groups;
}

// Formatea el coeficiente numérico para mostrar ("1·x" → "x", "-1·x" → "-x")
function fmtTerm(t) {
  return t.startsWith("+") ? t.slice(1) : t;
}

// ── Solver principal ──────────────────────────────────────────────────────────

export function solveAddition(input, display = input) {
  const steps = [];

  // Eliminar palabra clave "sumar", "suma de", "suma"
  const exprStr = input.replace(/^(sumar\s+|suma\s+de\s+|suma\s+)/i, "").trim();

  // Separar sumandos por coma o punto y coma
  const parts = exprStr.split(/\s*[,;]\s*/).map(p => p.trim()).filter(p => p);

  if (parts.length === 0) {
    return [{ type: "text", text: "No se detectaron expresiones para sumar." }];
  }

  const isSingle = parts.length === 1;
  const labels = ["₁", "₂", "₃", "₄", "₅", "₆"];

  // ── [1] Identificación ────────────────────────────────────────────────────
  steps.push({ type: "section", text: "[1] Identificación" });
  if (isSingle) {
    steps.push({ type: "text", text: `Expresión algebraica: ${parts[0]}` });
    steps.push({ type: "text", text: "Reducimos los términos semejantes." });
  } else {
    steps.push({ type: "text", text: `Suma algebraica de ${parts.length} expresiones (sumandos).` });
    steps.push({ type: "text", text: "Regla general (Baldor §35): escribir con sus propios signos y reducir términos semejantes." });
    steps.push({ type: "text", text: "Nota: sumar una cantidad negativa equivale a restar una positiva de igual valor absoluto (§34)." });
  }

  // ── [2] Sumandos ──────────────────────────────────────────────────────────
  if (!isSingle) {
    steps.push({ type: "section", text: "[2] Identificar los sumandos" });
    parts.forEach((p, i) => {
      steps.push({ type: "text", text: `Sumando${labels[i] || (i + 1)}: ${p}` });
    });
  }

  // ── [3] Reunir todos los términos ─────────────────────────────────────────
  const s3 = isSingle ? "[2]" : "[3]";
  steps.push({ type: "section", text: `${s3} Reunir todos los términos` });

  if (!isSingle) {
    const withParens = parts.map(p => `(${p})`).join(" + ");
    steps.push({ type: "step", text: "Paso 1 — Escribimos los sumandos indicando la suma con paréntesis:" });
    steps.push({ type: "eq", text: withParens });
    steps.push({ type: "step", text: "Paso 2 — Quitamos los paréntesis; cada término conserva su propio signo:" });
    // Mostrar todos los términos juntos, separados visualmente
    const rawTerms = parts.flatMap((p) => splitTerms(p));
    const rawJoin = rawTerms.map((t, i) => {
      if (i === 0) return fmtTerm(t);
      return t.startsWith("-") ? ` ${t}` : ` + ${t}`;
    }).join("");
    steps.push({ type: "eq", text: rawJoin });
  } else {
    steps.push({ type: "eq", text: parts[0] });
  }

  // ── [4] Identificar y agrupar términos semejantes ─────────────────────────
  const s4 = isSingle ? "[3]" : "[4]";
  steps.push({ type: "section", text: `${s4} Identificar términos semejantes` });
  steps.push({ type: "text", text: "Términos semejantes: igual parte literal (mismas letras con mismos exponentes)." });

  // Recolectar todos los términos de todos los sumandos
  const allTerms = parts.flatMap(p => splitTerms(p));
  const groups = groupLikeTerms(allTerms);

  // Mostrar grupos (solo si hay más de un término en algún grupo)
  const hasGrouping = Object.values(groups).some(g => g.length > 1);

  if (hasGrouping) {
    steps.push({ type: "step", text: "Agrupamos los términos semejantes:" });
    for (const [key, terms] of Object.entries(groups)) {
      if (terms.length > 1) {
        const varLabel = key || "(constante)";
        const termJoin = terms.map((t, i) => {
          if (i === 0) return fmtTerm(t);
          return t.startsWith("-") ? ` ${t}` : ` + ${t}`;
        }).join("");
        // Calcular suma numérica de los coeficientes
        let sumCoeff;
        try {
          const expr = terms.join("+").replace(/\s/g, "");
          // Sustituir las variables por 1 para obtener la suma de coeficientes
          const coefExpr = expr.replace(/[a-zA-Z](\^[0-9]+)?/g, "");
          // Usar mathjs simplify con la variable = 1
          const testVars = "abcdefghijklmnopqrstuvwxyz".split("").reduce((acc, c) => {
            acc[c] = 1; return acc;
          }, {});
          sumCoeff = Math.round(math.evaluate(expr.replace(/\^/g, "^"), testVars) * 1e6) / 1e6;
        } catch { sumCoeff = null; }
        const note = sumCoeff !== null ? ` = ${fmt(sumCoeff)}·${key || "1"}` : "";
        steps.push({ type: "text", text: `  Parte literal "${varLabel}": ${termJoin}${note}` });
      }
    }
  }

  // ── [5] Reducir ───────────────────────────────────────────────────────────
  const s5 = isSingle ? "[4]" : "[5]";
  steps.push({ type: "section", text: `${s5} Reducir (suma de coeficientes)` });
  steps.push({ type: "step", text: "Sumamos los coeficientes de cada grupo de términos semejantes:" });

  let result;
  let simplifyOk = false;
  try {
    const expr = parts.map(p => `(${p})`).join("+");
    result = math.simplify(expr).toString();
    simplifyOk = true;
  } catch {
    result = parts.join(" + ");
  }

  steps.push({ type: "eq", text: result });

  // ── [6] Prueba por valor numérico (§36) ───────────────────────────────────
  if (simplifyOk && /[a-zA-Z]/.test(result)) {
    const s6 = isSingle ? "[5]" : "[6]";
    steps.push({ type: "section", text: `${s6} Prueba por valor numérico (§36)` });
    steps.push({ type: "text", text: "Comprobamos: la suma de los valores numéricos de los sumandos debe igualar el valor numérico de la suma." });

    const testVals = { a: 1, b: 2, c: 3, d: 4, x: 3, y: 4, z: 2, m: 2, n: 5, p: 1, s: 6, t: 7 };
    try {
      const origExpr = parts.map(p => `(${p})`).join("+");
      const origVal  = Math.round(math.evaluate(origExpr, testVals) * 1e4) / 1e4;
      const resVal   = Math.round(math.evaluate(result,   testVals) * 1e4) / 1e4;

      if (Math.abs(origVal - resVal) < 1e-6) {
        const usedVars = Object.keys(testVals)
          .filter(k => origExpr.includes(k) || result.includes(k))
          .slice(0, 6)
          .map(k => `${k}=${testVals[k]}`)
          .join(", ");
        steps.push({ type: "text", text: `Valores asignados: ${usedVars}` });
        // Mostrar valor de cada sumando
        parts.forEach((p, i) => {
          try {
            const v = Math.round(math.evaluate(`(${p})`, testVals) * 1e4) / 1e4;
            steps.push({ type: "text", text: `  Sumando${labels[i] || (i + 1)} = ${fmt(v)}` });
          } catch { /* omitir */ }
        });
        steps.push({ type: "eq", text: `Suma de sumandos = ${fmt(origVal)}` });
        steps.push({ type: "eq", text: `Valor del resultado = ${fmt(resVal)} ✓` });
      }
    } catch { /* sin verificación */ }
  }

  steps.push({ type: "result", text: `[✓] Resultado — ${result}` });
  return steps;
}
