import { useEffect, useRef, useCallback } from "react";
import * as math from "mathjs";

const CURVE_COLORS = ["#534AB7", "#E05C2A", "#1D9E75", "#E0A82A"];
const CURVE_LABELS = ["f(x)", "f'(x)", "g(x)", "h(x)"];
const DEFAULT_SCALE = 50; // píxeles por unidad

// Calcula un paso de grilla "bonito" (1, 2, 5, 10, 20, 50…)
function niceStep(scale) {
  const target = 70; // píxeles entre líneas de grilla deseados
  const raw = target / scale;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / mag;
  return n < 2 ? mag : n < 5 ? 2 * mag : 5 * mag;
}

function fmtLabel(n) {
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 10000 || abs < 0.001) return n.toExponential(1);
  return parseFloat(n.toPrecision(4)).toString();
}

export default function Graph({ exprs }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ panX: 0, panY: 0, scale: DEFAULT_SCALE });
  const dragRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const { panX, panY, scale } = stateRef.current;
    const toPixX = (wx) => W / 2 + panX + wx * scale;
    const toPixY = (wy) => H / 2 + panY - wy * scale;
    const toWX   = (px) => (px - W / 2 - panX) / scale;
    const toWY   = (py) => -(py - H / 2 - panY) / scale;

    // Colores según dark mode
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const bg          = dark ? "#1a1a18" : "#fafaf8";
    const gridColor   = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
    const axisColor   = dark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.22)";
    const labelColor  = dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.38)";

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const step = niceStep(scale);
    const x0w = toWX(0), x1w = toWX(W);
    const y0w = toWY(H), y1w = toWY(0); // y0w < y1w

    // Grilla
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let gx = Math.ceil(x0w / step) * step; gx <= x1w; gx += step) {
      ctx.moveTo(toPixX(gx), 0);
      ctx.lineTo(toPixX(gx), H);
    }
    for (let gy = Math.ceil(y0w / step) * step; gy <= y1w; gy += step) {
      ctx.moveTo(0, toPixY(gy));
      ctx.lineTo(W, toPixY(gy));
    }
    ctx.stroke();

    // Ejes
    const axX = Math.max(0, Math.min(W, toPixX(0)));
    const axY = Math.max(0, Math.min(H, toPixY(0)));
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, axY); ctx.lineTo(W, axY);
    ctx.moveTo(axX, 0); ctx.lineTo(axX, H);
    ctx.stroke();

    // Flechas de ejes
    const arr = 7;
    ctx.fillStyle = axisColor;
    // eje x →
    ctx.beginPath();
    ctx.moveTo(W, axY);
    ctx.lineTo(W - arr, axY - arr / 2);
    ctx.lineTo(W - arr, axY + arr / 2);
    ctx.closePath(); ctx.fill();
    // eje y ↑
    ctx.beginPath();
    ctx.moveTo(axX, 0);
    ctx.lineTo(axX - arr / 2, arr);
    ctx.lineTo(axX + arr / 2, arr);
    ctx.closePath(); ctx.fill();

    // Etiquetas de los ejes ("x", "y")
    ctx.font = `italic 13px serif`;
    ctx.fillStyle = axisColor;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("x", W - 14, axY + 14);
    ctx.textAlign = "center";
    ctx.fillText("y", axX - 14, 10);

    // Numeración de la grilla
    ctx.font = `11px 'SFMono-Regular', Consolas, monospace`;
    ctx.fillStyle = labelColor;
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    const numY = Math.min(Math.max(axY + 5, 4), H - 16);
    for (let gx = Math.ceil(x0w / step) * step; gx <= x1w; gx += step) {
      if (Math.abs(gx) < step * 0.01) continue;
      ctx.fillText(fmtLabel(gx), toPixX(gx), numY);
    }
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const numX = Math.min(Math.max(axX - 5, 5), W - 5);
    for (let gy = Math.ceil(y0w / step) * step; gy <= y1w; gy += step) {
      if (Math.abs(gy) < step * 0.01) continue;
      ctx.fillText(fmtLabel(gy), numX, toPixY(gy));
    }

    // Curvas
    exprs.forEach((expr, ei) => {
      if (!expr) return;
      ctx.strokeStyle = CURVE_COLORS[ei % CURVE_COLORS.length];
      ctx.lineWidth = 2.2;
      ctx.lineJoin = "round";
      ctx.beginPath();
      let penDown = false;
      let prevPy = null;
      for (let px = 0; px <= W; px++) {
        const wx = toWX(px);
        let wy;
        try {
          wy = math.evaluate(expr, { x: wx });
          if (typeof wy !== "number" || !isFinite(wy) || isNaN(wy)) throw new Error();
        } catch {
          penDown = false;
          prevPy = null;
          continue;
        }
        const py = toPixY(wy);
        // Detectar discontinuidades (saltos bruscos → levantar pluma)
        if (prevPy !== null && Math.abs(py - prevPy) > H * 1.2) {
          penDown = false;
        }
        if (!penDown) { ctx.moveTo(px, py); penDown = true; }
        else ctx.lineTo(px, py);
        prevPy = py;
      }
      ctx.stroke();
    });

    // Leyenda (solo si hay más de una curva)
    if (exprs.length > 1) {
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      ctx.font = `bold 11px 'SFMono-Regular', Consolas, monospace`;
      exprs.forEach((_, ei) => {
        const lx = 10, ly = 10 + ei * 20;
        ctx.fillStyle = CURVE_COLORS[ei % CURVE_COLORS.length];
        ctx.fillRect(lx, ly - 1, 18, 3);
        ctx.fillText(CURVE_LABELS[ei] || `f${ei + 1}(x)`, lx + 24, ly);
      });
    }
  }, [exprs]);

  // Ajustar tamaño del canvas al contenedor
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width  = rect.width  * dpr;
      canvas.height = rect.height * dpr;
      draw();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);
    resize();
    return () => ro.disconnect();
  }, [draw]);

  // Redibujar cuando cambian las expresiones
  useEffect(() => { draw(); }, [draw]);

  // Zoom con rueda del mouse (centrado en el cursor)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e) => {
      e.preventDefault();
      const rect  = canvas.getBoundingClientRect();
      const dpr   = window.devicePixelRatio || 1;
      const W     = canvas.width  / dpr;
      const H     = canvas.height / dpr;
      const mx    = e.clientX - rect.left;
      const my    = e.clientY - rect.top;
      const { panX, panY, scale } = stateRef.current;
      const factor   = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      const newScale = Math.max(4, Math.min(3000, scale * factor));
      // El punto del mundo bajo el cursor debe quedar fijo
      const wx = (mx - W / 2 - panX) / scale;
      const wy = -(my - H / 2 - panY) / scale;
      stateRef.current = {
        panX: mx - W / 2 - wx * newScale,
        panY: my - H / 2 + wy * newScale,
        scale: newScale,
      };
      draw();
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [draw]);

  // Arrastrar para mover (pan)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onDown = (e) => {
      dragRef.current = { x: e.clientX, y: e.clientY, panX: stateRef.current.panX, panY: stateRef.current.panY };
      canvas.style.cursor = "grabbing";
    };
    const onMove = (e) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.x;
      const dy = e.clientY - dragRef.current.y;
      stateRef.current = { ...stateRef.current, panX: dragRef.current.panX + dx, panY: dragRef.current.panY + dy };
      draw();
    };
    const onUp = () => {
      dragRef.current = null;
      canvas.style.cursor = "grab";
    };
    canvas.style.cursor = "grab";
    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      canvas.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [draw]);

  const reset = () => {
    stateRef.current = { panX: 0, panY: 0, scale: DEFAULT_SCALE };
    draw();
  };

  return (
    <div style={{
      marginTop: 16,
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: "var(--border-radius-lg)",
      overflow: "hidden",
    }}>
      {/* Barra superior */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "7px 12px",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        background: "var(--color-background-primary)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)", letterSpacing: 0.5 }}>
            GRÁFICA
          </span>
          {exprs.map((_, i) => (
            <span key={i} style={{
              fontSize: 11, padding: "1px 7px", borderRadius: 20,
              background: CURVE_COLORS[i] + "22",
              color: CURVE_COLORS[i], fontWeight: 500,
            }}>{CURVE_LABELS[i]}</span>
          ))}
        </div>
        <button
          onClick={reset}
          title="Volver al origen"
          style={{
            fontSize: 12, color: "var(--color-text-secondary)",
            background: "var(--color-background-secondary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: 6, padding: "3px 10px", cursor: "pointer",
          }}
        >⌖ Centrar</button>
      </div>

      {/* Canvas */}
      <div style={{ position: "relative", height: 300 }}>
        <canvas
          ref={canvasRef}
          style={{ display: "block", width: "100%", height: "100%" }}
        />
      </div>

      {/* Pie */}
      <div style={{
        padding: "5px 12px", fontSize: 10, color: "var(--color-text-tertiary)",
        textAlign: "center",
        borderTop: "0.5px solid var(--color-border-tertiary)",
        background: "var(--color-background-primary)",
      }}>
        Scroll para zoom · Arrastrar para mover · ⌖ Centrar para volver al origen
      </div>
    </div>
  );
}
