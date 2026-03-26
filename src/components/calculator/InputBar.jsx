import { SYMBOLS } from "../../constants/symbols.js";

export default function InputBar({ input, setInput, inputRef, onSolve, onInsertSymbol }) {
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
          border: "0.5px solid var(--color-border-secondary)",
          borderRadius: "var(--border-radius-lg)", padding: "10px 12px",
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Ej: x³ − 3x² − x + 3 = 0  |  d/dx x^4 - 2x^2  |  f(x) = sqrt(x-3)"
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
