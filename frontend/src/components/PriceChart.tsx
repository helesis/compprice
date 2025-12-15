import React from 'react';
import './PriceChart.css';

interface PriceData {
  platform: string;
  price: number;
  trend?: 'up' | 'down' | 'stable';
}

interface PriceChartProps {
  data: PriceData[];
  title?: string;
}

export default function PriceChart({ data, title = 'Price Comparison' }: PriceChartProps) {
  const minPrice = Math.min(...data.map(d => d.price));
  const maxPrice = Math.max(...data.map(d => d.price));

  return (
    <div className="price-chart">
      <h2>{title}</h2>
      <div className="price-list">
        {data.map((item) => (
          <div key={item.platform} className="price-item">
            <div className="price-header">
              <span className="platform-name">{item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}</span>
              <span className={`price ${item.price === minPrice ? 'lowest' : item.price === maxPrice ? 'highest' : ''}`}>
                ${item.price.toFixed(2)}
              </span>
            </div>
            <div className="price-bar">
              <div 
                className="bar-fill" 
                style={{ width: `${((item.price - minPrice) / (maxPrice - minPrice) * 100) || 50}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
