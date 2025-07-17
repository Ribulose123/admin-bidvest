import React, { useRef, useEffect, useMemo } from 'react';

interface CandlestickChartProps {
  data: { open: number; close: number; high: number; low: number; direction: 'up' | 'down'; time: string }[];
  priceToY: (price: number) => number;
  priceRange: { min: number; max: number };
  chartMode: 'candlestick' | 'line';
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({ data, priceToY, priceRange, chartMode }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const width = 800;
  const height = 600;
  const margin = useMemo(() => ({ top: 20, right: 60, bottom: 40, left: 20 }), []); // Adjusted margins
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  useEffect(() => {
    if (!data || data.length === 0 || !chartRef.current) return;

    const canvas = chartRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw the background
    ctx.fillStyle = '#01040F';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid lines with improved styling
    ctx.strokeStyle = '#2D2D3A';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines (price levels)
    const priceStep = (priceRange.max - priceRange.min) / 5;
    for (let i = 0; i <= 5; i++) {
      const price = priceRange.min + i * priceStep;
      const y = (chartHeight * (priceRange.max - price)) / (priceRange.max - priceRange.min) + margin.top;
      
      // Draw grid line
      ctx.beginPath();
      ctx.setLineDash([5, 5]); // Dashed grid lines
      ctx.moveTo(margin.left, y);
      ctx.lineTo(width - margin.right, y);
      ctx.stroke();
      ctx.setLineDash([]); // Reset to solid line
      
      // Price labels on the right with larger font
      ctx.fillStyle = '#A4A4A4';
      ctx.font = 'bold 14px Arial'; // Increased font size
      ctx.textAlign = 'right';
      ctx.fillText(
        price.toLocaleString('en-US', { 
          minimumFractionDigits: 2,
          maximumFractionDigits: 2 
        }), 
        width - margin.right + 50, // Positioned to the right
        y + 5
      );
    }
    
    // Vertical grid lines for time markers
    const timeStep = Math.ceil(data.length / 10); // Show about 10 vertical lines
    data.forEach((candle, i) => {
      if (i % timeStep === 0) {
        const x = margin.left + i * (chartWidth / data.length);
        
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(x, margin.top);
        ctx.lineTo(x, height - margin.bottom);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Time labels with larger font
        ctx.fillStyle = '#A4A4A4';
        ctx.font = 'bold 12px Arial'; // Increased font size
        ctx.textAlign = 'center';
        ctx.fillText(
          candle.time, 
          x, 
          height - margin.bottom / 3 // Adjusted position
        );
      }
    });
    
    // Draw candles or line
    const candleWidth = chartWidth / data.length * 0.8;
    const spacing = chartWidth / data.length * 0.2;
    
    if (chartMode === 'candlestick') {
      // Draw candlesticks
      data.forEach((candle, i) => {
        const x = margin.left + i * (candleWidth + spacing);
        const openY = (chartHeight * (priceRange.max - candle.open)) / (priceRange.max - priceRange.min) + margin.top;
        const closeY = (chartHeight * (priceRange.max - candle.close)) / (priceRange.max - priceRange.min) + margin.top;
        const highY = (chartHeight * (priceRange.max - candle.high)) / (priceRange.max - priceRange.min) + margin.top;
        const lowY = (chartHeight * (priceRange.max - candle.low)) / (priceRange.max - priceRange.min) + margin.top;
        
        // Candle body
        ctx.fillStyle = candle.direction === 'up' ? '#26A69A' : '#EF5350';
        ctx.fillRect(x, Math.min(openY, closeY), candleWidth, Math.abs(closeY - openY) || 1);
        
        // Candle wick
        ctx.strokeStyle = candle.direction === 'up' ? '#26A69A' : '#EF5350';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + candleWidth / 2, highY);
        ctx.lineTo(x + candleWidth / 2, lowY);
        ctx.stroke();
      });
    } else if (chartMode === 'line') {
      // Draw line chart
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      data.forEach((point, i) => {
        const x = margin.left + i * (chartWidth / (data.length - 1));
        const y = (chartHeight * (priceRange.max - point.close)) / (priceRange.max - priceRange.min) + margin.top;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
    }
    
  }, [data, priceToY, priceRange, chartMode, width, height, margin, chartHeight, chartWidth]);

  return (
    <div className="relative">
      <canvas 
        ref={chartRef} 
        width={width} 
        height={height} 
        className="w-full ,min-h-full"
      />
    </div>
  );
};

export default CandlestickChart;