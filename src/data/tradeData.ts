
export interface Instrument {
  symbol: string;
  name: string;
  price: number;
  change: number;
  vol: string;
  type: 'stocks' | 'crypto' | 'cross' | 'lev';
  category: 'tradfi' | 'crypto' | 'payment' | 'metaverse' | 'DeFi' | 'AI' | 'Index' | 'Pre-IPO' | 'USDC' | 'Chinese' | 'Alpha' | 'new' | 'pow' | 'storage';
}

export const INSTRUMENTS: Instrument[] = [
    // ---- Stocks ----
    { symbol: 'URNMUSDT', name: 'Sprott Uranium', price: 55.33, change: 2.14, vol: '595.64K', type: 'stocks', category: 'tradfi' },
    { symbol: 'PYPLUSDT', name: 'PayPal', price: 58.47, change: -2.18, vol: '549.11K', type: 'stocks', category: 'tradfi' },
    { symbol: 'JPMUSDT', name: 'JPMorgan Chase', price: 357.42, change: 0.20, vol: '547.77K', type: 'stocks', category: 'tradfi' },
    { symbol: 'HPEUSDT', name: 'HPE', price: 53.61, change: -0.22, vol: '539.20K', type: 'stocks', category: 'tradfi' },
    { symbol: 'HDUSDT', name: 'Home Depot', price: 353.58, change: -0.01, vol: '521.99K', type: 'stocks', category: 'tradfi' },
    { symbol: 'WMTUSDT', name: 'Walmart', price: 111.77, change: 0.53, vol: '517.87K', type: 'stocks', category: 'tradfi' },
    { symbol: 'GEVUSDT', name: 'GE Vernova', price: 995.27, change: -2.73, vol: '517.15K', type: 'stocks', category: 'tradfi' },
    { symbol: 'KSTRUSDT', name: 'KraneShares', price: 25.23, change: -0.79, vol: '487.82K', type: 'stocks', category: 'tradfi' },
    { symbol: 'CATUSDT', name: 'Caterpillar', price: 844.15, change: -2.88, vol: '468.32K', type: 'stocks', category: 'tradfi' },
    { symbol: 'LRCXUSDT', name: 'Lam Research', price: 311.58, change: -1.53, vol: '428.09K', type: 'stocks', category: 'tradfi' },
    { symbol: 'RIVNUSDT', name: 'Rivian Auto', price: 16.05, change: 2.60, vol: '393.86K', type: 'stocks', category: 'tradfi' },
    { symbol: 'WENUSDT', name: "Wendy's", price: 7.63, change: 5.83, vol: '870.25K', type: 'stocks', category: 'tradfi' },
    { symbol: 'EBAYUSDT', name: 'eBay', price: 111.86, change: 0.68, vol: '824.11K', type: 'stocks', category: 'tradfi' },
    { symbol: 'XLEUSDT', name: 'Energy Select', price: 57.20, change: -1.02, vol: '822.62K', type: 'stocks', category: 'tradfi' },
    { symbol: 'TTWOUSDT', name: 'Take-Two Interactive', price: 245.89, change: 5.23, vol: '812.67K', type: 'stocks', category: 'tradfi' },
    { symbol: 'RDDTUSDT', name: 'Reddit', price: 163.89, change: 6.78, vol: '804.00K', type: 'stocks', category: 'tradfi' },
    { symbol: 'HK1810USDT', name: 'Xiaomi', price: 26.90, change: -0.59, vol: '756.94K', type: 'stocks', category: 'tradfi' },
    { symbol: 'ANTHROPICUSDT', name: 'Anthropic', price: 1445.54, change: -0.08, vol: '746.50K', type: 'stocks', category: 'Pre-IPO' },
    { symbol: 'HIMSUSDT', name: 'Hims & Hers', price: 31.64, change: 4.53, vol: '744.11K', type: 'stocks', category: 'tradfi' },
    { symbol: 'FLEXUSDT', name: 'Flex', price: 121.40, change: -3.56, vol: '739.01K', type: 'stocks', category: 'tradfi' },
    { symbol: 'CSCOUSDT', name: 'Cisco', price: 121.88, change: 0.06, vol: '724.79K', type: 'stocks', category: 'tradfi' },
    { symbol: 'PENGUSDT', name: 'Penguin Solutions', price: 58.97, change: 0.00, vol: '709.62K', type: 'stocks', category: 'tradfi' },

    // ---- Crypto ----
    { symbol: 'EPICUSDT', name: 'Epic', price: 1.0947, change: -0.27, vol: '—', type: 'crypto', category: 'crypto' },
    { symbol: 'CHZUSDT', name: 'Chiliz', price: 0.01323, change: 3.20, vol: '—', type: 'crypto', category: 'crypto' },
    { symbol: 'PROMUSDT', name: 'Prom', price: 1.973, change: -0.70, vol: '—', type: 'crypto', category: 'crypto' },
    { symbol: 'RAREUSDT', name: 'Rare', price: 0.01290, change: 4.45, vol: '—', type: 'crypto', category: 'crypto' },
    { symbol: 'APEUSDT', name: 'ApeCoin', price: 0.1322, change: -0.38, vol: '—', type: 'crypto', category: 'crypto' },
    { symbol: 'TNSRUSDT', name: 'Tensor', price: 0.03141, change: 0.26, vol: '—', type: 'crypto', category: 'crypto' },
    { symbol: 'BLURUSDT', name: 'Blur', price: 0.01367, change: 1.03, vol: '—', type: 'crypto', category: 'crypto' },
    { symbol: 'MEUSDT', name: 'Magic Eden', price: 0.06137, change: 1.37, vol: '—', type: 'crypto', category: 'crypto' },
    { symbol: 'GMTUSDT', name: 'GMT', price: 0.006754, change: -0.49, vol: '—', type: 'crypto', category: 'crypto' },
    { symbol: 'IMMUSDT', name: 'Immutable', price: 0.1113, change: 1.00, vol: '—', type: 'crypto', category: 'crypto' },
    { symbol: 'FILUSDT', name: 'Filecoin', price: 0.7155, change: 2.82, vol: '50.18M', type: 'crypto', category: 'crypto' },
    { symbol: 'RIFUSDT', name: 'Rootstock', price: 0.06942, change: 2.39, vol: '8.44M', type: 'crypto', category: 'crypto' },
    { symbol: 'ARUSDT', name: 'Arweave', price: 1.800, change: -0.28, vol: '1.51M', type: 'crypto', category: 'crypto' },
    { symbol: 'STORJUSDT', name: 'Storj', price: 0.04504, change: 0.58, vol: '1.17M', type: 'crypto', category: 'crypto' },
    { symbol: 'HOTUSDT', name: 'Holo', price: 0.0003339, change: -1.56, vol: '1.02M', type: 'crypto', category: 'crypto' },
    { symbol: 'WALUSDT', name: 'Walrus', price: 0.02511, change: 0.56, vol: '740.22K', type: 'crypto', category: 'crypto' },

    // ---- Payment / PoW ----
    { symbol: 'XRPUSDT', name: 'XRP', price: 1.0414, change: 0.29, vol: '380.16M', type: 'crypto', category: 'payment' },
    { symbol: 'LTCUSDT', name: 'Litecoin', price: 45.61, change: -0.20, vol: '29.71M', type: 'crypto', category: 'payment' },
    { symbol: 'COTIUSDT', name: 'COTI', price: 0.012567, change: -5.74, vol: '27.63M', type: 'crypto', category: 'payment' },
    { symbol: 'BCHUSDT', name: 'Bitcoin Cash', price: 216.67, change: 0.36, vol: '18.71M', type: 'crypto', category: 'payment' },
    { symbol: '1000XECUSDT', name: 'eCash', price: 0.006790, change: 4.72, vol: '6.57M', type: 'crypto', category: 'payment' },
    { symbol: 'ACHUSDT', name: 'Alchemy Pay', price: 0.004230, change: -1.54, vol: '975.37K', type: 'crypto', category: 'payment' },
    { symbol: 'HUMAUSDT', name: 'Huma Finance', price: 0.020274, change: 0.64, vol: '827.45K', type: 'crypto', category: 'payment' },

    // ---- Metaverse ----
    { symbol: 'TLMUSDT', name: 'Alien Worlds', price: 0.001627, change: 2.20, vol: '4.37M', type: 'crypto', category: 'metaverse' },
    { symbol: 'ALICEUSDT', name: 'My Neighbor Alice', price: 0.1206, change: 0.42, vol: '2.87M', type: 'crypto', category: 'metaverse' },
    { symbol: 'AXSUSDT', name: 'Axie Infinity', price: 0.8927, change: -0.70, vol: '2.73M', type: 'crypto', category: 'metaverse' },
    { symbol: 'SANDUSDT', name: 'The Sandbox', price: 0.04135, change: 0.05, vol: '2.57M', type: 'crypto', category: 'metaverse' },
    { symbol: 'EDUUSDT', name: 'Open Campus', price: 0.03615, change: 3.91, vol: '1.34M', type: 'crypto', category: 'metaverse' },
    { symbol: 'MANAUSDT', name: 'Decentraland', price: 0.06630, change: 0.68, vol: '1.11M', type: 'crypto', category: 'metaverse' },
    { symbol: 'MAGICUSDT', name: 'Treasure', price: 0.04149, change: 0.12, vol: '584.53K', type: 'crypto', category: 'metaverse' },
    { symbol: 'ILVUSDT', name: 'Illuvium', price: 3.040, change: 0.73, vol: '479.22K', type: 'crypto', category: 'metaverse' },
    { symbol: 'MOCAUSDT', name: 'Moca', price: 0.007677, change: 0.96, vol: '377.73K', type: 'crypto', category: 'metaverse' },

    // ---- Major / DeFi ----
    { symbol: 'BTCUSDT', name: 'Bitcoin', price: 64985.6, change: -0.26, vol: '4.34B', type: 'crypto', category: 'DeFi' },
    { symbol: 'ETHUSDT', name: 'Ethereum', price: 1918.40, change: -0.48, vol: '3.02B', type: 'crypto', category: 'DeFi' },
    { symbol: 'SPCXUSDT', name: 'Space Exploration', price: 133.23, change: 15.77, vol: '2.33B', type: 'crypto', category: 'Index' },
    { symbol: 'SNDKUSDT', name: 'Sandisk', price: 1219.37, change: -7.33, vol: '2.32B', type: 'crypto', category: 'Index' },
    { symbol: 'BTCUSDC', name: 'Bitcoin (USDC)', price: 64953.1, change: -0.25, vol: '1.25B', type: 'crypto', category: 'USDC' },
    { symbol: 'SOLUSDT', name: 'Solana', price: 75.50, change: 2.25, vol: '1.02B', type: 'crypto', category: 'DeFi' },
    { symbol: 'SOXLUSDT', name: 'Direxion Semi', price: 142.21, change: -1.09, vol: '945.77M', type: 'crypto', category: 'Index' },
    { symbol: 'XAUUSDT', name: 'Gold', price: 4351.63, change: -0.15, vol: '839.73M', type: 'crypto', category: 'Alpha' },
    { symbol: 'ETHUSDC', name: 'Ethereum (USDC)', price: 1917.35, change: -0.43, vol: '808.60M', type: 'crypto', category: 'USDC' },
    { symbol: 'MUUSDT', name: 'Micron', price: 883.77, change: -2.61, vol: '733.18M', type: 'crypto', category: 'Alpha' },

    // ---- Cross pairs ----
    { symbol: 'SOL/BTC', name: 'Solana/BTC', price: 0.0011613, change: 2.49, vol: '30.56', type: 'cross', category: 'DeFi' },
    { symbol: 'XRP/BTC', name: 'XRP/BTC', price: 0.00001602, change: 0.50, vol: '11.88', type: 'cross', category: 'DeFi' },
    { symbol: 'ADA/BTC', name: 'Cardano/BTC', price: 0.00000307, change: -0.32, vol: '7.98', type: 'cross', category: 'DeFi' },
    { symbol: 'PAXG/BTC', name: 'PAX Gold/BTC', price: 0.06680, change: 0.10, vol: '5.52', type: 'cross', category: 'DeFi' },
    { symbol: 'ZEC/BTC', name: 'Zcash/BTC', price: 0.0077109, change: -1.65, vol: '4.85', type: 'cross', category: 'DeFi' },
    { symbol: 'WLD/BTC', name: 'Worldcoin/BTC', price: 0.00000472, change: 0.43, vol: '4.11', type: 'cross', category: 'DeFi' },
    { symbol: 'TRX/BTC', name: 'TRON/BTC', price: 0.00000506, change: 0.60, vol: '4.10', type: 'cross', category: 'DeFi' },
    { symbol: 'LTC/BTC', name: 'Litecoin/BTC', price: 0.0000701, change: -0.14, vol: '3.95', type: 'cross', category: 'DeFi' },
    { symbol: 'NEXO/BTC', name: 'Nexo/BTC', price: 0.00001116, change: 0.00, vol: '2.98', type: 'cross', category: 'DeFi' },
    { symbol: 'UNI/BTC', name: 'Uniswap/BTC', price: 0.0000610, change: -1.77, vol: '1.47', type: 'cross', category: 'DeFi' },

    // ---- More tokens ----
    { symbol: 'BANK', name: 'Bank', price: 0.0394, change: 0.00, vol: '—', type: 'crypto', category: 'DeFi' },
    { symbol: 'KORUB', name: 'Korub', price: 17.27, change: -1.90, vol: '—', type: 'crypto', category: 'Alpha' },
    { symbol: 'SNXXB', name: 'Snxxb', price: 9.16, change: 0.63, vol: '—', type: 'crypto', category: 'Alpha' },
    { symbol: 'PUMP', name: 'Pump', price: 0.002305, change: -0.34, vol: '—', type: 'crypto', category: 'Alpha' },
    { symbol: 'UNI', name: 'Uniswap', price: 3.968, change: -17.33, vol: '—', type: 'crypto', category: 'DeFi' },
    { symbol: 'AVAX', name: 'Avalanche', price: 6.528, change: -0.15, vol: '—', type: 'crypto', category: 'DeFi' },
    { symbol: 'ONDO', name: 'Ondo', price: 0.3524, change: 2.275, vol: '—', type: 'crypto', category: 'Alpha' },
    { symbol: 'HFT', name: 'HFT', price: 0.012054, change: 33.61, vol: '—', type: 'crypto', category: 'Alpha' },
    { symbol: 'GIGGLE', name: 'Giggle', price: 33.61, change: -0.15, vol: '—', type: 'crypto', category: 'Alpha' },

    // ---- bStocks / Leveraged ----
    { symbol: 'PAXG/USDT', name: 'PAX Gold', price: 4342.25, change: -0.08, vol: '8.77M', type: 'crypto', category: 'DeFi' },
    { symbol: 'SKHYB/USDT', name: 'SK Hynix (bStocks)', price: 139.43, change: -3.32, vol: '8.70M', type: 'crypto', category: 'Chinese' },
    { symbol: 'KAITO/USDT', name: 'Kaito', price: 0.6930, change: -21.71, vol: '8.66M', type: 'crypto', category: 'AI' },
    { symbol: 'LINK/USDT', name: 'ChainLink', price: 8.329, change: 0.85, vol: '8.55M', type: 'crypto', category: 'DeFi' },
    { symbol: 'SOXLB/USDT', name: 'Semicon Bull 3X', price: 142.10, change: -1.27, vol: '7.99M', type: 'crypto', category: 'Index' },
    { symbol: 'ENA/USDT', name: 'Ethena', price: 0.0909, change: -5.61, vol: '7.53M', type: 'crypto', category: 'AI' },
    { symbol: 'TAO/USDT', name: 'Bittensor', price: 196.2, change: 1.71, vol: '7.51M', type: 'crypto', category: 'AI' },
    { symbol: 'FDUSD/USDT', name: 'First Digital USD', price: 0.9983, change: 0.01, vol: '7.44M', type: 'crypto', category: 'USDC' },
    { symbol: 'CRCLB/USDT', name: 'Circle Internet (bStocks)', price: 67.16, change: 3.31, vol: '7.22M', type: 'crypto', category: 'USDC' },
    { symbol: 'LTC/USDT', name: 'Litecoin', price: 45.63, change: -0.20, vol: '7.04M', type: 'crypto', category: 'DeFi' },
    { symbol: 'MMT', name: 'Momentum', price: 0.2185, change: 26.96, vol: '1.2B', type: 'crypto', category: 'Alpha' },
    { symbol: 'DODO', name: 'DODO Protocol', price: 0.02273, change: 13.65, vol: '450M', type: 'crypto', category: 'DeFi' },
    { symbol: 'SYN', name: 'Synapse', price: 0.12109, change: 11.05, vol: '310M', type: 'crypto', category: 'DeFi' },
    { symbol: 'RSR', name: 'Reserve Rights', price: 0.001307, change: 7.75, vol: '120M', type: 'crypto', category: 'DeFi' },
    { symbol: 'CETUS', name: 'Cetus Protocol', price: 0.01848, change: 5.30, vol: '89M', type: 'crypto', category: 'DeFi' },
];
