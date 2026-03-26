import { prettify } from "../../math/utils/formatters.js";

export default function SubtopicExamples({ subtopic, categoryLabel, onRunExample }) {
  return (
    <div style={{
      maxWidth: 680, margin: "40px auto 0", padding: "0 8px",
    }}>
      {/* Encabezado */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginBottom: 6 }}>
          {categoryLabel}
        </div>
        <h2 style={{
          fontSize: 22, fontWeight: 600,
          color: "var(--color-text-primary)", margin: 0,
        }}>
          {subtopic.label}
        </h2>
        <p style={{
          fontSize: 13, color: "var(--color-text-secondary)",
          margin: "8px 0 0",
        }}>
          Selecciona un ejemplo para resolverlo
        </p>
      </div>

      {/* Cards de ejemplos */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {subtopic.examples.map((example, i) => (
          <button
            key={i}
            onClick={() => onRunExample(example)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 18px",
              background: "var(--color-background-primary)",
              border: "1px solid var(--color-border-tertiary)",
              borderRadius: "var(--border-radius-lg)",
              cursor: "pointer", textAlign: "left", width: "100%",
              transition: "border-color 0.15s, background 0.15s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "#534AB7";
              e.currentTarget.style.background = "var(--color-background-secondary)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--color-border-tertiary)";
              e.currentTarget.style.background = "var(--color-background-primary)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: "var(--color-background-secondary)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 600, color: "#534AB7", flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 14,
                color: "var(--color-text-primary)",
              }}>
                {prettify(example)}
              </span>
            </div>
            <span style={{
              fontSize: 16, color: "var(--color-text-tertiary)", flexShrink: 0,
            }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
}
