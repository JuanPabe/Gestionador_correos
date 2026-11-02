# Gestor de Correos Electrónicos con Filtros Dinámicos

Proyecto integrador de **Paradigmas de Programación II** (UCP).
Implementado en **TypeScript** bajo **Node.js** con enfoque **TDD** utilizando **Vitest**.

---

## 🛠️ Stack Tecnológico
- **Lenguaje:** TypeScript 5.x (modo estricto)
- **Runtime:** Node.js (v20+)
- **Testing Framework:** [Vitest](https://vitest.dev/) (TDD)
- **CI/CD:** GitHub Actions (`.github/workflows/ci.yml`)

---

## 📁 Estructura del Proyecto

```text
Gestionador_correos/
├── .github/
│   └── workflows/
│       └── ci.yml             # Pipeline de CI (compilación y testing automático)
├── src/
│   ├── domain/
│   │   ├── models/            # Entidades y objetos de valor: Contacto, Correo
│   │   ├── bandejas/          # Bandejas físicas: Entrada, Enviados, Borradores, Eliminados
│   │   └── filtros/           # Predicados funcionales y combinadores (AND, OR, NOT)
│   ├── servicios/             # Orquestador del gestor: GestorCorreos, AgendaContactos
│   └── index.ts               # Punto de entrada y exportaciones
├── tests/
│   └── unit/
│       ├── models/            # Pruebas de modelos (Contacto, Correo)
│       ├── bandejas/          # Pruebas de bandejas físicas y transiciones
│       ├── filtros/           # Pruebas de filtros dinámicos y funciones de orden superior
│       └── servicios/          # Pruebas de casos de uso del gestor
├── package.json
├── tsconfig.json              # Configuración estricta de TypeScript
├── vitest.config.ts           # Configuración de Vitest con cobertura V8
└── README.md
```

---

## 🚀 Comandos Disponibles

- **Ejecutar tests una vez:**
  ```bash
  npm test
  ```
- **Modo observador (TDD en vivo):**
  ```bash
  npm run test:watch
  ```
- **Reporte de cobertura:**
  ```bash
  npm run test:coverage
  ```
- **Compilar a JavaScript:**
  ```bash
  npm run build
  ```
