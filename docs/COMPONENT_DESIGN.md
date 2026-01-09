# 컴포넌트 설계서

## 문서 정보
- **버전**: 1.0
- **작성일**: 2026-01-09
- **Framework**: React 18 + Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS

---

## 1. 컴포넌트 아키텍처 개요

### 1.1 설계 원칙

1. **Atomic Design**: Atoms → Molecules → Organisms → Templates → Pages
2. **Single Responsibility**: 각 컴포넌트는 하나의 책임만
3. **Composition Over Inheritance**: props를 통한 조합
4. **Type Safety**: 모든 props에 TypeScript 인터페이스
5. **Server Components First**: 가능한 경우 React Server Components 사용

### 1.2 컴포넌트 계층 구조

```
app/
├── layout.tsx (Root Layout)
│   ├── Header
│   ├── page.tsx (Calculator Page)
│   │   ├── CalculatorContainer (Organism)
│   │   │   ├── TickerInput (Molecule)
│   │   │   ├── ManualInputForm (Molecule)
│   │   │   └── CalculateButton (Atom)
│   │   │
│   │   └── ResultsContainer (Organism)
│   │       ├── StockHeader (Molecule)
│   │       ├── MarginGauge (Molecule)
│   │       ├── ScenarioComparison (Organism)
│   │       │   ├── ScenarioCard × 3 (Molecule)
│   │       │   └── ScenarioTable (Molecule)
│   │       ├── SensitivityHeatmap (Molecule)
│   │       ├── CalculationDetails (Molecule)
│   │       └── AIInsightPanel (Organism)
│   │           ├── InsightSummary (Molecule)
│   │           ├── KeyFactorsList (Molecule)
│   │           └── RecommendationCard (Molecule)
│   │
│   ├── Footer
│   └── Disclaimer

Phase 2:
├── portfolio/page.tsx
│   └── PortfolioDashboard (Organism)
│       ├── PortfolioSummary (Molecule)
│       ├── HoldingsTable (Organism)
│       │   └── HoldingRow × N (Molecule)
│       └── PortfolioChart (Molecule)
```

---

## 2. Atoms (기본 UI 컴포넌트)

### 2.1 Button

**위치**: `src/components/ui/Button.tsx`

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  type = 'button',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500':
            variant === 'primary',
          'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500':
            variant === 'secondary',
          'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50':
            variant === 'outline',
          'text-gray-700 hover:bg-gray-100': variant === 'ghost',
        },
        {
          'px-3 py-1.5 text-sm rounded': size === 'sm',
          'px-4 py-2 text-base rounded-md': size === 'md',
          'px-6 py-3 text-lg rounded-lg': size === 'lg',
        },
        { 'w-full': fullWidth }
      )}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
```

**사용 예시**:
```tsx
<Button variant="primary" size="md" loading={isLoading}>
  Calculate
</Button>
```

---

### 2.2 Input

**위치**: `src/components/ui/Input.tsx`

```typescript
interface InputProps {
  type?: 'text' | 'number' | 'email' | 'password';
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  prefix,
  suffix,
  helperText,
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {prefix}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'block w-full rounded-md border shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            error
              ? 'border-red-300 text-red-900 placeholder-red-300'
              : 'border-gray-300',
            prefix && 'pl-10',
            suffix && 'pr-10',
            'py-2 px-3'
          )}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {suffix}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};
```

---

### 2.3 Card

**위치**: `src/components/ui/Card.tsx`

```typescript
interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  footer,
  className,
  padding = 'md',
}) => {
  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 shadow-sm', className)}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      )}
      <div
        className={cn({
          'p-0': padding === 'none',
          'p-4': padding === 'sm',
          'p-6': padding === 'md',
          'p-8': padding === 'lg',
        })}
      >
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
};
```

---

### 2.4 Badge

**위치**: `src/components/ui/Badge.tsx`

```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  size = 'md'
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        {
          'bg-green-100 text-green-800': variant === 'success',
          'bg-yellow-100 text-yellow-800': variant === 'warning',
          'bg-red-100 text-red-800': variant === 'danger',
          'bg-blue-100 text-blue-800': variant === 'info',
          'bg-gray-100 text-gray-800': variant === 'neutral',
        },
        {
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-2.5 py-1 text-sm': size === 'md',
          'px-3 py-1.5 text-base': size === 'lg',
        }
      )}
    >
      {children}
    </span>
  );
};
```

---

## 3. Molecules (조합 컴포넌트)

### 3.1 TickerInput

**위치**: `src/components/calculator/TickerInput.tsx`

```typescript
interface TickerInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading?: boolean;
  error?: string;
}

