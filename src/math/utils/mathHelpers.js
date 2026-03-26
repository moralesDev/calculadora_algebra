import * as math from "mathjs";

// Busca raíces reales de un polinomio dado por array de coeficientes.
// Para grado 1 y 2 usa fórmulas exactas; para grado > 2 usa bisección numérica.
export function getRoots(coeffs) {
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
    return [
      (-b + Math.sqrt(disc)) / (2 * a),
      (-b - Math.sqrt(disc)) / (2 * a),
    ];
  }

  return [];
}

// Busca raíces de una expresión de texto por bisección en el intervalo [min, max]
export function findRootsByBisection(exprStr, min = -15, max = 15, step = 0.05) {
  const roots = [];
  for (let x = min; x <= max; x += step) {
    try {
      const v1 = math.evaluate(exprStr, { x });
      const v2 = math.evaluate(exprStr, { x: x + step });
      if (Math.sign(v1) !== Math.sign(v2) && isFinite(v1) && isFinite(v2)) {
        let lo = x,
          hi = x + step;
        for (let it = 0; it < 60; it++) {
          const mid = (lo + hi) / 2;
          const vm = math.evaluate(exprStr, { x: mid });
          if (Math.abs(vm) < 1e-10) { lo = mid; break; }
          if (Math.sign(vm) === Math.sign(math.evaluate(exprStr, { x: lo })))
            lo = mid;
          else hi = mid;
        }
        const r = Math.round(lo * 1e4) / 1e4;
        if (!roots.some((p) => Math.abs(p - r) < 0.001)) roots.push(r);
      }
    } catch { /* continúa */ }
  }
  return roots;
}
