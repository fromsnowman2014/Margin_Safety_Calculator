import { Disclaimer } from '@/components/layout/Disclaimer';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Disclaimer */}
      <div className="mb-8">
        <Disclaimer />
      </div>

      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Graham's Margin of Safety Calculator
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Calculate the intrinsic value of stocks using Benjamin Graham's proven formula.
          Make data-driven investment decisions with confidence.
        </p>
      </div>

      {/* Calculator will go here */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Stock Analysis
        </h2>
        <div className="text-center py-12 text-gray-500">
          Calculator coming soon...
        </div>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            📊 Accurate Valuation
          </h3>
          <p className="text-gray-600 text-sm">
            Uses Benjamin Graham's time-tested formula to calculate intrinsic value
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            🎯 Multiple Scenarios
          </h3>
          <p className="text-gray-600 text-sm">
            Conservative, neutral, and optimistic projections for comprehensive analysis
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            🤖 AI Insights
          </h3>
          <p className="text-gray-600 text-sm">
            Powered by Claude AI for intelligent investment recommendations
          </p>
        </div>
      </div>
    </div>
  );
}
