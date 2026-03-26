export default function Header({ onToggleSidebar, onClearHistory, hasHistory }) {
  return (
    <div style={{
      background: "var(--color-background-primary)",
      borderBottom: "0.5px solid var(--color-border-tertiary)",
      padding: "0 16px", height: 52,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={onToggleSidebar}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--color-text-secondary)", fontSize: 18 }}
        >☰</button>
        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>
          Calculadora de Álgebra
        </div>
        <Badge color="#534AB7" bg="#EEEDFE">Paso a paso</Badge>
        <Badge color="#0F6E56" bg="#E1F5EE">100% local</Badge>
      </div>

      {hasHistory && (
        <button
          onClick={onClearHistory}
          style={{
            fontSize: 12, color: "var(--color-text-secondary)",
            background: "none", border: "0.5px solid var(--color-border-secondary)",
            borderRadius: "var(--border-radius-md)", padding: "5px 12px", cursor: "pointer",
          }}
        >Nueva sesión</button>
      )}
    </div>
  );
}

function Badge({ children, color, bg }) {
  return (
    <div style={{
      fontSize: 11, padding: "2px 8px", borderRadius: 20,
      background: bg, color, fontWeight: 500,
    }}>{children}</div>
  );
}
