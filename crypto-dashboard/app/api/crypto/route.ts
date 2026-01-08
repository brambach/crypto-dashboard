import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const coins = ['bitcoin', 'ethereum', 'solana', 'cardano', 'polkadot'];
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(',')}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 10 }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch crypto prices');
    }

    const data = await response.json();

    const formattedData = [
      {
        id: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        price: data.bitcoin?.usd || 0,
        change24h: data.bitcoin?.usd_24h_change || 0,
        volume24h: data.bitcoin?.usd_24h_vol || 0,
      },
      {
        id: 'ethereum',
        symbol: 'ETH',
        name: 'Ethereum',
        price: data.ethereum?.usd || 0,
        change24h: data.ethereum?.usd_24h_change || 0,
        volume24h: data.ethereum?.usd_24h_vol || 0,
      },
      {
        id: 'solana',
        symbol: 'SOL',
        name: 'Solana',
        price: data.solana?.usd || 0,
        change24h: data.solana?.usd_24h_change || 0,
        volume24h: data.solana?.usd_24h_vol || 0,
      },
      {
        id: 'cardano',
        symbol: 'ADA',
        name: 'Cardano',
        price: data.cardano?.usd || 0,
        change24h: data.cardano?.usd_24h_change || 0,
        volume24h: data.cardano?.usd_24h_vol || 0,
      },
      {
        id: 'polkadot',
        symbol: 'DOT',
        name: 'Polkadot',
        price: data.polkadot?.usd || 0,
        change24h: data.polkadot?.usd_24h_change || 0,
        volume24h: data.polkadot?.usd_24h_vol || 0,
      },
    ];

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crypto prices' },
      { status: 500 }
    );
  }
}
