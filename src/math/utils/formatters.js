// Convierte un número a string, eliminando decimales innecesarios
export function fmt(n) {
  if (typeof n !== "number") return String(n);
  const r = Math.round(n * 10000) / 10000;
  return Number.isInteger(r) ? String(r) : String(r);
}

// Formatea un coeficiente con su variable y potencia (ej: 3x², x, 5)
export function fmtCoef(c, variable = "x", power = 1) {
  const a = Math.abs(c);
  if (power === 0) return fmt(c);
  const varPart =
    power === 1
      ? variable
      : `${variable}${["", "", "²", "³", "⁴", "⁵"][power] || `^${power}`}`;
  if (a === 1) return varPart;
  return `${fmt(a)}${varPart}`;
}

// Convierte el output de mathjs ("x ^ 3 - 3 * x ^ 2") a formato legible ("x³ − 3x²")
export function prettify(str) {
  const sup = { 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  return str
    // x ^ N  →  xᴺ
    .replace(/x\s*\^\s*(\d+)/g, (_, n) => "x" + (sup[n] || `^${n}`))
    // N * x  →  Nx  (coeficiente por variable)
    .replace(/(\d)\s*\*\s*x/g, "$1x")
    // operadores con espacios bonitos y minus tipográfico
    .replace(/\s*-\s*/g, " − ")
    .replace(/\s*\+\s*/g, " + ")
    .trim();
}

// Convierte un array de coeficientes [a, b, c] a string "ax² + bx + c"
export function polyToString(coeffs, variable = "x") {
  const deg = coeffs.length - 1;
  const terms = [];
  for (let i = deg; i >= 0; i--) {
    const c = coeffs[deg - i];
    if (c === 0) continue;
    const sign = c < 0 ? "−" : "+";
    const abs = Math.abs(c);
    const varStr =
      i === 0
        ? ""
        : i === 1
        ? variable
        : `${variable}${["", "", "²", "³", "⁴", "⁵"][i] || `^${i}`}`;
    const coefStr = abs === 1 && i > 0 ? "" : fmt(abs);
    terms.push({ sign, str: coefStr + varStr });
  }
  if (!terms.length) return "0";
  let result = (terms[0].sign === "−" ? "−" : "") + terms[0].str;
  for (let i = 1; i < terms.length; i++)
    result += ` ${terms[i].sign} ${terms[i].str}`;
  return result;
}
