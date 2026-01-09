import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Safety Margin Status Colors
        'safe-green': '#10B981',
        'caution-yellow': '#F59E0B',
        'danger-red': '#EF4444',

        // Scenario Colors
        'conservative': '#64748B',
        'neutral': '#3B82F6',
        'optimistic': '#8B5CF6',
      },
    },
  },
  plugins: [],
}

export default config
