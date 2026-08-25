'use client';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MarketPriceCardProps {
  listingPrice: number;
  unit: string;
}

export function MarketPriceCard({ listingPrice, unit }: MarketPriceCardProps) {
  // Mock data as per spec
  const markets = [
    { name: 'Local Mandi', price: 24 },
    { name: 'District Avg', price: 25 },
    { name: 'State Avg', price: 26 },
    { name: 'National Avg', price: 27 },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
      <h3 className="text-xl font-bold mb-4">Market Price Comparison</h3>
      
      <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 font-medium">
            <tr>
              <th className="px-4 py-3">Market</th>
              <th className="px-4 py-3 text-right">Price (/{unit})</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {markets.map((market, idx) => {
              const diff = listingPrice - market.price;
              const isAbove = diff > 0;
              const isBelow = diff < 0;
              const isAvg = diff === 0;

              return (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium">{market.name}</td>
                  <td className="px-4 py-3 text-right font-semibold">₹{market.price}</td>
                  <td className="px-4 py-3 flex justify-center">
                    {isBelow ? (
                      <span className="flex items-center gap-1 text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full text-xs font-medium">
                        <TrendingDown className="w-3 h-3" /> Below Avg
                      </span>
                    ) : isAbove ? (
                      <span className="flex items-center gap-1 text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full text-xs font-medium">
                        <TrendingUp className="w-3 h-3" /> Above Avg
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full text-xs font-medium">
                        <Minus className="w-3 h-3" /> Average
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
