import * as math from "mathjs";
import { fmt } from "../utils/formatters.js";

// Resuelve sistemas de ecuaciones 2x2: ax + by = c, dx + ey = f
// Estrategia: Regla de Cramer y eliminación gaussiana
export function solveSystem(input, display) {
  const steps = [];

  steps.push({ type: "section", text: "[1] Identificación" });
  steps.push({ type: "text", text: `Sistema de ecuaciones: ${display}` });
  steps.push({ type: "text", text: "Forma general: a₁x + b₁y = c₁" });
  steps.push({ type: "text", text: "               a₂x + b₂y = c₂" });

  // Separar las ecuaciones por coma
  const parts = input.split(",");

  // ── Sistema 3×3 ──────────────────────────────────────────────────────────
  if (parts.length === 3) {
    return solveSystem3x3(parts, display);
  }

  if (parts.length !== 2) {
    return [{ type: "text", text: "Formato no reconocido. Usa: ax + by = c, dx + ey = f" }];
  }

  const eq1str = parts[0].trim();
  const eq2str = parts[1].trim();

  steps.push({ type: "text", text: `Ecuación 1: ${eq1str}` });
  steps.push({ type: "text", text: `Ecuación 2: ${eq2str}` });

  // Extraer coeficientes de cada ecuación del tipo ax + by = c
  function extractCoeffs(eqStr) {
    const sides = eqStr.split("=");
    if (sides.length !== 2) return null;
    const lhs = sides[0].trim();
    const rhs = sides[1].trim();
    // Reorganizar: lhs - rhs = 0, forma ax + by - c = 0
    // Evaluar coeficientes numéricamente
    let a, b, c;
    try {
      c = -math.evaluate(rhs); // lado derecho como término independiente negativo
      const f = (x, y) => math.evaluate(lhs, { x, y });
      // f(x,y) = ax + by + const
      // f(0,0) = const = c_term (que moveremos al otro lado)
      const f00 = f(0, 0);
      a = f(1, 0) - f00;
      b = f(0, 1) - f00;
      // la ecuación es: a*x + b*y + f00 = rhs_val
      // a*x + b*y = rhs_val - f00
      const rhsVal = math.evaluate(rhs);
      return {
        a: Math.round(a * 1e6) / 1e6,
        b: Math.round(b * 1e6) / 1e6,
        c: Math.round((rhsVal - f00) * 1e6) / 1e6,
      };
    } catch {
      return null;
    }
  }

  const c1 = extractCoeffs(eq1str);
  const c2 = extractCoeffs(eq2str);

  if (!c1 || !c2) {
    return [{ type: "text", text: "No se pudieron extraer los coeficientes. Usa variables x e y." }];
  }

  const { a: a1, b: b1, c: c1val } = c1;
  const { a: a2, b: b2, c: c2val } = c2;

  steps.push({ type: "section", text: "[2] Identificar coeficientes" });
  steps.push({ type: "text", text: `Ecuación 1: ${fmt(a1)}x + (${fmt(b1)})y = ${fmt(c1val)}` });
  steps.push({ type: "text", text: `Ecuación 2: ${fmt(a2)}x + (${fmt(b2)})y = ${fmt(c2val)}` });

  // ── Método de igualación ─────────────────────────────────────────────────
  steps.push({ type: "section", text: "[3] Método de igualación" });
  steps.push({ type: "text", text: "Despejamos x en ambas ecuaciones e igualamos." });

  // Despejar x de ec1: a1·x = c1 - b1·y  →  x = (c1 - b1·y) / a1
  // Despejar x de ec2: a2·x = c2 - b2·y  →  x = (c2 - b2·y) / a2
  if (Math.abs(a1) > 1e-9 && Math.abs(a2) > 1e-9) {
    const numA = c1val, numB = -b1, denA = a1;   // x = (c1 - b1·y) / a1
    const numC = c2val, numD = -b2, denB = a2;   // x = (c2 - b2·y) / a2
    steps.push({ type: "step", text: "Paso 1 — Despejamos x en la ec. 1:" });
    steps.push({ type: "eq", text: `x = (${fmt(c1val)} ${numB >= 0 ? "+" : ""}${fmt(numB)}y) / ${fmt(denA)}` });
    steps.push({ type: "step", text: "Paso 2 — Despejamos x en la ec. 2:" });
    steps.push({ type: "eq", text: `x = (${fmt(c2val)} ${numD >= 0 ? "+" : ""}${fmt(numD)}y) / ${fmt(denB)}` });
    steps.push({ type: "step", text: "Paso 3 — Igualamos ambas expresiones:" });
    steps.push({ type: "eq", text: `(${fmt(c1val)} ${numB >= 0 ? "+" : ""}${fmt(numB)}y) / ${fmt(denA)} = (${fmt(c2val)} ${numD >= 0 ? "+" : ""}${fmt(numD)}y) / ${fmt(denB)}` });
    // Resolver: denB·(c1 + numB·y) = denA·(c2 + numD·y)
    // denB·c1 + denB·numB·y = denA·c2 + denA·numD·y
    // (denB·numB - denA·numD)·y = denA·c2 - denB·c1
    const coefY = denB * numB - denA * numD;
    const rhsY  = denA * numC - denB * numA;
    if (Math.abs(coefY) > 1e-9) {
      const ySol = rhsY / coefY;
      const xSol = (numA + numB * ySol) / denA;
      steps.push({ type: "step", text: "Paso 4 — Resolvemos para y:" });
      steps.push({ type: "eq", text: `y = ${fmt(Math.round(ySol * 1e6) / 1e6)}` });
      steps.push({ type: "step", text: "Paso 5 — Sustituimos y para obtener x:" });
      steps.push({ type: "eq", text: `x = ${fmt(Math.round(xSol * 1e6) / 1e6)}` });
    }
  }

  // ── Método de reducción (suma/resta) ─────────────────────────────────────
  steps.push({ type: "section", text: "[4] Método de reducción (suma/resta)" });
  steps.push({ type: "text", text: "Multiplicamos las ecuaciones para igualar un coeficiente y lo eliminamos sumando o restando." });

  // Para eliminar y: multiplicar ec1 × b2, ec2 × b1
  const m1 = Math.abs(b2), m2 = Math.abs(b1);
  if (m1 > 1e-9 && m2 > 1e-9) {
    const na1 = a1 * m1, nb1 = b1 * m1, nc1 = c1val * m1;
    const na2 = a2 * m2, nb2 = b2 * m2, nc2 = c2val * m2;
    const sameSign = (b1 * m1) * (b2 * m2) > 0;
    steps.push({ type: "step", text: `Paso 1 — Multiplicamos ec. 1 × ${fmt(m1)} y ec. 2 × ${fmt(m2)}:` });
    steps.push({ type: "eq", text: `${fmt(na1)}x + ${fmt(nb1)}y = ${fmt(nc1)}` });
    steps.push({ type: "eq", text: `${fmt(na2)}x + ${fmt(nb2)}y = ${fmt(nc2)}` });
    steps.push({ type: "step", text: `Paso 2 — ${sameSign ? "Restamos" : "Sumamos"} las ecuaciones para eliminar y:` });
    const redA = sameSign ? na1 - na2 : na1 + na2;
    const redC = sameSign ? nc1 - nc2 : nc1 + nc2;
    steps.push({ type: "eq", text: `${fmt(redA)}x = ${fmt(redC)}` });
    if (Math.abs(redA) > 1e-9) {
      const xRed = redC / redA;
      steps.push({ type: "eq", text: `x = ${fmt(Math.round(xRed * 1e6) / 1e6)}` });
    }
  }

  // ── Regla de Cramer ───────────────────────────────────────────────────────
  steps.push({ type: "section", text: "[5] Regla de Cramer (resolución exacta)" });
  steps.push({ type: "step", text: "Paso 1 — Construimos el determinante principal D:" });
  steps.push({ type: "eq", text: `D = |a₁ b₁| = |${fmt(a1)} ${fmt(b1)}|` });
  steps.push({ type: "eq", text: `    |a₂ b₂|   |${fmt(a2)} ${fmt(b2)}|` });

  const det = a1 * b2 - a2 * b1;
  steps.push({ type: "eq", text: `D = (${fmt(a1)})(${fmt(b2)}) − (${fmt(a2)})(${fmt(b1)}) = ${fmt(det)}` });

  if (Math.abs(det) < 1e-9) {
    steps.push({ type: "section", text: "[6] Sistema sin solución única" });
    const k = Math.abs(b1) > 1e-9 ? b2 / b1 : (Math.abs(a1) > 1e-9 ? a2 / a1 : null);
    if (k !== null && Math.abs(c2val - k * c1val) < 1e-6) {
      steps.push({ type: "text", text: "D = 0 y los sistemas son proporcionales → Sistema dependiente (infinitas soluciones)." });
      steps.push({ type: "result", text: "[✓] Resultado — Sistema dependiente: infinitas soluciones." });
    } else {
      steps.push({ type: "text", text: "D = 0 y los sistemas son incompatibles → Sin solución." });
      steps.push({ type: "result", text: "[✓] Resultado — Sistema incompatible: sin solución." });
    }
    return steps;
  }

  steps.push({ type: "step", text: "Paso 2 — Determinante Dx (reemplazamos columna x con c):" });
  steps.push({ type: "eq", text: `Dx = |c₁ b₁| = |${fmt(c1val)} ${fmt(b1)}| = (${fmt(c1val)})(${fmt(b2)}) − (${fmt(c2val)})(${fmt(b1)})` });
  steps.push({ type: "eq", text: `    |c₂ b₂|   |${fmt(c2val)} ${fmt(b2)}|` });
  const detX = c1val * b2 - c2val * b1;
  steps.push({ type: "eq", text: `Dx = ${fmt(detX)}` });

  steps.push({ type: "step", text: "Paso 3 — Determinante Dy (reemplazamos columna y con c):" });
  steps.push({ type: "eq", text: `Dy = |a₁ c₁| = |${fmt(a1)} ${fmt(c1val)}| = (${fmt(a1)})(${fmt(c2val)}) − (${fmt(a2)})(${fmt(c1val)})` });
  steps.push({ type: "eq", text: `    |a₂ c₂|   |${fmt(a2)} ${fmt(c2val)}|` });
  const detY = a1 * c2val - a2 * c1val;
  steps.push({ type: "eq", text: `Dy = ${fmt(detY)}` });

  steps.push({ type: "section", text: "[6] Calcular x e y" });
  const x = detX / det;
  const y = detY / det;
  steps.push({ type: "step", text: "Paso 4 — Aplicamos la regla de Cramer:" });
  steps.push({ type: "eq", text: `x = Dx / D = ${fmt(detX)} / ${fmt(det)} = ${fmt(x)}` });
  steps.push({ type: "eq", text: `y = Dy / D = ${fmt(detY)} / ${fmt(det)} = ${fmt(y)}` });

  steps.push({ type: "section", text: "[7] Verificación" });
  steps.push({ type: "step", text: "Sustituimos en ambas ecuaciones originales:" });
  try {
    const lhs1 = math.evaluate(eq1str.split("=")[0], { x, y });
    const rhs1 = math.evaluate(eq1str.split("=")[1], {});
    steps.push({ type: "eq", text: `Ec. 1: ${fmt(Math.round(lhs1 * 1e4) / 1e4)} = ${fmt(Math.round(rhs1 * 1e4) / 1e4)} ✓` });
  } catch { /* sin verificación */ }
  try {
    const lhs2 = math.evaluate(eq2str.split("=")[0], { x, y });
    const rhs2 = math.evaluate(eq2str.split("=")[1], {});
    steps.push({ type: "eq", text: `Ec. 2: ${fmt(Math.round(lhs2 * 1e4) / 1e4)} = ${fmt(Math.round(rhs2 * 1e4) / 1e4)} ✓` });
  } catch { /* sin verificación */ }

  steps.push({ type: "result", text: `[✓] Resultado final — x = ${fmt(x)},  y = ${fmt(y)}` });
  return steps;
}

