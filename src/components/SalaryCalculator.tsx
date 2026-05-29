import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  Layers,
  ArrowRight,
  TrendingDown,
  Info,
  ChevronRight,
  CheckCircle,
  HelpCircle,
  Award,
  BookOpen
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from 'recharts';

// Currency config
interface Currency {
  symbol: string;
  name: string;
  code: string;
}

const CURRENCIES: Currency[] = [
  { symbol: '$', name: 'US Dollar', code: 'USD' },
  { symbol: '₹', name: 'Indian Rupee', code: 'INR' },
  { symbol: '€', name: 'Euro', code: 'EUR' },
  { symbol: '£', name: 'British Pound', code: 'GBP' },
  { symbol: 'S$', name: 'Singapore Dollar', code: 'SGD' },
  { symbol: '¥', name: 'Japanese Yen', code: 'JPY' }
];

// Presets
interface PresetScenario {
  id: string;
  name: string;
  description: string;
  baseIncrement: number;
  bonusPercent: number;
  promoJump: number;
  promoFrequency: number; // in years
  badgeColor: string;
}

const PRESETS: PresetScenario[] = [
  {
    id: 'standard',
    name: 'Steady Career Growth',
    description: 'A standard career progression with standard annual increments and modest bonuses.',
    baseIncrement: 7,
    bonusPercent: 8,
    promoJump: 0,
    promoFrequency: 3,
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
  },
  {
    id: 'high-performer',
    name: 'High Flyer',
    description: 'Outperforming targets consistently, securing double-digit appraisals and premium bonuses.',
    baseIncrement: 14,
    bonusPercent: 15,
    promoJump: 0,
    promoFrequency: 2,
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
  },
  {
    id: 'fast-track',
    name: 'Fast-Track Promotions',
    description: 'Active promotion loops every 3 years with an additional 22% salary step-up.',
    baseIncrement: 8,
    bonusPercent: 12,
    promoJump: 22,
    promoFrequency: 3,
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
  },
  {
    id: 'conservative',
    name: 'Value Preservation',
    description: 'Conservative workspace keeping pace primarily with basic cost-of-living adjustments.',
    baseIncrement: 4,
    bonusPercent: 5,
    promoJump: 0,
    promoFrequency: 5,
    badgeColor: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-300'
  }
];

