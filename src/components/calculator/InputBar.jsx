import { useState, useEffect } from "react";
import { SYMBOLS } from "../../constants/symbols.js";

const MODES = [
  {
    id: "auto",
    label: "Auto",
    placeholder: "Ej: x² − 3x + 2 = 0  |  d/dx x³  |  f(x) = sqrt(x−3)",
    prefix: "",
    hint: "Detección automática del tipo de problema",
  },
  {
    id: "ecuacion",
    label: "Ecuación",
    placeholder: "Ej: 2x + 5 = 11  |  x² − 5x + 6 = 0  |  abs(x−3) = 5",
    prefix: "",
    hint: "Resuelve ecuaciones de cualquier tipo",
  },
  {
    id: "funcion",
    label: "Función",
    placeholder: "Ej: x² + 3x − 4  |  sqrt(x − 2)  |  1/(x−3)",
    prefix: "f(x) = ",
    hint: "Analiza dominio, rango e intersecciones",
  },
  {
    id: "derivada",
    label: "Derivada",
    placeholder: "Ej: x³ + 2x² − 5x  |  (x+1)^3  |  x * exp(x)",
    prefix: "d/dx ",
    hint: "Calcula f'(x) e identifica puntos críticos",
  },
  {
    id: "simplificar",
    label: "Simplificar",
    placeholder: "Ej: (x+2)³  |  x² + 5x + 6  |  (x²−1)/(x+1)",
    prefix: "simplifica ",
    hint: "Expande, factoriza o simplifica expresiones",
  },
  {
    id: "sistema",
    label: "Sistema",
    placeholder: "Ej: 2x + y = 5, x − y = 1",
    prefix: "",
    hint: "Resuelve sistemas de dos ecuaciones con x e y",
  },
];

export default function InputBar({ input, setInput, inputRef, onSolve, onInsertSymbol, initialMode }) {
  const [mode, setMode] = useState(initialMode || "auto");

  // Cuando cambia el modo desde afuera (subtopic seleccionado en sidebar)
  useEffect(() => {
    if (initialMode) setMode(initialMode);
  }, [initialMode]);

  const activeMode = MODES.find((m) => m.id === mode) || MODES[0];

  function handleModeSelect(newMode) {
    const prev = MODES.find((m) => m.id === mode);
    const next = MODES.find((m) => m.id === newMode);
    setMode(newMode);

    // Si el input estaba vacío o solo tenía el prefijo anterior, inyectar nuevo prefijo
    const prevPrefix = prev?.prefix || "";
    const nextPrefix = next?.prefix || "";
    const trimmed = input.trim();
    if (!trimmed || trimmed === prevPrefix.trim()) {
      setInput(nextPrefix);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const len = nextPrefix.length;
          inputRef.current.setSelectionRange(len, len);
        }
      }, 0);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSolve();
    }
  }

  function handleInput(e) {
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
  }

  return (
    <div style={{
      background: "var(--color-background-primary)",
      borderTop: "0.5px solid var(--color-border-tertiary)",
      padding: "12px 24px 14px", flexShrink: 0,
    }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>

        {/* Selector de modo */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <span style={{
            fontSize: 11, color: "var(--color-text-tertiary)",
            fontWeight: 500, letterSpacing: 0.4, flexShrink: 0,
          }}>TIPO:</span>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => handleModeSelect(m.id)}
                title={m.hint}
                style={{
                  padding: "3px 10px", fontSize: 12, borderRadius: 20,
                  border: mode === m.id
                    ? "1px solid #534AB7"
                    : "1px solid var(--color-border-tertiary)",
                  background: mode === m.id ? "#EEEDFE" : "transparent",
                  color: mode === m.id ? "#534AB7" : "var(--color-text-secondary)",
                  cursor: "pointer", fontWeight: mode === m.id ? 500 : 400,
                  transition: "all 0.15s",
                }}
              >{m.label}</button>
            ))}
          </div>
          {/* Hint del modo activo */}
          <span style={{
            fontSize: 11, color: "var(--color-text-tertiary)",
            marginLeft: 4, fontStyle: "italic",
            overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
          }}>
            {activeMode.hint}
          </span>
        </div>

        {/* Teclado de símbolos */}
        <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
          {SYMBOLS.map((s, i) => (
            <button
              key={i}
              onClick={() => onInsertSymbol(s.v)}
              style={{
                padding: "3px 10px", fontSize: 13,
                background: "var(--color-background-secondary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: 6, cursor: "pointer",
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-mono)",
              }}
            >{s.label}</button>
          ))}
        </div>

        {/* Campo de texto + botón */}
        <div style={{
          display: "flex", alignItems: "flex-end", gap: 10,
          background: "var(--color-background-secondary)",
          border: `0.5px solid ${mode !== "auto" ? "#534AB7" : "var(--color-border-secondary)"}`,
          borderRadius: "var(--border-radius-lg)", padding: "10px 12px",
          transition: "border-color 0.15s",
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder={activeMode.placeholder}
            rows={1}
            style={{
              flex: 1, resize: "none", border: "none", outline: "none",
              background: "transparent", fontSize: 14,
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-mono)", lineHeight: 1.6, padding: 4,
            }}
          />
          <button
            onClick={() => onSolve()}
            disabled={!input.trim()}
            style={{
              background: input.trim() ? "#534AB7" : "var(--color-background-tertiary)",
              color: input.trim() ? "#fff" : "var(--color-text-tertiary)",
              border: "none", borderRadius: "var(--border-radius-md)",
              padding: "8px 20px", fontSize: 13, fontWeight: 500,
              cursor: input.trim() ? "pointer" : "default",
              transition: "all 0.15s", flexShrink: 0,
            }}
          >Resolver →</button>
        </div>

        <div style={{
          fontSize: 11, color: "var(--color-text-tertiary)",
          marginTop: 6, textAlign: "center",
        }}>
          Enter para resolver · Shift+Enter para nueva línea · Escribe en formato matemático estándar
        </div>
      </div>
    </div>
  );
}
