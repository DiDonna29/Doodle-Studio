# 🎨 Doodle Studio - Creative Workspace (Pro)

Doodle Studio es una aplicación web de dibujo social inspirada en clásicos como "Pinturillo", reimaginada con una estética de alta gama siguiendo la filosofía **Taste Skill (Anti-Slop)**. Este proyecto demuestra cómo una lógica de juego simple puede elevarse a una experiencia de usuario premium mediante diseño asimétrico, micro-animaciones fluidas y una arquitectura de componentes robusta.

## 🚀 Vision & UX Philosophy

La aplicación ha sido construida bajo tres pilares fundamentales:
1.  **Taste Skill Compliance**: Diseño basado en varianza de layout, densidades visuales controladas y una obsesión por los detalles (espaciado, tipografía tabular, sombras dinámicas).
2.  **Responsive Isolation**: Arquitectura diseñada para escritorio primero, con un sistema de adaptación móvil que garantiza que el área creativa (Canvas) sea siempre la protagonista.
3.  **Performance Over Slop**: Eliminación de desbordamientos visuales, optimización de renderizado con React 19 y control de estado fluido.

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS con sistema de temas dinámico (HSL)
- **Componentes**: Shadcn UI (Radix Primitives)
- **Animaciones**: Framer Motion
- **Gráficos**: HTML5 Canvas Engine
- **Gestión de Dependencias**: Totalmente compatible con `npm`, `yarn` y `pnpm`.

## 📦 Instalación

Sigue estos pasos para ejecutar el estudio en tu entorno local:

```bash
# 1. Instalar dependencias
pnpm install
# o
yarn install
# o
npm install

# 2. Iniciar servidor de desarrollo
pnpm dev
# o
yarn dev
# o
npm run dev
```

## 🧠 Lógica de la Aplicación

### Motor de Juego (Game Engine)
El juego utiliza un sistema de estado reactivo que gestiona:
- **Rotación de Turnos**: Un ciclo que asigna el rol de "Artista" a cada participante.
- **Temporizador Sincronizado**: Un contador de 60 segundos que bloquea o libera herramientas de dibujo según el rol.
- **Reconocimiento de Patrones**: Un sistema de chat que valida entradas en tiempo real contra la palabra secreta del turno actual.
- **Simulación de IA/Bots**: Algoritmos que simulan la participación de otros jugadores para permitir el juego en solitario.

### Contención Visual
Todos los contenedores utilizan `min-w-0` y `truncate` para asegurar que nombres y puntuaciones no rompan el layout. Los números dinámicos usan la clase `tabular-nums` para evitar el movimiento lateral de los elementos durante el conteo.

## 🔮 Futuro Escalable

Doodle Studio está preparado para evolucionar hacia:
1.  **Multiplayer Real-Time**: Integración con Firebase Firestore (Listeners) o WebSockets para salas de juego globales.
2.  **AI Judging Integration**: Uso de Genkit para calificar la calidad artística o generar sugerencias de dibujo.
3.  **Persistencia de Usuario**: Sistema de cuentas para guardar skins de pinceles, avatares personalizados y estadísticas históricas.
4.  **Exportación de Arte**: Capacidad de convertir los dibujos de las rondas en NFTs o imágenes descargables en alta resolución.

---
*Desarrollado con precisión técnica y pasión creativa.*