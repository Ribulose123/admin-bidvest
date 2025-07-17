"use client";
import React, {
  useCallback,
  useRef,
  useState,
  useEffect,
  useMemo,
} from "react";
import ChartSidebar from "./ChartSidebar";
import TimeframeSelector from "./TimeframeSelector";
import CandlestickChart from "./CandlestickChart";
import QuickTrade from "./QuickTrade";
import TradeHistory from "./TradeHistory";

interface Candle {
  time: string;
  open: number;
  high: number;
  close: number;
  low: number;
  volume: number;
}

interface ChartData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  direction: "up" | "down";
}

const TradingPlatform = () => {
  const [isClient, setIsClient] = useState(false);
  const [candleData, setCandleData] = useState<Candle[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [chartMode] = useState<"candlestick" | "line">("candlestick");

  const currentPriceRef = useRef(currentPrice);
  currentPriceRef.current = currentPrice;

  const generateCandleData = useCallback(() => {
    const now = new Date();
    const data = [];
    let basePrice = 73500;

    for (let i = 0; i < 100; i++) {
      const time = new Date(now.getTime() - (99 - i) * 5 * 60000);
      const open = basePrice;
      const close = basePrice + (Math.random() - 0.5) * 1000;
      const high = Math.max(open, close) + Math.random() * 500;
      const low = Math.min(open, close) - Math.random() * 500;
      const volume = Math.floor(Math.random() * 100) + 10;

      data.push({
        time: time.toISOString(),
        open,
        high,
        low,
        close,
        volume,
      });

      basePrice = close;
    }

    return data;
  }, []);

  useEffect(() => {
    setIsClient(true);

    const candles = generateCandleData();
    setCandleData(candles);

    if (candles.length >= 2) {
      const lastCandle = candles[candles.length - 1];
      const initialPrice = lastCandle.close;

      setCurrentPrice(initialPrice);
      // Removed unused priceChange state update

      const highestPrice = Math.max(...candles.map((c) => c.high));
      const lowestPrice = Math.min(...candles.map((c) => c.low));
      const range = highestPrice - lowestPrice;
      setPriceRange({
        min: lowestPrice - range * 0.2,
        max: highestPrice + range * 0.2,
      });
    }

    // Simulate live price updates
    const interval = setInterval(() => {
      setCurrentPrice((prev) => {
        const newPrice = prev + (Math.random() - 0.5) * 100;
        // Removed unused priceChange state update
        return newPrice;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [generateCandleData]);

  const candlesToChartData = useCallback((candles: Candle[]): ChartData[] => {
    return candles.map((candle) => ({
      time: new Date(candle.time).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume,
      direction: candle.close >= candle.open ? "up" : "down",
    }));
  }, []);

  const chartData = useMemo(
    () => candlesToChartData(candleData),
    [candleData, candlesToChartData]
  );

  const priceToY = useCallback(
    (price: number): number => {
      if (priceRange.max === priceRange.min) return 50;
      return (
        100 -
        ((price - priceRange.min) / (priceRange.max - priceRange.min)) * 100
      );
    },
    [priceRange]
  );

  return (
      <div className="flex gap-4  overflow-hidden pt-4">
    {/* Left side - Chart (70% width) */}
    <div className="w-[65%] border-2 border-[#1E1E2F] rounded-lg bg-[#01040F] flex flex-col ">
      <div className="flex flex-col">
        <div className="ml-5 pt-2">
          <TimeframeSelector />
        </div>
        <div className="flex flex-1 "> {/* Crucial: min-h-0 prevents overflow */}
          <div>
            <ChartSidebar />
          </div>
          <div className="flex-1">
            {isClient && chartData.length > 0 && (
              <CandlestickChart
                data={chartData}
                priceToY={priceToY}
                priceRange={priceRange}
                chartMode={chartMode}
              />
            )}
          </div>
        </div>
      </div>
    </div>
    
    {/* Right side - Trade Interface (30% width) */}
    <div className="w-[35%] flex flex-col gap-4 h-full">
      {/* Quick Trade (60% height) */}
      <div className="h-[60%] border-2 border-[#1E1E2F] rounded-lg bg-[#01040F] overflow-hidden">
        <QuickTrade />
      </div>
      {/* History (40% height with scroll) */}
      <div className="h-[40%] border-2 border-[#1E1E2F] rounded-lg bg-[#01040F] overflow-y-auto">
        <TradeHistory />
      </div>
    </div>
  </div>
  );
};

export default TradingPlatform;