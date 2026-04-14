import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import {
  TrendingUp,
  TrendingDown,
  ChevronRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useMarketPrices } from '../hooks/useMarketPrices';

const MarketPrices = () => {
  const { data, loading, error, refresh, isRefreshing } = useMarketPrices();

  return (
    <DashboardLayout>
      <header className="bg-white py-4 px-8 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Market Prices</h1>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading || isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Updating...' : 'Refresh'}
        </button>
      </header>

      <div className="p-8 max-w-6xl mx-auto space-y-6">
        {/* Error state */}
        {error && (
          <div className="flex flex-col gap-4 p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <div className="flex items-start gap-3">
              <AlertCircle size={24} className="shrink-0" />
              <div>
                <p className="font-medium">Failed to load market prices</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
              <button
                onClick={refresh}
                className="ml-auto px-4 py-2 bg-red-100 rounded-lg text-sm font-medium hover:bg-red-200 shrink-0"
              >
                Retry
              </button>
            </div>
            {(error.includes('API_KEY') || error.includes('DATA_GOV')) && (
              <div className="mt-2 p-4 bg-white rounded-lg border border-red-100">
                <p className="text-sm font-medium text-red-800">Setup required</p>
                <p className="text-sm text-red-700 mt-1">
                  Add <code className="bg-red-100 px-1 rounded">DATA_GOV_IN_API_KEY</code> and <code className="bg-red-100 px-1 rounded">DATA_GOV_IN_RESOURCE_ID</code> to your <code className="bg-red-100 px-1 rounded">.env</code> file and restart the server.
                  Get an API key at{' '}
                  <a href="https://data.gov.in" target="_blank" rel="noopener noreferrer" className="underline">
                    data.gov.in
                  </a>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Loading state */}
        {loading && !data && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <RefreshCw
              className="animate-spin mx-auto mb-4 text-green-600"
              size={40}
            />
            <p className="text-gray-500">Fetching market prices...</p>
          </div>
        )}

        {/* Commodity Prices Card */}
        {!loading && data && (
          <>
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50">
                <h2 className="text-xl font-bold text-gray-800">
                  Commodity Prices
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {data.message}
                  {data.updatedAt && (
                    <span className="block mt-1">
                      {isRefreshing ? 'Updating...' : `Last updated: ${new Date(data.updatedAt).toLocaleString()}`}
                    </span>
                  )}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-400 text-[11px] font-bold uppercase tracking-widest bg-gray-50/50">
                      <th className="px-8 py-4">Crop</th>
                      <th className="px-8 py-4 text-right">Price (INR/q)</th>
                      <th className="px-8 py-4 text-right">Change</th>
                      <th className="px-8 py-4">Market</th>
                      <th className="px-8 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.commodities.map((item, index) => (
                      <tr
                        key={item.symbol || index}
                        className="hover:bg-[#f6f9ef] transition-colors group cursor-default"
                      >
                        <td className="px-8 py-5 font-medium text-gray-800">
                          {item.crop}
                        </td>
                        <td className="px-8 py-5 text-right font-bold text-gray-900">
                          {item.price}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div
                            className={`inline-flex items-center gap-1 font-bold ${
                              item.trend === 'up'
                                ? 'text-green-600'
                                : 'text-red-500'
                            }`}
                          >
                            {item.change !== '—' && !item.change.startsWith('-') && '+'}
                            {item.change}
                            {item.trend === 'up' ? (
                              <TrendingUp size={16} />
                            ) : (
                              <TrendingDown size={16} />
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-gray-500 text-sm">
                          {item.market || 'Global'}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <ChevronRight
                            size={18}
                            className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity inline"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Market Status Note */}
            <div className="bg-[#e4eed4] p-4 rounded-xl border border-green-100 flex items-center justify-center">
              <p className="text-xs text-green-800 font-medium uppercase tracking-wider">
                Live prices from AGMARKNET (data.gov.in)
              </p>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MarketPrices;
