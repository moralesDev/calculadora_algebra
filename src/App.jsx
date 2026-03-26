import { useState, useRef } from "react";
import { useCalculator } from "./hooks/useCalculator.js";
import Sidebar from "./components/layout/Sidebar.jsx";
import Header from "./components/layout/Header.jsx";
import InputBar from "./components/calculator/InputBar.jsx";
import WelcomeScreen from "./components/calculator/WelcomeScreen.jsx";
import MessageThread from "./components/calculator/MessageThread.jsx";
import Navigator from "./components/calculator/Navigator.jsx";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState(0);
  const scrollContainerRef = useRef(null);

  const {
    input, setInput,
    history, error,
    inputRef, bottomRef,
    insertSymbol, solve, clearHistory,
  } = useCalculator();

  // Extrae todas las secciones de todos los items del historial con sus IDs
  const allSections = history.flatMap((item, itemIndex) =>
    item.steps
      .map((step, stepIndex) => ({ ...step, stepIndex }))
      .filter((s) => s.type === "section")
      .map((s) => ({
        text: s.text,
        id: `sec-${itemIndex}-${s.stepIndex}`,
        query: item.query,
        itemIndex,
      }))
  );

  return (
    <div style={{
      display: "flex", height: "100vh",
      background: "var(--color-background-tertiary)",
      fontFamily: "var(--font-sans)", overflow: "hidden",
    }}>
      {sidebarOpen && (
        <Sidebar
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          onSelectExample={(item) => { setInput(item); inputRef.current?.focus(); }}
          onRunExample={solve}
        />
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          onClearHistory={clearHistory}
          hasHistory={history.length > 0}
        />

        <div
          ref={scrollContainerRef}
          style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}
        >
          {history.length === 0
            ? <WelcomeScreen />
            : <MessageThread history={history} error={error} bottomRef={bottomRef} />
          }
        </div>

        <InputBar
          input={input}
          setInput={setInput}
          inputRef={inputRef}
          onSolve={solve}
          onInsertSymbol={insertSymbol}
        />
      </div>

      <Navigator sections={allSections} scrollContainerRef={scrollContainerRef} />

      <style>{`
        ::-webkit-scrollbar { width: 4px }
        ::-webkit-scrollbar-track { background: transparent }
        ::-webkit-scrollbar-thumb { background: var(--color-border-secondary); border-radius: 4px }
        button:hover { opacity: 0.85 }
      `}</style>
    </div>
  );
}
