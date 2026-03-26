// Renderiza la lista de pasos devuelta por los solvers.
// Cada paso tiene un `type` que determina su estilo visual.
export default function StepDisplay({ steps }) {
  return (
    <div style={{ lineHeight: 1.9 }}>
      {steps.map((s, i) => {
        switch (s.type) {
          case "section":
            return (
              <div key={i} style={{
                fontSize: 13, fontWeight: 500, color: "#534AB7",
                marginTop: 14, marginBottom: 4,
                paddingBottom: 4, borderBottom: "0.5px solid #AFA9EC",
              }}>{s.text}</div>
            );

          case "result":
            return (
              <div key={i} style={{
                background: "#EEEDFE", borderLeft: "3px solid #534AB7",
                borderRadius: "0 6px 6px 0", padding: "8px 14px",
                marginTop: 12, fontSize: 14, fontWeight: 500, color: "#26215C",
              }}>{s.text}</div>
            );

          case "step":
            return (
              <div key={i} style={{
                fontSize: 14, fontWeight: 500,
                color: "var(--color-text-primary)", marginTop: 8, marginBottom: 2,
              }}>{s.text}</div>
            );

          case "eq":
            return (
              <div key={i} style={{
                fontFamily: "var(--font-mono)", fontSize: 14,
                color: "var(--color-text-primary)",
                background: "var(--color-background-secondary)",
                borderRadius: 6, padding: "5px 12px", margin: "3px 0",
                display: "inline-block", minWidth: 120,
              }}>{s.text}</div>
            );

          default: // "text"
            return (
              <div key={i} style={{
                fontSize: 14, color: "var(--color-text-secondary)",
                paddingLeft: s.text.startsWith("   ") ? 16 : 0,
              }}>{s.text}</div>
            );
        }
      })}
    </div>
  );
}
