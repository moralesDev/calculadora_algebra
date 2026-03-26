import StepDisplay from "./StepDisplay.jsx";
import Graph from "./Graph.jsx";

export default function MessageThread({ history, error, bottomRef }) {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      {history.map((item, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Burbuja del usuario */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, alignItems: "flex-start" }}>
            <div style={{
              background: "#534AB7", color: "#fff",
              borderRadius: "var(--border-radius-lg)", padding: "10px 18px",
              fontSize: 14, fontFamily: "var(--font-mono)", maxWidth: "75%",
            }}>{item.query}</div>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: "var(--color-background-secondary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, color: "var(--color-text-secondary)",
              flexShrink: 0, marginTop: 2,
            }}>U</div>
          </div>

          {/* Respuesta del sistema */}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: "#534AB7", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 500, flexShrink: 0, marginTop: 2,
            }}>Σ</div>
            <div style={{
              flex: 1, background: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: "var(--border-radius-lg)", padding: "16px 20px",
            }}>
              <div style={{
                fontSize: 11, color: "var(--color-text-tertiary)",
                marginBottom: 10, fontWeight: 500, letterSpacing: 0.5,
              }}>SOLUCIÓN PASO A PASO</div>
              <StepDisplay steps={item.steps} itemIndex={i} />
              {item.graphExprs?.length > 0 && (
                <Graph exprs={item.graphExprs} />
              )}
            </div>
          </div>
        </div>
      ))}

      {error && (
        <div style={{
          background: "var(--color-background-danger)",
          border: "0.5px solid var(--color-border-danger)",
          borderRadius: "var(--border-radius-md)", padding: "10px 16px",
          fontSize: 13, color: "var(--color-text-danger)",
        }}>{error}</div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