export function SalaryCalculator() {
  // Calculator inputs
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);
  const [startingSalary, setStartingSalary] = useState<number>(85000);
  const [incrementRate, setIncrementRate] = useState<number>(8);
  const [bonusRate, setBonusRate] = useState<number>(10);
  const [taxRate, setTaxRate] = useState<number>(22);
  const [inflationRate, setInflationRate] = useState<number>(3.5);
  const [projectionYears, setProjectionYears] = useState<number>(10);
  const [includePromo, setIncludePromo] = useState<boolean>(true);
  const [promoPercent, setPromoPercent] = useState<number>(15);
  const [promoInterval, setPromoInterval] = useState<number>(3);
  const [activeTab, setActiveTab] = useState<'line' | 'bar' | 'table'>('line');

  // Triggering scenario preset
  const applyPreset = (preset: PresetScenario) => {
    setIncrementRate(preset.baseIncrement);
    setBonusRate(preset.bonusPercent);
    if (preset.promoJump > 0) {
      setIncludePromo(true);
      setPromoPercent(preset.promoJump);
      setPromoInterval(preset.promoFrequency);
    } else {
      setIncludePromo(false);
    }
  };

  // Calculations engine
  const calculationData = useMemo(() => {
    const data = [];
    let currentBase = startingSalary;
    let cumulativeNet = 0;

    for (let year = 1; year <= projectionYears; year++) {
      let isPromotionYear = false;
      let appliedIncrement = incrementRate;

      if (includePromo && year % promoInterval === 0) {
        isPromotionYear = true;
        appliedIncrement = incrementRate + promoPercent;
      }

      const incrementAmount = (currentBase * appliedIncrement) / 100;
      const baseEarned = currentBase + incrementAmount;
      const bonusEarned = (baseEarned * bonusRate) / 100;
      const grossIncome = baseEarned + bonusEarned;
      const taxPaid = (grossIncome * taxRate) / 100;
      const netIncome = grossIncome - taxPaid;

      // Adjust for cumulative inflation
      const inflationFactor = Math.pow(1 + inflationRate / 100, year);
      const realValue = netIncome / inflationFactor;

      cumulativeNet += netIncome;

      data.push({
        yearLabel: `Year ${year}`,
        yearNum: year,
        baseSalary: Math.round(baseEarned),
        bonus: Math.round(bonusEarned),
        gross: Math.round(grossIncome),
        tax: Math.round(taxPaid),
        net: Math.round(netIncome),
        realPurchasingPower: Math.round(realValue),
        cumulativeEarnings: Math.round(cumulativeNet),
        isPromo: isPromotionYear,
        incrementAmount: Math.round(incrementAmount),
        appliedIncrementRate: appliedIncrement
      });

      // Update currentBase for next loop iteration
      currentBase = baseEarned;
    }

    return data;
  }, [startingSalary, incrementRate, bonusRate, taxRate, inflationRate, projectionYears, includePromo, promoPercent, promoInterval]);

  // Insights derived from calculation data
  const finalYearData = calculationData[calculationData.length - 1] || { baseSalary: 0, net: 0, cumulativeEarnings: 0 };
  const baseGrowthRatio = finalYearData.baseSalary / startingSalary;
  const growthPercentage = Math.round((baseGrowthRatio - 1) * 100);

  // Estimating years to double salary using Rule of 72 or simulation
  const yearsToDouble = useMemo(() => {
    let base = startingSalary;
    let years = 0;
    while (base < startingSalary * 2 && years < 50) {
      years++;
      let appliedIncrement = incrementRate;
      if (includePromo && years % promoInterval === 0) {
        appliedIncrement = incrementRate + promoPercent;
      }
      base = base * (1 + appliedIncrement / 100);
    }
    return years >= 50 ? '25+' : `${years} yrs`;
  }, [startingSalary, incrementRate, includePromo, promoInterval, promoPercent]);

  // Average monthly payout in final year after tax
  const finalEstMonthly = Math.round(finalYearData.net / 12);

  return (
    <div className="space-y-8">
      {/* Introduction Card */}
      <Card className="overflow-hidden border border-emerald-500/10 dark:border-emerald-500/5 bg-gradient-to-br from-emerald-50/50 via-background to-background dark:from-emerald-950/10 dark:via-background dark:to-background">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-mono text-xs">
                  Enterprise Modeler
                </Badge>
              </div>
              <h2 className="text-2xl sm:text-3xl font-sans font-bold text-foreground">
                Salary & Increment Projection Modeler
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                Simulate compounded annual increments, periodical promotion step-ups, bonuses, taxes, and inflation adjustments down to purchasing power metrics. Use presets or construct custom timelines.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {CURRENCIES.map((curr) => (
                <Button
                  key={curr.code}
                  variant={currency.code === curr.code ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrency(curr)}
                  className="font-mono text-xs"
                >
                  {curr.symbol} {curr.code}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid Layout: Controls vs. Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Controls Input (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-sm border-muted">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" />
                Simulation Scenarios
              </CardTitle>
              <CardDescription>Select a workspace profile to instantly apply growth rates</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-1 gap-2.5">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className="flex flex-col text-left p-3 rounded-lg border border-border hover:border-emerald-500/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 transition-all focus:outline-none"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-semibold text-sm text-foreground">{preset.name}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${preset.badgeColor}`}>
                        {preset.baseIncrement}% compound
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-light leading-snug">
                      {preset.description}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-muted">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                Growth Parameters
              </CardTitle>
              <CardDescription>Define current standing and anticipated appraisal metrics</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              
              {/* Parameter 1: Base Salary */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    Starting Base Salary
                  </label>
                  <span className="text-sm font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {currency.symbol}{startingSalary.toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-4">
                  <input
                    type="range"
                    min="10000"
                    max="500000"
                    step="5000"
                    value={startingSalary}
                    onChange={(e) => setStartingSalary(Number(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <input
                    type="number"
                    value={startingSalary}
                    onChange={(e) => setStartingSalary(Math.max(0, Number(e.target.value)))}
                    className="w-24 text-xs font-mono h-8 border rounded-md px-2 text-right bg-background"
                  />
                </div>
              </div>

              {/* Parameter 2: Expected Annual Increment */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Expected Annual Increment (%)
                  </label>
                  <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {incrementRate}%
                  </span>
                </div>
                <div className="flex gap-4">
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="0.5"
                    value={incrementRate}
                    onChange={(e) => setIncrementRate(Number(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <input
                    type="number"
                    max="100"
                    value={incrementRate}
                    onChange={(e) => setIncrementRate(Math.max(0, Number(e.target.value)))}
                    className="w-20 text-xs font-mono h-8 border rounded-md px-2 text-right bg-background"
                  />
                </div>
              </div>

              {/* Parameter 3: Performance Bonuses */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Annual Variable Bonus (Target %)
                  </label>
                  <span className="text-sm font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {bonusRate}%
                  </span>
                </div>
                <div className="flex gap-4">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={bonusRate}
                    onChange={(e) => setBonusRate(Number(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <input
                    type="number"
                    value={bonusRate}
                    onChange={(e) => setBonusRate(Math.max(0, Number(e.target.value)))}
                    className="w-20 text-xs font-mono h-8 border rounded-md px-2 text-right bg-background"
                  />
                </div>
              </div>

              {/* Toggle Periodical Promotion jump */}
              <div className="border border-emerald-500/10 p-4 rounded-lg bg-emerald-500/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-foreground">Promotional Jump Stepups</span>
                    <p className="text-[10px] text-muted-foreground">Apply multi-level leaps on designated anniversaries</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={includePromo}
                    onChange={(e) => setIncludePromo(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-500 cursor-pointer"
                  />
                </div>

                {includePromo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 pt-2 border-t border-emerald-500/10"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground font-semibold">Leap Jump (%)</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={promoPercent}
                            onChange={(e) => setPromoPercent(Number(e.target.value))}
                            className="w-full text-xs font-mono h-8 border rounded-md px-2 bg-background"
                          />
                          <span className="text-xs text-muted-foreground">%</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground font-semibold">Frequency</label>
                        <select
                          value={promoInterval}
                          onChange={(e) => setPromoInterval(Number(e.target.value))}
                          className="w-full text-xs h-8 border rounded-md px-2 bg-background focus:outline-none"
                        >
                          <option value={2}>Every 2 Years</option>
                          <option value={3}>Every 3 Years</option>
                          <option value={4}>Every 4 Years</option>
                          <option value={5}>Every 5 Years</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Auxiliary Params: Tax & Inflation */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-dashed">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground block">
                    Income Tax Rate (%)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={taxRate}
                      onChange={(e) => setTaxRate(Math.min(60, Math.max(0, Number(e.target.value))))}
                      className="w-16 text-xs font-mono h-8 border rounded-md px-2 bg-background"
                    />
                    <span className="text-xs text-muted-foreground">% est</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground block">
                    Inflation Rate (% yr)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="25"
                      step="0.1"
                      value={inflationRate}
                      onChange={(e) => setInflationRate(Math.max(0, Number(e.target.value)))}
                      className="w-16 text-xs font-mono h-8 border rounded-md px-2 bg-background"
                    />
                    <span className="text-xs text-muted-foreground">% / yr</span>
                  </div>
                </div>
              </div>

              {/* Slider for Projection Horizon */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Projection Horizon
                  </label>
                  <span className="text-xs font-mono bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded">
                    {projectionYears} Years
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="20"
                  step="1"
                  value={projectionYears}
                  onChange={(e) => setProjectionYears(Number(e.target.value))}
                  className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

            </CardContent>
          </Card>
        </div>


        {/* RIGHT COLUMN: Results, Metrics & Real-time Graphs (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Real-time KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <Card className="overflow-hidden border border-muted dark:bg-[#151b26]/50">
              <CardContent className="p-4 sm:p-5">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Projected Growth</p>
                    <h3 className="text-xl sm:text-2xl font-bold font-sans text-indigo-600 dark:text-indigo-400">
                      +{growthPercentage}%
                    </h3>
                    <p className="text-[10px] text-muted-foreground">In starting base salary</p>
                  </div>
                  <div className="p-1 px-1.5 text-[9px] font-mono rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                    Year {projectionYears}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border border-muted dark:bg-[#151b26]/50">
              <CardContent className="p-4 sm:p-5">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Cumulative Wealth</p>
                    <h3 className="text-xl sm:text-2xl font-bold font-sans text-emerald-600 dark:text-emerald-400">
                      {currency.symbol}{finalYearData.cumulativeEarnings.toLocaleString()}
                    </h3>
                    <p className="text-[10px] text-muted-foreground">Net lifetime earnings</p>
                  </div>
                  <Badge variant="secondary" className="text-[9px] px-1 font-mono">
                    Net Post-Tax
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border border-muted dark:bg-[#151b26]/50">
              <CardContent className="p-4 sm:p-5">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Est. Monthly Take-home</p>
                    <h3 className="text-xl sm:text-2xl font-bold font-sans text-amber-600 dark:text-amber-400">
                      {currency.symbol}{finalEstMonthly.toLocaleString()}
                    </h3>
                    <p className="text-[10px] text-muted-foreground">In final projection year</p>
                  </div>
                  <div className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Graphical Tabs */}
          <Card className="shadow-sm border-muted">
            <CardHeader className="pb-3 border-b flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Compounded Increment Forecast
                </CardTitle>
                <CardDescription className="text-xs">
                  Year-on-year wealth distribution & core salary trajectories
                </CardDescription>
              </div>
              
              {/* Tab Selector Buttons */}
              <div className="flex bg-muted p-1 rounded-md text-xs font-semibold gap-1 shrink-0">
                <Button
                  size="sm"
                  variant={activeTab === 'line' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('line')}
                  className="h-7 px-3 text-[11px]"
                >
                  Salary Trend
                </Button>
                <Button
                  size="sm"
                  variant={activeTab === 'bar' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('bar')}
                  className="h-7 px-3 text-[11px]"
                >
                  Cumulative Stack
                </Button>
                <Button
                  size="sm"
                  variant={activeTab === 'table' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('table')}
                  className="h-7 px-3 text-[11px]"
                >
                  Schedule Grid
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              
              {/* Tab Content A: Area Chart for base, net and real power */}
              {activeTab === 'line' && (
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={calculationData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                        </linearGradient>
                        <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.01}/>
                        </linearGradient>
                        <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d97706" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#d97706" stopOpacity={0.01}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis dataKey="yearLabel" tick={{ fontSize: 10, fill: '#888' }} />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#888' }}
                        tickFormatter={(value) => `${currency.symbol}${value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}`}
                      />
                      <Tooltip
                        formatter={(value: any) => [`${currency.symbol}${Number(value).toLocaleString()}`]}
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Area
                        name="Gross Base Salary"
                        type="monotone"
                        dataKey="baseSalary"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorBase)"
                        strokeWidth={2}
                      />
                      <Area
                        name="Annual Take-Home (Net)"
                        type="monotone"
                        dataKey="net"
                        stroke="#4f46e5"
                        fillOpacity={1}
                        fill="url(#colorNet)"
                        strokeWidth={2}
                      />
                      <Area
                        name="Purchasing Power (Inflation Adj)"
                        type="monotone"
                        dataKey="realPurchasingPower"
                        stroke="#d97706"
                        fillOpacity={1}
                        fill="url(#colorReal)"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Tab Content B: Stacked Bar Chart */}
              {activeTab === 'bar' && (
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={calculationData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis dataKey="yearLabel" tick={{ fontSize: 10, fill: '#888' }} />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#888' }}
                        tickFormatter={(value) => `${currency.symbol}${value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}`}
                      />
                      <Tooltip
                        formatter={(value: any) => [`${currency.symbol}${Number(value).toLocaleString()}`]}
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar name="Annual Take-Home" dataKey="net" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} opacity={0.8} />
                      <Bar name="Estimated Taxes Paid" dataKey="tax" stackId="a" fill="#ef4444" radius={[3, 3, 0, 0]} opacity={0.7} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Tab Content C: Rich tabular matrix with custom highlights */}
              {activeTab === 'table' && (
                <div className="overflow-x-auto border rounded-lg max-h-[300px]">
                  <table className="w-full text-xs text-left text-foreground bg-background">
                    <thead className="text-[10px] uppercase bg-muted border-b sticky top-0 font-bold select-none text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2">Year</th>
                        <th className="px-3 py-2">Gross Base</th>
                        <th className="px-3 py-2">Appraisal %</th>
                        <th className="px-3 py-2">Bonus</th>
                        <th className="px-3 py-2">Tax Deduct</th>
                        <th className="px-3 py-2">Net Income</th>
                        <th className="px-3 py-2">Cumulative Net</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-muted font-mono leading-normal">
                      <tr className="hover:bg-muted/10 bg-slate-500/5 font-semibold text-muted-foreground select-none text-[11px]">
                        <td className="px-3 py-1.5 font-sans">Initial</td>
                        <td className="px-3 py-1.5">{currency.symbol}{startingSalary.toLocaleString()}</td>
                        <td className="px-3 py-1.5">—</td>
                        <td className="px-3 py-1.5">—</td>
                        <td className="px-3 py-1.5">—</td>
                        <td className="px-3 py-1.5">—</td>
                        <td className="px-3 py-1.5">—</td>
                      </tr>
                      {calculationData.map((row) => (
                        <tr
                          key={row.yearNum}
                          className={`hover:bg-muted/15 transition-colors ${row.isPromo ? 'bg-emerald-500/5 font-semibold' : ''}`}
                        >
                          <td className="px-3 py-2 font-sans flex items-center gap-1.5">
                            {row.yearLabel}
                            {row.isPromo && (
                              <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded px-1 scale-90">
                                PROMO
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2">{currency.symbol}{row.baseSalary.toLocaleString()}</td>
                          <td className="px-3 py-2 text-indigo-600 dark:text-indigo-400 font-bold">
                            +{row.appliedIncrementRate}%
                          </td>
                          <td className="px-3 py-2 text-emerald-600 dark:text-emerald-400">
                            {currency.symbol}{row.bonus.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-red-500">
                            -{currency.symbol}{row.tax.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 font-bold text-foreground">
                            {currency.symbol}{row.net.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-emerald-700 dark:text-emerald-300 font-bold">
                            {currency.symbol}{row.cumulativeEarnings.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-4 p-3 bg-muted/45 rounded-lg flex items-start gap-2.5 text-xs">
                <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Rule of 72 Estimator:</strong> Based on your current compounding model, your starting base compensation of <span className="font-semibold">{currency.symbol}{startingSalary.toLocaleString()}</span> is estimated to double to <span className="text-foreground font-semibold">{currency.symbol}{(startingSalary * 2).toLocaleString()}</span> in approximately <span className="text-emerald-700 dark:text-emerald-400 font-bold">{yearsToDouble}</span>.
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Career Leverage & Negotiations Coach Card */}
          <Card className="border border-indigo-500/15 bg-gradient-to-r from-indigo-50/20 to-background dark:from-indigo-950/10 dark:to-background">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                Negotiation Coach Insights & Leverage Tactics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 sm:p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-2 border-r border-dashed pr-2 md:border-r-slate-200 dark:md:border-r-slate-800">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs font-bold text-foreground">Tax Minimization Tip</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-normal font-light">
                    {taxRate >= 25 ? (
                      `With a tax bracket of ${taxRate}%, explore restructuring your total compensation. Request non-taxable allowances such as gym/wellness allowances, technology reimbursements, tuition offsets, or performance stock modules (RSUs) which may have delayed capital gains tax treatments.`
                    ) : (
                      'Keep tabs on variable bonuses. Ensure you have clear, objective, and auditable metrics (sales conversions, tickets closed, delivery scopes) written into your yearly targets so bonus allocation isn\'t purely discretionary.'
                    )}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-xs font-bold text-foreground">Targeting a Promotion Leap</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-normal font-light">
                    {incrementRate < 6 ? (
                      'Your base annual increment is low. In corporate engineering, secure a fast-track internal promo (target 15-20% leap every 2 years) or plan a strategic lateral transition. Industry data shows switching operations raises base pay by 18-28% compared to sticking internally.'
                    ) : (
                      'Securing an annual growth premium of over 8% is outstanding. Establish a "value-document tracker" immediately. Record every product delivered, dollar saved, and peer mentored in a secure document. Present this exact log 2 months prior to the formal review cycle!'
                    )}
                  </p>
                </div>

              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