export const TickerInput: React.FC<TickerInputProps> = ({
  value,
  onChange,
  onSubmit,
  loading = false,
  error,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <div className="w-full max-w-md">
      <Input
        type="text"
        value={value}
        onChange={(val) => onChange(val.toUpperCase())}
        onKeyDown={handleKeyDown}
        placeholder="Enter ticker symbol (e.g., NVDA)"
        label="Stock Ticker"
        error={error}
        prefix={<Search className="h-5 w-5 text-gray-400" />}
        suffix={
          value && (
            <button
              onClick={() => onChange('')}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )
        }
      />
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={onSubmit}
        loading={loading}
        disabled={!value || value.length < 1}
        className="mt-3"
      >
        Analyze Stock
      </Button>
    </div>
  );
};
```

---

### 3.2 MarginGauge

**위치**: `src/components/results/MarginGauge.tsx`

```typescript
interface MarginGaugeProps {
  value: number;                    // -50 to +50 (percentage)
  scenario: 'conservative' | 'neutral' | 'optimistic';
  size?: 'sm' | 'md' | 'lg';
}

export const MarginGauge: React.FC<MarginGaugeProps> = ({
  value,
  scenario,
  size = 'md',
}) => {
  const getColor = (val: number) => {
    if (val >= 30) return '#10B981'; // green
    if (val >= 0) return '#F59E0B';  // yellow
    return '#EF4444';                // red
  };

  const getLabel = (val: number) => {
    if (val >= 30) return 'Undervalued';
    if (val >= 0) return 'Fairly Valued';
    return 'Overvalued';
  };

  const gaugeValue = Math.max(-50, Math.min(50, value)); // Clamp to range
  const percentage = ((gaugeValue + 50) / 100) * 100;    // Convert to 0-100%

  return (
    <div className="flex flex-col items-center">
      <div className={cn('relative', {
        'w-32 h-32': size === 'sm',
        'w-48 h-48': size === 'md',
        'w-64 h-64': size === 'lg',
      })}>
        {/* Semi-circle gauge using Recharts */}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={[
                { value: percentage, fill: getColor(value) },
                { value: 100 - percentage, fill: '#E5E7EB' },
              ]}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={0}
              dataKey="value"
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Value display in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
          <div className="text-4xl font-bold" style={{ color: getColor(value) }}>
            {value >= 0 ? '+' : ''}{value.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 mt-1">{getLabel(value)}</div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500 capitalize">
        {scenario} Scenario
      </div>
    </div>
  );
};
```

---

### 3.3 ScenarioCard

**위치**: `src/components/results/ScenarioCard.tsx`

```typescript
interface ScenarioCardProps {
  scenario: Scenario;               // From API response
  currentPrice: number;
  isSelected?: boolean;
  onClick?: () => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  currentPrice,
  isSelected = false,
  onClick,
}) => {
  const { type, assumptions, intrinsicValue, marginOfSafety, recommendation } = scenario;

  const getScenarioColor = (type: string) => {
    switch (type) {
      case 'conservative': return 'text-slate-700 bg-slate-50 border-slate-200';
      case 'neutral': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'optimistic': return 'text-purple-700 bg-purple-50 border-purple-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getRecommendationBadge = (rec: string) => {
    switch (rec) {
      case 'undervalued': return 'success';
      case 'fairly_valued': return 'warning';
      case 'overvalued': return 'danger';
      default: return 'neutral';
    }
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        getScenarioColor(type),
        isSelected && 'ring-2 ring-blue-500'
      )}
      onClick={onClick}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold capitalize">{type}</h4>
          <Badge variant={getRecommendationBadge(recommendation)} size="sm">
            {recommendation.replace('_', ' ')}
          </Badge>
        </div>

        {/* Metrics */}
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-gray-600">Growth Rate</span>
            <span className="text-lg font-semibold">{assumptions.growthRate}%</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-gray-600">Intrinsic Value</span>
            <span className="text-lg font-semibold">
              ${intrinsicValue.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-gray-600">Current Price</span>
            <span className="text-base text-gray-500">${currentPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Margin of Safety - Large Display */}
        <div className="pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Margin of Safety</div>
            <div
              className={cn('text-3xl font-bold', {
                'text-green-600': marginOfSafety >= 30,
                'text-yellow-600': marginOfSafety >= 0 && marginOfSafety < 30,
                'text-red-600': marginOfSafety < 0,
              })}
            >
              {marginOfSafety >= 0 ? '+' : ''}{marginOfSafety.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Rationale */}
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600 italic">{assumptions.rationale}</p>
        </div>
      </div>
    </Card>
  );
};
```

---

### 3.4 SensitivityHeatmap

**위치**: `src/components/results/SensitivityHeatmap.tsx`

```typescript
interface SensitivityHeatmapProps {
  currentPrice: number;
  eps: number;
}

