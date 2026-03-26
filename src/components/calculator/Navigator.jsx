import { useState } from "react";

// Limpia el texto de sección "[1] Identificación" → "Identificación"
function cleanLabel(text) {
  return text.replace(/^\[\d+\]\s*/, "");
}

export default function Navigator({ sections, scrollContainerRef }) {
  const [open, setOpen] = useState(true);

  if (sections.length === 0) return null;

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollBottom = () => {
    const el = scrollContainerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  // Agrupar secciones por item (consulta)
  const groups = sections.reduce((acc, s) => {
    const last = acc[acc.length - 1];
    if (!last || last.itemIndex !== s.itemIndex) {
      acc.push({ itemIndex: s.itemIndex, query: s.query, items: [s] });
    } else {
      last.items.push(s);
    }
    return acc;
  }, []);

  return (
    <div style={{
      position: "fixed",
      right: 14,
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 200,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 6,
      pointerEvents: "none", // el contenedor no intercepta clics
    }}>
      {/* Panel del árbol */}
      {open && (
        <div style={{
          pointerEvents: "auto",
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          padding: "8px 0",
          maxHeight: "60vh",
          overflowY: "auto",
          width: 180,
        }}>
          <div style={{
            fontSize: 10, fontWeight: 600, color: "var(--color-text-tertiary)",
            letterSpacing: 0.6, padding: "2px 12px 8px",
          }}>SECCIONES</div>

          {groups.map((group, gi) => (
            <div key={gi}>
              {/* Label de la consulta si hay más de un grupo */}
              {groups.length > 1 && (
                <div style={{
                  fontSize: 10, color: "var(--color-text-tertiary)",
                  padding: "4px 12px 2px",
                  borderTop: gi > 0 ? "0.5px solid var(--color-border-tertiary)" : "none",
                  marginTop: gi > 0 ? 4 : 0,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }} title={group.query}>
                  #{group.itemIndex + 1} {group.query.slice(0, 18)}{group.query.length > 18 ? "…" : ""}
                </div>
              )}
              {group.items.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "5px 12px", fontSize: 12,
                    color: "var(--color-text-secondary)",
                    background: "transparent", border: "none",
                    cursor: "pointer", borderRadius: 0,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}
                  title={cleanLabel(s.text)}
                >{cleanLabel(s.text)}</button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Controles */}
      <div style={{
        pointerEvents: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}>
        <button
          onClick={scrollTop}
          title="Ir arriba"
          style={btnStyle}
        >↑</button>

        <button
          onClick={() => setOpen(v => !v)}
          title={open ? "Ocultar árbol" : "Mostrar árbol"}
          style={{ ...btnStyle, background: open ? "#534AB7" : "var(--color-background-primary)", color: open ? "#fff" : "var(--color-text-secondary)" }}
        >☰</button>

        <button
          onClick={scrollBottom}
          title="Ir abajo"
          style={btnStyle}
        >↓</button>
      </div>
    </div>
  );
}

const btnStyle = {
  width: 32, height: 32,
  borderRadius: 8,
  background: "var(--color-background-primary)",
  border: "0.5px solid var(--color-border-tertiary)",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  cursor: "pointer",
  fontSize: 14,
  color: "var(--color-text-secondary)",
  display: "flex", alignItems: "center", justifyContent: "center",
};
