const FEATURE_CARDS = [
  { title: "Ecuaciones", desc: "Lineales, cuadráticas y polinomiales con verificación", icon: "=" },
  { title: "Derivadas", desc: "Reglas de derivación con puntos críticos", icon: "d/dx" },
  { title: "Dominio y Rango", desc: "Análisis de restricciones en funciones", icon: "f(x)" },
  { title: "Simplificar", desc: "Expandir y simplificar expresiones algebraicas", icon: "≡" },
];

export default function WelcomeScreen() {
  return (
    <div style={{ maxWidth: 620, margin: "40px auto", textAlign: "center" }}>
      <div style={{
        width: 56, height: 56, borderRadius: 14, background: "#534AB7",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24, color: "#fff", margin: "0 auto 16px",
      }}>Σ</div>

      <div style={{ fontSize: 22, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 8 }}>
        Calculadora de Álgebra
      </div>
      <div style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 8, lineHeight: 1.6 }}>
        Solución completa paso a paso. Todos los cálculos se realizan localmente en tu navegador.
      </div>
      <div style={{ fontSize: 13, color: "#1D9E75", marginBottom: 32, fontWeight: 500 }}>
        ✓ Sin tokens · Sin costo · Sin internet requerido
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, textAlign: "left" }}>
        {FEATURE_CARDS.map((card, i) => (
          <div key={i} style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)", padding: "14px 16px",
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8, background: "#EEEDFE",
              color: "#534AB7", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 12, fontWeight: 500, marginBottom: 8,
            }}>{card.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 4 }}>
              {card.title}
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", lineHeight: 1.5 }}>
              {card.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
