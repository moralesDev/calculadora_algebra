import { useState } from "react";
import { CATEGORIES } from "../../constants/categories.js";

export default function Sidebar({ activeCategory, onSelectCategory, onSelectSubtopic }) {
  const [openCategory, setOpenCategory] = useState(activeCategory ?? 0);

  function handleCategoryClick(i) {
    setOpenCategory(i === openCategory ? null : i);
    onSelectCategory(i);
  }

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

        {CATEGORIES.map((cat, i) => {
          const isOpen = openCategory === i;
          return (
            <div key={i}>
              {/* Categoría principal */}
              <button
                onClick={() => handleCategoryClick(i)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 10px", borderRadius: "var(--border-radius-md)",
                  background: isOpen ? "var(--color-background-secondary)" : "transparent",
                  border: "none", cursor: "pointer", textAlign: "left", marginBottom: 2,
                }}
              >
                <span style={{
                  width: 26, height: 26, borderRadius: 6,
                  background: isOpen ? "#EEEDFE" : "var(--color-background-secondary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 500,
                  color: isOpen ? "#534AB7" : "var(--color-text-secondary)",
                  flexShrink: 0,
                }}>{cat.icon}</span>
                <span style={{
                  fontSize: 13, flex: 1,
                  fontWeight: isOpen ? 500 : 400,
                  color: isOpen ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                }}>{cat.label}</span>
                <span style={{
                  fontSize: 10, color: "var(--color-text-tertiary)",
                  transform: isOpen ? "rotate(90deg)" : "none",
                  transition: "transform 0.15s",
                }}>▶</span>
              </button>

              {/* Subtemas */}
              {isOpen && (
                <div style={{ paddingLeft: 8, marginBottom: 4 }}>
                  {cat.subtopics.map((sub, j) => (
                    <button
                      key={j}
                      onClick={() => onSelectSubtopic(cat, sub)}
                      style={{
                        width: "100%", textAlign: "left",
                        padding: "6px 10px 6px 26px",
                        fontSize: 12, color: "var(--color-text-secondary)",
                        background: "transparent", border: "none", cursor: "pointer",
                        borderRadius: 6, display: "flex", alignItems: "center", gap: 6,
                        position: "relative",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = "var(--color-background-secondary)";
                        e.currentTarget.style.color = "var(--color-text-primary)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--color-text-secondary)";
                      }}
                    >
                      <span style={{
                        position: "absolute", left: 12, top: "50%",
                        transform: "translateY(-50%)",
                        width: 3, height: 3, borderRadius: "50%",
                        background: "var(--color-text-tertiary)",
                      }} />
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
