import { CATEGORIES } from "../../constants/categories.js";
import { EXAMPLES } from "../../constants/examples.js";

export default function Sidebar({ activeCategory, onSelectCategory, onSelectExample, onRunExample }) {
  return (
    <div style={{
      width: 220, flexShrink: 0,
      background: "var(--color-background-primary)",
      borderRight: "0.5px solid var(--color-border-tertiary)",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      {/* Logo */}
      <div style={{
        padding: "16px 16px 12px",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: "#534AB7",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 500, color: "#fff",
        }}>Σ</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)" }}>
            Math
          </div>
          <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>
            Calculadora algebraica
          </div>
        </div>
      </div>

      {/* Navegación */}
      <div style={{ padding: "12px 8px", flex: 1, overflowY: "auto" }}>
        <div style={{
          fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)",
          padding: "0 8px 8px", letterSpacing: 0.5,
        }}>CALCULADORAS</div>

        {CATEGORIES.map((cat, i) => (
          <div key={i}>
            <button
              onClick={() => onSelectCategory(i)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", borderRadius: "var(--border-radius-md)",
                background: activeCategory === i ? "var(--color-background-secondary)" : "transparent",
                border: "none", cursor: "pointer", textAlign: "left", marginBottom: 2,
              }}
            >
              <span style={{
                width: 26, height: 26, borderRadius: 6,
                background: activeCategory === i ? "#EEEDFE" : "var(--color-background-secondary)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 500,
                color: activeCategory === i ? "#534AB7" : "var(--color-text-secondary)",
                flexShrink: 0,
              }}>{cat.icon}</span>
              <span style={{
                fontSize: 13,
                fontWeight: activeCategory === i ? 500 : 400,
                color: activeCategory === i ? "var(--color-text-primary)" : "var(--color-text-secondary)",
              }}>{cat.label}</span>
            </button>

            {activeCategory === i && (
              <div style={{ paddingLeft: 12, marginBottom: 4 }}>
                {cat.items.map((item, j) => (
                  <button
                    key={j}
                    onClick={() => onSelectExample(item)}
                    style={{
                      width: "100%", textAlign: "left", padding: "5px 10px",
                      fontSize: 12, color: "var(--color-text-secondary)",
                      background: "transparent", border: "none", cursor: "pointer",
                      borderRadius: 6, fontFamily: "var(--font-mono)",
                    }}
                  >{item}</button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Ejemplos rápidos */}
        <div style={{ marginTop: 16 }}>
          <div style={{
            fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)",
            padding: "0 8px 8px", letterSpacing: 0.5,
          }}>EJEMPLOS RÁPIDOS</div>
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => onRunExample(ex.label)}
              style={{
                width: "100%", textAlign: "left", padding: "7px 10px",
                fontSize: 12, background: "transparent", border: "none",
                cursor: "pointer", borderRadius: 6, marginBottom: 2,
                fontFamily: "var(--font-mono)",
              }}
            >
              <div style={{ color: "var(--color-text-primary)", marginBottom: 1 }}>
                {ex.label}
              </div>
              <div style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>
                {ex.tag}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
    </div>
  );
}