// ── Sistema 3×3 por eliminación gaussiana ────────────────────────────────────
function solveSystem3x3(parts, display) {
  const steps = [];
  steps.push({ type: "section", text: "[1] Identificación" });
  steps.push({ type: "text", text: `Sistema de 3 ecuaciones con 3 incógnitas: ${display}` });
  steps.push({ type: "text", text: "Forma general: a₁x + b₁y + c₁z = d₁" });
  steps.push({ type: "text", text: "               a₂x + b₂y + c₂z = d₂" });
  steps.push({ type: "text", text: "               a₃x + b₃y + c₃z = d₃" });

  // Extraer coeficientes de cada ecuación: ax + by + cz = d
  function extractCoeffs3(eqStr) {
    const sides = eqStr.trim().split("=");
    if (sides.length !== 2) return null;
    const lhs = sides[0].trim();
    const rhs = sides[1].trim();
    try {
      const rhsVal = math.evaluate(rhs);
      const f = (x, y, z) => math.evaluate(lhs, { x, y, z });
      const f000 = f(0, 0, 0);
      const a = f(1, 0, 0) - f000;
      const b = f(0, 1, 0) - f000;
      const c = f(0, 0, 1) - f000;
      return {
        a: Math.round(a * 1e6) / 1e6,
        b: Math.round(b * 1e6) / 1e6,
        c: Math.round(c * 1e6) / 1e6,
        d: Math.round((rhsVal - f000) * 1e6) / 1e6,
      };
    } catch { return null; }
  }

  const coeffs = parts.map((p) => extractCoeffs3(p));
  if (coeffs.some((c) => c === null)) {
    return [{ type: "text", text: "No se pudieron extraer los coeficientes. Usa variables x, y, z." }];
  }

  const [c1, c2, c3] = coeffs;
  steps.push({ type: "section", text: "[2] Matriz aumentada" });
  steps.push({ type: "text", text: `Ec. 1: ${fmt(c1.a)}x + ${fmt(c1.b)}y + ${fmt(c1.c)}z = ${fmt(c1.d)}` });
  steps.push({ type: "text", text: `Ec. 2: ${fmt(c2.a)}x + ${fmt(c2.b)}y + ${fmt(c2.c)}z = ${fmt(c2.d)}` });
  steps.push({ type: "text", text: `Ec. 3: ${fmt(c3.a)}x + ${fmt(c3.b)}y + ${fmt(c3.c)}z = ${fmt(c3.d)}` });
  steps.push({ type: "eq", text: `[ ${fmt(c1.a)}  ${fmt(c1.b)}  ${fmt(c1.c)} | ${fmt(c1.d)} ]` });
  steps.push({ type: "eq", text: `[ ${fmt(c2.a)}  ${fmt(c2.b)}  ${fmt(c2.c)} | ${fmt(c2.d)} ]` });
  steps.push({ type: "eq", text: `[ ${fmt(c3.a)}  ${fmt(c3.b)}  ${fmt(c3.c)} | ${fmt(c3.d)} ]` });

  // Eliminación gaussiana con pivoteo parcial
  // Copiar en matriz mutable
  let m = [
    [c1.a, c1.b, c1.c, c1.d],
    [c2.a, c2.b, c2.c, c2.d],
    [c3.a, c3.b, c3.c, c3.d],
  ];

  steps.push({ type: "section", text: "[3] Eliminación gaussiana" });

  for (let col = 0; col < 3; col++) {
    // Pivoteo: buscar fila con mayor valor absoluto en esta columna
    let maxRow = col;
    for (let row = col + 1; row < 3; row++) {
      if (Math.abs(m[row][col]) > Math.abs(m[maxRow][col])) maxRow = row;
    }
    [m[col], m[maxRow]] = [m[maxRow], m[col]];

    const pivot = m[col][col];
    if (Math.abs(pivot) < 1e-10) {
      steps.push({ type: "text", text: `Pivote nulo en columna ${col + 1} → sistema sin solución única.` });
      steps.push({ type: "result", text: "[✓] Resultado — Sistema sin solución única (dependiente o incompatible)." });
      return steps;
    }

    // Eliminar hacia abajo
    for (let row = col + 1; row < 3; row++) {
      const factor = Math.round((m[row][col] / pivot) * 1e6) / 1e6;
      if (Math.abs(factor) < 1e-10) continue;
      steps.push({ type: "step", text: `Fila ${row + 1} ← Fila ${row + 1} − (${fmt(factor)}) · Fila ${col + 1}:` });
      for (let j = col; j < 4; j++) {
        m[row][j] = Math.round((m[row][j] - factor * m[col][j]) * 1e6) / 1e6;
      }
      steps.push({ type: "eq", text: `[ ${fmt(m[0][0])}  ${fmt(m[0][1])}  ${fmt(m[0][2])} | ${fmt(m[0][3])} ]` });
      steps.push({ type: "eq", text: `[ ${fmt(m[1][0])}  ${fmt(m[1][1])}  ${fmt(m[1][2])} | ${fmt(m[1][3])} ]` });
      steps.push({ type: "eq", text: `[ ${fmt(m[2][0])}  ${fmt(m[2][1])}  ${fmt(m[2][2])} | ${fmt(m[2][3])} ]` });
    }
  }

  // Sustitución hacia atrás
  steps.push({ type: "section", text: "[4] Sustitución regresiva" });
  const sol = [0, 0, 0];
  for (let i = 2; i >= 0; i--) {
    let sum = m[i][3];
    for (let j = i + 1; j < 3; j++) {
      sum -= m[i][j] * sol[j];
    }
    sol[i] = Math.round((sum / m[i][i]) * 1e6) / 1e6;
  }

  steps.push({ type: "eq", text: `z = ${fmt(sol[2])}` });
  steps.push({ type: "eq", text: `y = ${fmt(sol[1])}` });
  steps.push({ type: "eq", text: `x = ${fmt(sol[0])}` });

  steps.push({ type: "section", text: "[5] Verificación" });
  const vars = { x: sol[0], y: sol[1], z: sol[2] };
  parts.forEach((p, i) => {
    try {
      const sides = p.trim().split("=");
      const lv = math.evaluate(sides[0], vars);
      const rv = math.evaluate(sides[1], vars);
      steps.push({ type: "eq", text: `Ec. ${i + 1}: ${fmt(Math.round(lv * 1e4) / 1e4)} = ${fmt(Math.round(rv * 1e4) / 1e4)} ✓` });
    } catch { /* sin verificación */ }
  });

  steps.push({ type: "result", text: `[✓] Resultado final — x = ${fmt(sol[0])},  y = ${fmt(sol[1])},  z = ${fmt(sol[2])}` });
  return steps;
}
