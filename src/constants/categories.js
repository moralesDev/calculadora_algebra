export const CATEGORIES = [
  {
    label: "Ecuaciones",
    icon: "=",
    subtopics: [
      {
        label: "Lineales",
        examples: [
          "5x - 6 = 3x - 8",
          "x/3 + x/2 = 10",
          "7y + 5 - 3y + 1 = 2y + 2",
        ],
      },
      {
        label: "Cuadráticas",
        examples: [
          "x^2 - 5x + 6 = 0",
          "2x^2 + 3x - 2 = 0",
          "x^2 - 4 = 0",
        ],
      },
      {
        label: "Racionales",
        examples: [
          "x^2 - x - 6 = 0",
          "x^2 + x - 12 = 0",
          "x^2 - 2x - 15 = 0",
        ],
      },
      {
        label: "Bicuadráticas",
        examples: [
          "x^4 - 5x^2 + 4 = 0",
          "x^4 - 13x^2 + 36 = 0",
          "x^4 - 10x^2 + 9 = 0",
        ],
      },
      {
        label: "Polinomiales",
        examples: [
          "x^3 - 6x^2 + 11x - 6 = 0",
          "x^3 - 3x^2 - x + 3 = 0",
          "2x^3 - 3x^2 - 2x + 3 = 0",
        ],
      },
      {
        label: "Con radicales",
        examples: [
          "sqrt(x + 3) = 4",
          "sqrt(2x - 1) = 3",
          "sqrt(x) = 5",
        ],
      },
      {
        label: "Logarítmicas",
        examples: [
          "log(x) = 2",
          "log(x + 1) = 1",
          "ln(x) = 3",
        ],
      },
      {
        label: "Exponenciales",
        examples: [
          "2^x = 8",
          "3^x = 81",
          "5^x = 25",
        ],
      },
      {
        label: "Valor absoluto",
        examples: [
          "abs(x - 3) = 5",
          "abs(2x + 1) = 7",
          "abs(x) = 4",
        ],
      },
      {
        label: "Números complejos",
        examples: [
          "x^2 + 4 = 0",
          "x^2 + 2x + 5 = 0",
          "x^2 - 2x + 10 = 0",
        ],
      },
      {
        label: "Forma matricial",
        examples: [
          "2x + y = 5, x - y = 1",
          "x + 2y = 7, 3x - y = 1",
          "2x - 3y = 4, x + y = 3",
        ],
      },
      {
        label: "Raíces",
        examples: [
          "x^2 - 9 = 0",
          "x^3 - 8 = 0",
          "x^4 - 16 = 0",
        ],
      },
      {
        label: "Raíces racionales",
        examples: [
          "x^3 - 6x^2 + 11x - 6 = 0",
          "2x^3 - 3x^2 - 2x + 3 = 0",
          "x^3 + 2x^2 - x - 2 = 0",
        ],
      },
    ],
  },
  {
    label: "Funciones",
    icon: "f(x)",
    subtopics: [
      {
        label: "Dominio y rango",
        examples: [
          "f(x) = 3/(x - 2)",
          "f(x) = sqrt(x - 1)",
          "f(x) = 1/(x^2 - 4)",
        ],
      },
      {
        label: "Lineales",
        examples: [
          "f(x) = 3x + 2",
          "f(x) = -2x + 5",
          "f(x) = x/2 - 1",
        ],
      },
      {
        label: "Cuadráticas",
        examples: [
          "f(x) = x^2 + 3x - 4",
          "f(x) = -x^2 + 2x + 3",
          "f(x) = 2x^2 - 5x + 2",
        ],
      },
      {
        label: "Racionales",
        examples: [
          "f(x) = (x + 1)/(x - 3)",
          "f(x) = x^2/(x^2 - 1)",
          "f(x) = 2/(x^2 + x)",
        ],
      },
      {
        label: "Radicales",
        examples: [
          "f(x) = sqrt(x - 2)",
          "f(x) = sqrt(4 - x^2)",
          "f(x) = sqrt(x^2 - 9)",
        ],
      },
      {
        label: "Exponenciales",
        examples: [
          "f(x) = 2^x",
          "f(x) = 3^x",
          "f(x) = 10^x",
        ],
      },
      {
        label: "Logarítmicas",
        examples: [
          "f(x) = log(x)",
          "f(x) = ln(x)",
          "f(x) = log(x + 1)",
        ],
      },
      {
        label: "Composición",
        examples: [
          "f(x) = (x + 1)^2 + 3",
          "f(x) = sqrt(x^2 + 1)",
          "f(x) = (2x - 1)^3",
        ],
      },
      {
        label: "Inversas",
        examples: [
          "f(x) = 2x + 3",
          "f(x) = x^2 + 1",
          "f(x) = 3x - 7",
        ],
      },
    ],
  },
  {
    label: "Derivadas",
    icon: "d/dx",
    subtopics: [
      {
        label: "Polinomios",
        examples: [
          "d/dx x^3 + 2x^2 - 5x + 1",
          "d/dx x^4 - 3x^2 + 2",
          "d/dx 2x^5 - x^3 + 4x",
        ],
      },
      {
        label: "Regla de la cadena",
        examples: [
          "d/dx (x^2 + 1)^3",
          "d/dx (2x - 3)^4",
          "d/dx (x^3 + x)^2",
        ],
      },
      {
        label: "Producto y cociente",
        examples: [
          "d/dx x^2 * (x + 1)",
          "d/dx x^3 * (x^2 - 1)",
          "d/dx (x^2 + 1) * (x - 2)",
        ],
      },
      {
        label: "Exponenciales",
        examples: [
          "d/dx exp(x)",
          "d/dx exp(2*x)",
          "d/dx x^2 * exp(x)",
        ],
      },
      {
        label: "Logarítmicas",
        examples: [
          "d/dx log(x)",
          "d/dx log(x^2 + 1)",
          "d/dx x * log(x)",
        ],
      },
      {
        label: "Puntos críticos",
        examples: [
          "d/dx x^3 - 3x^2 + 2",
          "d/dx x^4 - 4x^2",
          "d/dx x^3 - 6x^2 + 9x - 1",
        ],
      },
    ],
  },
  {
    label: "Simplificar",
    icon: "≡",
    subtopics: [
      {
        label: "Factorización",
        examples: [
          "simplifica x^2 - 9",
          "simplifica x^2 + 5x + 6",
          "simplifica x^2 - 2x - 8",
        ],
      },
      {
        label: "Expansión",
        examples: [
          "simplifica (x + 1)(x - 1)",
          "simplifica (x + 2)^3",
          "simplifica (2x - 3)^2",
        ],
      },
      {
        label: "Potencias",
        examples: [
          "simplifica (x^2)^3",
          "simplifica x^3 * x^4",
          "simplifica (2x)^3",
        ],
      },
      {
        label: "Fracciones algebraicas",
        examples: [
          "simplifica (x^2 - 1)/(x + 1)",
          "simplifica (x^2 - 4)/(x - 2)",
          "simplifica (x^2 + 2x + 1)/(x + 1)",
        ],
      },
    ],
  },
];
