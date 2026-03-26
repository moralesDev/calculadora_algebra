import { useState, useRef, useEffect } from "react";
import { detectAndSolve } from "../math/solvers/detectAndSolve.js";

// Encapsula todo el estado y la lógica del flujo: input → solve → historial / error
export function useCalculator() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  // Auto-scroll al final del historial cada vez que se agrega una entrada
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  // Inserta un símbolo en la posición del cursor del textarea
  function insertSymbol(value) {
    const el = inputRef.current;
    if (!el) return;
    const s = el.selectionStart;
    const e = el.selectionEnd;
    const next = input.slice(0, s) + value + input.slice(e);
    setInput(next);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(s + value.length, s + value.length);
    }, 0);
  }

  // Resuelve la query y la agrega al historial
  function solve(query = input.trim()) {
    if (!query) return;
    setError("");
    let steps, graphExprs;
    try {
      const result = detectAndSolve(query);
      steps = result.steps;
      graphExprs = result.graphExprs ?? [];
    } catch {
      setError("No se pudo interpretar la expresión. Intenta escribirla de otra forma.");
      return;
    }
    setHistory((h) => [...h, { query, steps, graphExprs }]);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function clearHistory() {
    setHistory([]);
    setError("");
  }

  return { input, setInput, history, error, inputRef, bottomRef, insertSymbol, solve, clearHistory };
}
