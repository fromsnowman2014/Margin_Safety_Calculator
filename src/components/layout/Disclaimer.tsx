import { AlertTriangle } from 'lucide-react';

export function Disclaimer() {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-yellow-800 mb-1">
            Investment Disclaimer
          </p>
          <p className="text-sm text-yellow-700">
            This tool is for <strong>educational purposes only</strong> and does not constitute
            financial advice. Benjamin Graham's formula provides a simplified valuation framework
            and should not be the sole basis for investment decisions. Always conduct thorough
            research and consult with a qualified financial advisor before investing. Past
            performance does not guarantee future results.
          </p>
        </div>
      </div>
    </div>
  );
}
