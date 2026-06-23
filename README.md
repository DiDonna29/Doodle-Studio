# 🎨 Doodle Studio - Creative Workspace

Doodle Studio es una aplicación web inspirada en juegos sociales como "Pinturillo" o "Skribbl.io", diseñada con un enfoque de alto nivel en UI/UX siguiendo la filosofía **Taste Skill**. Es un entorno creativo donde los jugadores pueden dibujar y adivinar palabras en tiempo real con una interfaz fluida y profesional.

## 🚀 Tecnologías Principales

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **UI & Styling**: 
  - [Tailwind CSS](https://tailwindcss.com/) para diseño responsivo.
  - [Shadcn UI](https://ui.shadcn.com/) para componentes accesibles.
  - [Lucide React](https://lucide.dev/) para iconografía premium.
- **Animaciones**: [Framer Motion](https://www.framer.com/motion/) para transiciones y micro-interacciones.
- **Gráficos**: HTML5 Canvas para el motor de dibujo.

## 🧠 Lógica de la Aplicación

La aplicación funciona mediante un motor de estado local altamente optimizado que gestiona:

1.  **Ciclo de Juego**: Un sistema rotativo que asigna el rol de "Dibujante" a cada jugador de forma secuencial.
2.  **Sistema de Rondas**: El juego progresa a través de un número definido de rondas (3-10), asegurando que todos los participantes tengan la misma oportunidad de ganar puntos.
3.  **Chat Reactivo**: Un sistema de feed en tiempo real que detecta automáticamente si los mensajes de los jugadores coinciden con la palabra secreta.
4.  **IA de Simulación**: Incluye bots locales que simulan adivinanzas y participación, haciendo que el juego sea divertido incluso en modo solitario.
5.  **Responsividad Absoluta**: El diseño se ajusta dinámicamente para bloquear el desbordamiento (containment), manteniendo la interfaz usable tanto en móviles como en monitores ultra-wide.

## 🛠️ Instalación y Uso

Doodle Studio es compatible con los gestores de paquetes más populares.

### 1. Clonar el repositorio e instalar dependencias

```bash
# Con npm
npm install

# Con yarn
yarn install

# Con pnpm
pnpm install
```

### 2. Ejecutar en modo desarrollo

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

### 3. Construir para producción

```bash
npm run build
# o
yarn build
# o
pnpm build
```

## 🎯 Propósito y UX

El propósito de Doodle Studio es demostrar que las aplicaciones de juego simples pueden tener una estética "Premium" y "Anti-Slop". Cada elemento, desde el cursor del pincel hasta los contadores de tiempo, ha sido diseñado para ser visualmente gratificante y no sobrecargar la vista del usuario.

## 🔮 Futuro Escalable

Doodle Studio está diseñado para ser la base de un ecosistema más grande:

1.  **Multiplayer con Firebase**: La arquitectura actual permite una migración sencilla a Firestore para habilitar salas multijugador reales con WebSockets o Listeners en tiempo real.
2.  **AI Judging**: Integración con Genkit para que una IA no solo adivine, sino que califique la calidad artística de los dibujos.
3.  **Persistencia de Perfiles**: Sistema de cuentas de usuario para guardar estadísticas, skins de pinceles y avatares personalizados.
4.  **Torneos Globales**: Escalabilidad para soportar tablas de clasificación globales y eventos de dibujo competitivos.

---
*Desarrollado con ❤️ para la comunidad creativa.*