# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # instalar dependencias
npm run dev        # servidor de desarrollo (Vite, http://localhost:5173)
npm run build      # build de producción
npm run preview    # previsualizar el build
```

No hay test runner configurado.

## Arquitectura

App React + Vite. Todo el código fuente está en `src/`.

```
src/
├── main.jsx                          # Entry point, monta <App />
├── App.jsx                           # Raíz: solo composición de layout y estado de UI (sidebar, categoría activa)
│
├── constants/                        # Datos estáticos puros (sin lógica ni React)
│   ├── categories.js                 # CATEGORIES: grupos del sidebar con ejemplos
│   ├── symbols.js                    # SYMBOLS: teclado matemático virtual
│   └── examples.js                   # EXAMPLES: ejemplos rápidos del sidebar
│
├── math/                             # Lógica pura — sin React, sin efectos
│   ├── utils/
│   │   ├── formatters.js             # fmt(), fmtCoef(), polyToString()
│   │   └── mathHelpers.js            # getRoots(), findRootsByBisection()
│   └── solvers/
│       ├── solveLinear.js            # Ecuaciones lineales ax + b = 0
│       ├── solveQuadratic.js         # Fórmula cuadrática, discriminante
│       ├── solveDerivative.js        # Derivación simbólica + puntos críticos
│       ├── simplifyExpr.js           # Simplificación y expansión
│       ├── analyzeDomain.js          # Dominio, rango, restricciones
│       └── detectAndSolve.js         # Orquestador: detecta tipo y delega al solver correcto
│
├── hooks/
│   └── useCalculator.js             # Estado global del flujo: input, historial, error, solve(), insertSymbol()
│
└── components/
    ├── layout/
    │   ├── Sidebar.jsx               # Panel lateral: navegación por categorías y ejemplos rápidos
    │   └── Header.jsx                # Barra superior: título, badges, botón "Nueva sesión"
    └── calculator/
        ├── StepDisplay.jsx           # Renderiza el array de pasos (section / step / eq / text / result)
        ├── InputBar.jsx              # Textarea + teclado de símbolos + botón Resolver
        ├── WelcomeScreen.jsx         # Pantalla vacía inicial con tarjetas de funcionalidades
        └── MessageThread.jsx         # Historial de consultas/respuestas + mensaje de error
```

## Flujo de datos

```
App.jsx
  └── useCalculator (hook)  →  detectAndSolve  →  solver específico
  └── Sidebar               →  setInput / solve
  └── Header                →  clearHistory / toggleSidebar
  └── InputBar              →  input, solve, insertSymbol
  └── MessageThread         →  history, error
       └── StepDisplay      →  steps[]
```

`App.jsx` no contiene lógica de negocio — solo ensambla los componentes y el hook.

## Patrones clave

**Solvers**: cada solver recibe los datos ya parseados y devuelve `Step[]`. Un `Step` es `{ type: "section" | "step" | "eq" | "text" | "result", text: string }`. `StepDisplay` es el único componente que sabe cómo renderizar cada tipo.

**`detectAndSolve`** es el único punto de entrada al motor matemático. Detecta el tipo de problema por palabras clave (`d/dx`, `f(x)`, `simplifica`, presencia de `=`) y delega al solver correspondiente.

**Búsqueda de raíces**: para polinomios de grado > 2 se usa bisección numérica en `[-15, 15]` (en `mathHelpers.js`), no resolución algebraica exacta.

**Estilos**: CSS variables definidas en `index.html` con soporte automático para dark mode via `prefers-color-scheme`. No hay archivos CSS separados; los estilos están inline en el JSX usando esas variables.

**Dependencia clave**: [mathjs](https://mathjs.org/) (`^15`) para `math.simplify`, `math.expand`, `math.derivative`, `math.evaluate`.