export const SensitivityHeatmap: React.FC<SensitivityHeatmapProps> = ({
  currentPrice,
  eps,
}) => {
  const growthRates = [3, 5, 7, 10, 15, 20];

  const calculateMargin = (growthRate: number): number => {
    const intrinsicValue = eps * (8.5 + 2 * growthRate);
    return ((intrinsicValue - currentPrice) / currentPrice) * 100;
  };

  const getCellColor = (margin: number): string => {
    if (margin >= 30) return 'bg-green-500';
    if (margin >= 20) return 'bg-green-400';
    if (margin >= 10) return 'bg-green-300';
    if (margin >= 0) return 'bg-yellow-300';
    if (margin >= -10) return 'bg-orange-300';
    if (margin >= -20) return 'bg-orange-400';
    return 'bg-red-500';
  };

  return (
    <Card title="Sensitivity Analysis" subtitle="Margin of Safety by Growth Rate">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Growth Rate
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Intrinsic Value
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Margin of Safety
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {growthRates.map((rate) => {
              const intrinsicValue = eps * (8.5 + 2 * rate);
              const margin = calculateMargin(rate);
              return (
                <tr key={rate} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {rate}%
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    ${intrinsicValue.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <div
                      className={cn(
                        'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-white',
                        getCellColor(margin)
                      )}
                    >
                      {margin >= 0 ? '+' : ''}{margin.toFixed(1)}%
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
```

---

## 4. Organisms (복합 컴포넌트)

### 4.1 CalculatorContainer

**위치**: `src/components/calculator/CalculatorContainer.tsx`

```typescript
'use client';

interface CalculatorContainerProps {
  onAnalyze: (request: AnalyzeRequest) => void;
  loading: boolean;
  error?: string;
}

export const CalculatorContainer: React.FC<CalculatorContainerProps> = ({
  onAnalyze,
  loading,
  error,
}) => {
  const [ticker, setTicker] = useState('');
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [manualData, setManualData] = useState({
    currentPrice: '',
    eps: '',
    historicalGrowth: '',
  });

  const handleSubmit = () => {
    if (mode === 'auto') {
      onAnalyze({ ticker, mode: 'auto' });
    } else {
      onAnalyze({
        ticker,
        mode: 'manual',
        data: {
          currentPrice: parseFloat(manualData.currentPrice),
          eps: parseFloat(manualData.eps),
          historicalGrowth: parseFloat(manualData.historicalGrowth) || 0,
        },
      });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setMode('auto')}
            className={cn(
              'px-6 py-2 rounded-lg font-medium transition-colors',
              mode === 'auto'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            )}
          >
            Auto Mode
          </button>
          <button
            onClick={() => setMode('manual')}
            className={cn(
              'px-6 py-2 rounded-lg font-medium transition-colors',
              mode === 'manual'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            )}
          >
            Manual Input
          </button>
        </div>

        {/* Ticker Input */}
        <TickerInput
          value={ticker}
          onChange={setTicker}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
        />

        {/* Manual Input Form (conditional) */}
        {mode === 'manual' && (
          <ManualInputForm
            data={manualData}
            onChange={setManualData}
          />
        )}
      </div>
    </Card>
  );
};
```

---

### 4.2 ResultsContainer

**위치**: `src/components/results/ResultsContainer.tsx`

```typescript
interface ResultsContainerProps {
  data: AnalyzeResponse;
  onReset: () => void;
}

export const ResultsContainer: React.FC<ResultsContainerProps> = ({
  data,
  onReset,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<number>(1); // Neutral by default
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <StockHeader
          ticker={data.ticker}
          companyName={data.companyName}
          currentPrice={data.currentPrice}
          eps={data.eps}
          lastUpdated={data.lastUpdated}
        />
        <Button variant="outline" onClick={onReset}>
          Calculate Again
        </Button>
      </div>

      {/* Main Gauge - Selected Scenario */}
      <Card padding="lg" className="bg-gradient-to-br from-gray-50 to-white">
        <MarginGauge
          value={data.scenarios[selectedScenario].marginOfSafety}
          scenario={data.scenarios[selectedScenario].type}
          size="lg"
        />
      </Card>

      {/* Scenario Comparison */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Scenario Comparison
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.scenarios.map((scenario, index) => (
            <ScenarioCard
              key={scenario.type}
              scenario={scenario}
              currentPrice={data.currentPrice}
              isSelected={index === selectedScenario}
              onClick={() => setSelectedScenario(index)}
            />
          ))}
        </div>
      </div>

      {/* Sensitivity Analysis */}
      <SensitivityHeatmap
        currentPrice={data.currentPrice}
        eps={data.eps}
      />

      {/* Calculation Details (Collapsible) */}
      <Card>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <span className="text-lg font-medium text-gray-900">
            Calculation Details
          </span>
          {showDetails ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        {showDetails && (
          <div className="px-4 pb-4">
            <CalculationDetails scenarios={data.scenarios} eps={data.eps} />
          </div>
        )}
      </Card>

      {/* AI Insights */}
      <AIInsightPanel insights={data.insights} />
    </div>
  );
};
```

---

### 4.3 AIInsightPanel

**위치**: `src/components/insights/AIInsightPanel.tsx`

```typescript
interface AIInsightPanelProps {
  insights: AIInsights;
  loading?: boolean;
}

export const AIInsightPanel: React.FC<AIInsightPanelProps> = ({
  insights,
  loading = false,
}) => {
  if (loading) {
    return <LoadingInsight />;
  }

  return (
    <Card
      title="AI Investment Analysis"
      subtitle="Powered by Claude 3.5 Sonnet"
      className="border-l-4 border-l-blue-500"
    >
      <div className="space-y-6">
        {/* Summary */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">
            Summary
          </h4>
          <p className="text-gray-900 leading-relaxed">{insights.summary}</p>
        </div>

        {/* Key Factors */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 uppercase mb-2 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Key Factors
          </h4>
          <ul className="space-y-2">
            {insights.keyFactors.map((factor, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{factor}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Risks & Opportunities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Risks */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 uppercase mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
              Risks
            </h4>
            <ul className="space-y-2">
              {insights.risks.map((risk, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span className="text-gray-700 text-sm">{risk}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Opportunities */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 uppercase mb-2 flex items-center">
              <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
              Opportunities
            </h4>
            <ul className="space-y-2">
              {insights.opportunities.map((opp, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span className="text-gray-700 text-sm">{opp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommendation */}
        <RecommendationCard recommendation={insights.recommendation} />
      </div>
    </Card>
  );
};
```

---

## 5. 레이아웃 컴포넌트

### 5.1 Header

**위치**: `src/components/layout/Header.tsx`

```typescript
export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">SafetyNet</span>
          </Link>

          {/* Navigation - Phase 2 */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-gray-900">
              Calculator
            </Link>
            <Link href="/portfolio" className="text-gray-700 hover:text-gray-900">
              Portfolio
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-gray-900">
              About
            </Link>
          </nav>

          {/* Auth Buttons - Phase 2 */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Button variant="primary" size="sm">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
```

---

### 5.2 Disclaimer

**위치**: `src/components/layout/Disclaimer.tsx`

```typescript
export const Disclaimer: React.FC = () => {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
      <div className="flex">
        <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0" />
        <div className="text-sm text-yellow-700">
          <p className="font-medium mb-1">Investment Disclaimer</p>
          <p>
            This tool is for educational purposes only and does not constitute financial advice.
            Benjamin Graham's formula provides a simplified valuation framework and should not be
            the sole basis for investment decisions. Always conduct thorough research and consult
            with a qualified financial advisor before investing.
          </p>
        </div>
      </div>
    </div>
  );
};
```

---

## 6. 상태 관리 (Zustand Store)

### 6.1 Calculator Store

**위치**: `src/store/calculatorStore.ts`

```typescript
import { create } from 'zustand';

interface CalculatorState {
  // Current analysis
  currentAnalysis: AnalyzeResponse | null;
  loading: boolean;
  error: string | null;

  // Actions
  setAnalysis: (data: AnalyzeResponse) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useCalculatorStore = create<CalculatorState>((set) => ({
  currentAnalysis: null,
  loading: false,
  error: null,

  setAnalysis: (data) => set({ currentAnalysis: data, loading: false, error: null }),
  setLoading: (loading) => set({ loading, error: null }),
  setError: (error) => set({ error, loading: false }),
  reset: () => set({ currentAnalysis: null, loading: false, error: null }),
}));
```

**사용 예시**:
```typescript
// In a component
const { currentAnalysis, loading, setAnalysis, setLoading } = useCalculatorStore();

const handleAnalyze = async (request: AnalyzeRequest) => {
  setLoading(true);
  try {
    const result = await api.analyze(request);
    setAnalysis(result);
  } catch (error) {
    setError(error.message);
  }
};
```

---

## 7. 반응형 디자인 전략

### 7.1 Breakpoints (Tailwind)

```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    screens: {
      'sm': '640px',   // Mobile landscape
      'md': '768px',   // Tablet
      'lg': '1024px',  // Desktop
      'xl': '1280px',  // Large desktop
      '2xl': '1536px', // Extra large
    },
  },
};
```

### 7.2 반응형 레이아웃 예시

```tsx
{/* Desktop: 3 columns, Tablet: 2 columns, Mobile: 1 column */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {scenarios.map((scenario) => (
    <ScenarioCard key={scenario.type} scenario={scenario} />
  ))}
</div>

{/* Hide on mobile, show on desktop */}
<div className="hidden lg:block">
  <SensitivityHeatmap />
</div>

{/* Stack vertically on mobile */}
<div className="flex flex-col lg:flex-row gap-6">
  <div className="lg:w-2/3">Main content</div>
  <div className="lg:w-1/3">Sidebar</div>
</div>
```

---

## 8. 접근성 (a11y) 가이드라인

### 8.1 체크리스트

- [ ] **Semantic HTML**: `<button>`, `<nav>`, `<main>` 등 올바른 태그 사용
- [ ] **Keyboard Navigation**: Tab, Enter, Space로 모든 기능 접근 가능
- [ ] **ARIA Labels**: 스크린 리더를 위한 aria-label 추가
- [ ] **Color Contrast**: WCAG AA 기준 (최소 4.5:1)
- [ ] **Focus Indicators**: focus:ring 등으로 포커스 시각화
- [ ] **Alt Text**: 모든 이미지에 대체 텍스트

### 8.2 예시

```tsx
{/* Good: Semantic + ARIA */}
<button
  aria-label="Calculate margin of safety for NVDA"
  className="focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  Calculate
</button>

{/* Good: Color + Icon */}
<div className="text-red-600" aria-label="Overvalued">
  <AlertTriangle className="inline mr-2" aria-hidden="true" />
  Overvalued
</div>
```

---

## 9. 성능 최적화

### 9.1 React Optimization

```typescript
// Memoize expensive calculations
const intrinsicValue = useMemo(() => {
  return calculateIntrinsicValue(eps, growthRate);
}, [eps, growthRate]);

// Memoize callbacks
const handleClick = useCallback(() => {
  onAnalyze({ ticker, mode });
}, [ticker, mode, onAnalyze]);

// Lazy load components
const PortfolioDashboard = lazy(() => import('./PortfolioDashboard'));
```

### 9.2 Code Splitting

```typescript
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react'],
  },
};
```

---

## 10. Component Checklist

### Phase 1 필수 컴포넌트

- [x] Button
- [x] Input
- [x] Card
- [x] Badge
- [x] TickerInput
- [x] MarginGauge
- [x] ScenarioCard
- [x] SensitivityHeatmap
- [x] CalculatorContainer
- [x] ResultsContainer
- [x] AIInsightPanel
- [x] Header
- [x] Footer
- [x] Disclaimer

### Phase 2 추가 컴포넌트

- [ ] PortfolioDashboard
- [ ] HoldingsTable
- [ ] WatchlistPanel
- [ ] HistoryChart
- [ ] AuthForms (Login/Signup)

---

**문서 상태**: ✅ Ready for Development
**다음 단계**: AI_INTEGRATION.md 참조
