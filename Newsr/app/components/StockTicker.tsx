'use client'

import { useRef, useState } from 'react'
import { useStockData } from '@/app/hooks/useStockData'

interface StockTickerProps {
  symbols?: string[]
  height?: number
  refreshInterval?: number
  animationDuration?: number
  className?: string
}

export default function StockTicker({
  // Extended list of stock symbols to show more variety
  symbols = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NFLX', 'NVDA', 
    'AMD', 'PYPL', 'INTC', 'ADBE', 'CSCO', 'CMCSA', 'PEP', 'AVGO',
    'COST', 'TMUS', 'TXN', 'QCOM', 'AMGN', 'SBUX', 'INTU', 'AMD',
    'GILD', 'MDLZ', 'ADP', 'ISRG', 'VRTX', 'REGN', 'ILMN', 'NXPI',
    'KHC', 'FISV', 'BKNG', 'MNST', 'CHTR', 'MAR', 'MELI', 'LRCX',
    'ADI', 'ADSK', 'WBA', 'WDAY', 'SGEN', 'EA', 'DXCM', 'MTCH',
    'ROST', 'IDXX'
  ],
  height = 40,
  refreshInterval = 5 * 60 * 1000, // 5 minutes by default
  animationDuration = 900, // 15 minutes (900 seconds) cycle
  className = ''
}: StockTickerProps) {
  const { stocks, loading } = useStockData({ symbols, refreshInterval });
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => setPaused(true);
  const handleMouseLeave = () => setPaused(false);

  if (loading && stocks.length === 0) {
    return (
      <div 
        className={`flex items-center bg-gray-800 text-white px-4 overflow-hidden ${className}`}
        style={{ height }}
      >
        <div className="animate-pulse w-full h-4 bg-gray-600 rounded"></div>
      </div>
    )
  }

  // We don't need to duplicate the stocks since we have a large list
  // Just create groups of 10 to space them out visually
  const tickerStocks = stocks.length > 0 ? stocks : [];

  return (
    <div
      ref={containerRef}
      className={`bg-gray-800 text-white overflow-hidden select-none ${className}`}
      style={{ height, position: 'relative' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="ticker-content"
        style={{
          animationPlayState: paused ? 'paused' : 'running',
        }}
      >
        {/* Display all stocks with spacing between them */}
        {tickerStocks.map((stock, index) => (
          <div 
            key={`${stock.symbol}-${index}`} 
            className="stock-item"
          >
            <span className="stock-symbol">{stock.symbol}</span>
            <span className="stock-price">{stock.price}</span>
            <span className={stock.positive ? 'stock-change-up' : 'stock-change-down'}>
              {stock.positive ? '▲' : '▼'} {stock.change}
            </span>
            {/* Add a separator every 10 items for visual spacing */}
            {(index + 1) % 10 === 0 && <span className="stock-separator">|</span>}
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .ticker-content {
          position: absolute;
          display: flex;
          white-space: nowrap;
          animation: ticker ${animationDuration}s linear infinite;
          will-change: transform;
          transform: translateZ(0);
        }
        
        @keyframes ticker {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-300%); } /* Make it move farther to extend cycle time */
        }
        
        .stock-item {
          display: flex;
          align-items: center;
          padding: 0 1rem;
          height: ${height}px;
        }
        
        .stock-item:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        .stock-symbol {
          font-weight: bold;
          margin-right: 0.5rem;
        }
        
        .stock-price {
          margin-right: 0.5rem;
        }
        
        .stock-change-up {
          color: #4ade80;
        }
        
        .stock-change-down {
          color: #f87171;
        }
        
        .stock-separator {
          margin: 0 0.5rem;
          color: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  )
} 