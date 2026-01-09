# Crypto Command Center

An immersive 3D cryptocurrency dashboard featuring a rotating Earth globe, orbiting coin indicators, and AI-powered market analysis.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Three.js](https://img.shields.io/badge/Three.js-r182-black?style=flat-square&logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)

## Overview

Crypto Command Center transforms cryptocurrency tracking into a cinematic experience. A 3D Earth globe sits at the center of your screen, with real-time crypto assets orbiting around it as glowing spheres. Scroll to zoom in, click any coin to launch an AI-powered analysis panel with streaming responses.

## Features

### 3D Visualization
- **Interactive Globe** - Textured Earth with wireframe overlay, slowly rotating in space
- **Orbiting Coins** - Each cryptocurrency represented as a glowing orb with custom shader effects
- **Dynamic Glow** - Custom GLSL shaders create pulsing glow effects that intensify on hover
- **Ray-Traced Occlusion** - Labels automatically hide when coins pass behind the globe
- **Starfield Background** - Procedurally generated star field with depth

### Scroll-Driven Experience
- **Cinematic Intro** - Hero text fades as you scroll into the experience
- **Camera Animation** - Smooth camera movement from overview to interactive position
- **Globe Scaling** - Globe grows as you approach for dramatic effect
- **Progressive Disclosure** - UI elements reveal based on scroll position

### AI Market Analysis
- **One-Click Analysis** - Click any coin to get instant AI insights
- **Streaming Responses** - Real-time text streaming powered by Llama 3.3 70B via Groq
- **Context-Aware** - AI receives live price data for accurate, current analysis
- **Conversational** - Continue asking follow-up questions in the chat panel

### Live Market Data
- **Real-Time Prices** - Data refreshes every 10 seconds from CoinGecko API
- **Price Ticker** - Scrolling ticker bar shows all assets at a glance
- **Visual Indicators** - Green/red coloring reflects 24-hour price movement
- **Volume Tracking** - 24-hour trading volume displayed in tooltips

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.1 (App Router) |
| UI Library | React 19 |
| 3D Engine | Three.js + React Three Fiber |
| 3D Helpers | React Three Drei |
| Animation | Framer Motion |
| Styling | Tailwind CSS 4 |
| AI | Groq SDK (Llama 3.3 70B) |
| Language | TypeScript 5 |
| Data | CoinGecko API |

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Groq API key (free tier available)

### Installation

```bash
# Clone the repository
git clone https://github.com/brambach/crypto-dashboard.git
cd crypto-dashboard

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
```

### Environment Setup

Create `.env.local` with your Groq API key:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Get a free API key at [console.groq.com/keys](https://console.groq.com/keys)

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
crypto-dashboard/
├── app/
│   ├── api/
│   │   ├── chat/route.ts         # AI chat endpoint (Groq/Llama)
│   │   └── crypto/route.ts       # Price data endpoint (CoinGecko)
│   ├── globals.css               # Global styles & animations
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Entry point
├── components/
│   ├── CommandCenter.tsx         # Main orchestrator component
│   ├── Globe3D.tsx               # Earth globe with texture
│   ├── CoinOrbit.tsx             # Orbiting coin with glow shader
│   ├── Stars.tsx                 # Starfield background
│   ├── HeroOverlay.tsx           # Intro text overlay
│   ├── InteractionOverlay.tsx    # Scroll prompt UI
│   ├── AIChatPanel.tsx           # Slide-out AI chat panel
│   ├── PriceCards.tsx            # Floating price ticker
│   └── ...
├── types/
│   ├── crypto.ts                 # Crypto data types
│   └── chat.ts                   # Chat message types
└── public/
    └── ...
```

## Architecture

### Rendering Pipeline

```
CommandCenter
├── Canvas (React Three Fiber)
│   ├── Stars (background)
│   ├── Globe3D (Earth mesh + wireframe)
│   ├── CoinOrbit[] (per-coin with shader)
│   ├── ScrollCamera (scroll-driven)
│   └── CoinZoomCamera (selection zoom)
├── HeroOverlay (Framer Motion)
├── InteractionOverlay (Framer Motion)
├── PriceCards (React)
└── AIChatPanel (React + streaming)
```

### Data Flow

```
CoinGecko API → /api/crypto → CommandCenter → CoinOrbit components
                                    ↓
User Click → /api/chat → Groq (Llama 3.3) → Streaming Response → AIChatPanel
```

## Supported Cryptocurrencies

| Coin | Symbol | Orbit Position |
|------|--------|----------------|
| Bitcoin | BTC | Inner orbit |
| Ethereum | ETH | Second orbit |
| Solana | SOL | Middle orbit |
| Cardano | ADA | Fourth orbit |
| Polkadot | DOT | Outer orbit |

## Customization

### Adding New Coins

1. Update coin list in `/api/crypto/route.ts`
2. Adjust orbit configuration in `CommandCenter.tsx`:

```typescript
const orbitRadii = [4.2, 4.8, 5.4, 6.0, 6.6, /* new radius */];
const orbitSpeeds = [0.003, 0.0045, 0.004, 0.005, 0.0035, /* new speed */];
```

### Modifying Globe Appearance

Edit `Globe3D.tsx` to change:
- Globe texture URL
- Wireframe density and opacity
- Rotation speed

### Adjusting Glow Effects

The glow shader in `CoinOrbit.tsx` accepts uniforms:
- `glowColor` - Base glow color
- `intensity` - Glow strength (animated on hover)
- `falloff` - Edge softness

## Performance

- **GPU-Accelerated** - All 3D rendering on GPU via WebGL
- **Optimized Shaders** - Custom GLSL for efficient glow effects
- **Lazy Loading** - Earth texture loaded asynchronously
- **Streaming AI** - Responses stream in real-time, no waiting

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires WebGL 2.0 support.

## License

MIT

## Acknowledgments

- Earth texture from [Three.js examples](https://github.com/mrdoob/three.js)
- Price data from [CoinGecko API](https://www.coingecko.com/en/api)
- AI powered by [Groq](https://groq.com/) running Llama 3.3

---

Built with Next.js, Three.js, and Groq AI
