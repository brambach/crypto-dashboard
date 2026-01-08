interface CryptoCardProps {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

export default function CryptoCard({ symbol, name, price, change24h }: CryptoCardProps) {
  const isPositive = change24h >= 0;
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);

  const formattedChange = change24h.toFixed(2);

  return (
    <div className="relative group">
      {/* Glowing border effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-accent to-secondary rounded-2xl blur-sm opacity-0 group-hover:opacity-60 transition-all duration-500"></div>

      {/* Glassmorphism card */}
      <div className="relative backdrop-blur-xl bg-card-bg/40 border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:scale-[1.02]">
        {/* Top section with symbol and change */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-3xl font-bold text-foreground mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent transition-all duration-300">
              {symbol}
            </h3>
            <p className="text-sm text-foreground/60 font-medium">{name}</p>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-sm border transition-all duration-300 ${
            isPositive
              ? 'bg-green-500/10 text-green-400 border-green-500/20 group-hover:bg-green-500/20 group-hover:shadow-lg group-hover:shadow-green-500/20'
              : 'bg-red-500/10 text-red-400 border-red-500/20 group-hover:bg-red-500/20 group-hover:shadow-lg group-hover:shadow-red-500/20'
          }`}>
            <span className="text-base">{isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(parseFloat(formattedChange))}%</span>
          </div>
        </div>

        {/* Price section */}
        <div className="mt-4">
          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary mb-2 transition-all duration-300 group-hover:scale-105">
            {formattedPrice}
          </p>
          <p className="text-xs text-foreground/40 uppercase tracking-wider font-semibold">
            24h Change
          </p>
        </div>

        {/* Animated bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-b-2xl"></div>

        {/* Corner accent */}
        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
      </div>
    </div>
  );
}
