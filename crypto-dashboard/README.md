# Crypto Dashboard with AI Chat

A futuristic crypto dashboard with live price tracking and AI-powered chat analysis using Claude API.

## Features

### 🚀 Split-Screen Layout
- **Left Side**: Live crypto price cards (BTC, ETH, SOL, ADA, DOT)
- **Right Side**: AI chat interface powered by Claude Sonnet

### 💎 Design
- Dark sci-fi aesthetic with animated gradients
- Glassmorphism effects on all cards
- Glowing borders and hover animations
- Custom scrollbar with gradient styling
- Mobile responsive layout

### 🤖 AI Chat Features
- Real-time streaming responses with typing effect
- Context-aware: AI has access to live crypto prices
- Suggested questions to get started
- "AI analyzing..." loading state with animated dots
- Beautiful chat bubbles with timestamps

### 📊 Live Price Tracking
- Auto-refresh every 10 seconds
- 24-hour price change indicators
- Real-time data from CoinGecko API
- Green/red color coding for gains/losses

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Claude API Key

Get your API key from [Anthropic Console](https://console.anthropic.com/)

Edit `.env.local` and add your API key:

```env
ANTHROPIC_API_KEY=your_actual_api_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

### Chat with the AI
1. Ask questions about crypto markets in the chat interface
2. Try suggested questions like:
   - "Should I buy Bitcoin right now?"
   - "Why is ETH down today?"
   - "Compare SOL vs ADA"

The AI has access to live price data and will provide context-aware analysis based on current market conditions.

### Monitor Live Prices
Watch the left side panel for real-time crypto prices that update every 10 seconds automatically.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **AI**: Claude API (Sonnet 4 model)
- **Data**: CoinGecko API
- **Language**: TypeScript

## Project Structure

```
crypto-dashboard/
├── app/
│   ├── api/
│   │   ├── crypto/route.ts    # CoinGecko API integration
│   │   └── chat/route.ts      # Claude AI streaming chat
│   ├── globals.css            # Custom animations & themes
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── CryptoCard.tsx         # Glassmorphism price card
│   ├── CryptoDashboard.tsx    # Main split-screen layout
│   └── ChatInterface.tsx      # AI chat UI with streaming
└── types/
    ├── crypto.ts
    └── chat.ts
```

## Features in Detail

### Glassmorphism Design
- Backdrop blur effects
- Semi-transparent backgrounds
- Layered depth with shadows
- Border gradients on hover

### Animated Gradients
- Background gradient animation
- Gradient text for headings
- Animated borders on cards
- Pulsing accent dots

### AI Chat Streaming
- Real-time response streaming
- Character-by-character typing effect
- Abort controller for canceling requests
- Auto-scroll to latest message

---

Built with Next.js 14 and Claude AI
