# Crypto Dashboard

An interactive, futuristic cryptocurrency dashboard featuring real-time price tracking, 3D visualizations, and AI-powered market analysis.

## Features

### Real-Time Crypto Tracking
- Live price updates for Bitcoin (BTC), Ethereum (ETH), Solana (SOL), Cardano (ADA), and Polkadot (DOT)
- Auto-refresh every 10 seconds
- 24-hour price change tracking
- Trading volume visualization

### 3D Command Center
- Interactive 3D globe with orbiting cryptocurrency coins
- Clickable coins for detailed AI analysis
- Smooth camera transitions and animations
- Auto-rotating space environment with stars
- Real-time price ticker overlay
- Trading volume bar chart

### AI Crypto Analyst
- Powered by Llama 3.3 (70B) via Groq API
- Context-aware analysis using live market data
- Streaming responses for real-time insights
- Suggested questions for quick market analysis
- Free tier available (no credit card required)

### Modern UI/UX
- Dark, futuristic aesthetic with cyan/neon accents
- Glassmorphism effects and smooth animations
- Responsive design for desktop and mobile
- Built with Tailwind CSS 4 and Framer Motion

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **3D Graphics**: React Three Fiber, Three.js, Drei
- **Animation**: Framer Motion
- **AI Integration**: Groq SDK (Llama 3.3)
- **Data Source**: CoinGecko API

## Prerequisites

- Node.js 20+ installed
- Groq API key (free tier available)

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/brambach/crypto-dashboard.git
   cd crypto-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the `crypto-dashboard` directory:
   ```env
   GROQ_API_KEY=your_api_key_here
   ```

   To get a free Groq API key:
   - Visit [https://console.groq.com/keys](https://console.groq.com/keys)
   - Sign up (no credit card required)
   - Create a new API key
   - Paste it into your `.env.local` file

4. **Run the development server**
   ```bash
   cd crypto-dashboard
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
crypto-dashboard/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts          # AI chat endpoint (Groq/Llama 3.3)
│   │   └── crypto/
│   │       └── route.ts          # CoinGecko API integration
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/
│   ├── AIChatPanel.tsx           # AI chat panel overlay
│   ├── ChatInterface.tsx         # Chat UI component
│   ├── CoinOrbit.tsx             # 3D orbiting coin component
│   ├── CommandCenter.tsx         # Main 3D scene container
│   ├── CryptoCard.tsx            # Crypto price card
│   ├── CryptoDashboard.tsx       # Alternative dashboard layout
│   ├── Globe3D.tsx               # 3D Earth globe
│   ├── PriceTicker.tsx           # Scrolling price ticker
│   └── Stars.tsx                 # 3D starfield background
├── types/
│   ├── chat.ts                   # Chat message types
│   └── crypto.ts                 # Cryptocurrency data types
└── package.json
```

## API Endpoints

### GET /api/crypto
Fetches current cryptocurrency prices from CoinGecko API.

**Response:**
```json
[
  {
    "id": "bitcoin",
    "symbol": "BTC",
    "name": "Bitcoin",
    "price": 45000.00,
    "change24h": 2.5,
    "volume24h": 25000000000
  }
]
```

### POST /api/chat
Sends user message to Groq's Llama 3.3 model for analysis.

**Request:**
```json
{
  "message": "Should I buy Bitcoin?",
  "cryptoData": [ /* array of crypto objects */ ]
}
```

**Response:** Streaming text response

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Groq API key for AI chat | Yes (for chat feature) |

## Features in Detail

### Command Center View
The main interface features a 3D space environment where cryptocurrency coins orbit around a central Earth globe. Each coin displays its symbol and can be clicked for detailed AI analysis.

### AI Analysis
When you click a coin, the camera zooms in and an AI chat panel appears. The AI has access to:
- Current price data
- 24-hour price changes
- Trading volumes
- Historical context (from training data)

You can ask questions like:
- "Should I buy Bitcoin right now?"
- "Why is ETH down today?"
- "Compare SOL vs ADA"
- "What's the best investment opportunity?"

### Real-Time Updates
All price data updates automatically every 10 seconds via the CoinGecko API. The UI reflects changes in real-time with smooth animations.

## Troubleshooting

### AI Chat Not Working
If you see an API key error:
1. Verify your `.env.local` file exists in the `crypto-dashboard` directory
2. Check that `GROQ_API_KEY` is set correctly
3. Restart the dev server after adding environment variables

### Price Data Not Loading
- Check your internet connection
- Verify CoinGecko API is accessible (no VPN blocking)
- Check browser console for errors

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

- **CoinGecko** for cryptocurrency data
- **Groq** for fast AI inference
- **Anthropic** for Claude Code development assistance
- **Vercel** for Next.js framework

---

Built with Claude Code
