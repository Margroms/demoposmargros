"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  compareToBenchmark, 
  getRestaurantProfile,
  getRestaurantTypeDisplayName 
} from "@/lib/restaurant-benchmark-utils"
import type { RestaurantType } from "@/lib/restaurant-benchmarks"
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface BenchmarkComparisonDashboardProps {
  restaurantType: RestaurantType
  actualMetrics: {
    food_cost_percent?: number
    staff_cost_percent?: number
    marketing_percent?: number
    rent_percent?: number
    delivery_ratio_percent?: number
    profit_margin_percent?: number
  }
}

export function BenchmarkComparisonDashboard({
  restaurantType,
  actualMetrics
}: BenchmarkComparisonDashboardProps) {
  const profile = getRestaurantProfile(restaurantType)
  const restaurantName = getRestaurantTypeDisplayName(restaurantType)

  const metrics = [
    {
      key: "food_cost_percent" as const,
      label: "Food Cost",
      value: actualMetrics.food_cost_percent,
      benchmark: profile.core_benchmarks.food_cost_percent_range
    },
    {
      key: "staff_cost_percent" as const,
      label: "Staff Cost",
      value: actualMetrics.staff_cost_percent,
      benchmark: profile.core_benchmarks.staff_cost_percent_range
    },
    {
      key: "marketing_percent" as const,
      label: "Marketing",
      value: actualMetrics.marketing_percent,
      benchmark: profile.core_benchmarks.marketing_percent_range
    },
    {
      key: "rent_percent" as const,
      label: "Rent",
      value: actualMetrics.rent_percent,
      benchmark: profile.core_benchmarks.rent_percent_of_revenue
    },
    {
      key: "delivery_ratio_percent" as const,
      label: "Delivery Ratio",
      value: actualMetrics.delivery_ratio_percent,
      benchmark: profile.core_benchmarks.delivery_ratio_percent
    },
    {
      key: "profit_margin_percent" as const,
      label: "Profit Margin",
      value: actualMetrics.profit_margin_percent,
      benchmark: profile.core_benchmarks.monthly_profit_margin_percent || 
                 profile.core_benchmarks.profit_margin_percent ||
                 profile.core_benchmarks.profit_margin_range_percent
    }
  ].filter(m => m.value !== undefined && m.benchmark)

  const getStatusIcon = (status: "within" | "below" | "above") => {
    switch (status) {
      case "within":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "above":
        return <TrendingUp className="h-4 w-4 text-amber-500" />
      case "below":
        return <TrendingDown className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusColor = (status: "within" | "below" | "above", metric: string) => {
    // For cost metrics, "above" is bad, "below" is good
    // For profit/delivery, "above" is good, "below" is bad
    const isCostMetric = ["food_cost", "staff_cost", "marketing", "rent"].some(m => metric.includes(m))
    
    if (status === "within") return "text-green-600"
    if (isCostMetric) {
      return status === "above" ? "text-amber-600" : "text-blue-600"
    } else {
      return status === "above" ? "text-green-600" : "text-amber-600"
    }
  }

  const getProgressValue = (comparison: ReturnType<typeof compareToBenchmark>) => {
    if (!comparison.benchmark) return 0
    
    const parsed = comparison.benchmark.split("-")
    if (parsed.length !== 2) return 50
    
    const min = parseFloat(parsed[0])
    const max = parseFloat(parsed[1])
    const range = max - min
    const actual = comparison.actual
    
    if (actual < min) return 0
    if (actual > max) return 100
    
    return ((actual - min) / range) * 100
  }

  const parseBenchmarkRange = (benchmark: string | undefined) => {
    if (!benchmark) return { min: 0, max: 100 }
    const parsed = benchmark.split("-")
    if (parsed.length !== 2) return { min: 0, max: 100 }
    return { min: parseFloat(parsed[0]), max: parseFloat(parsed[1]) }
  }

  const getMetricColor = (status: "within" | "below" | "above", metric: string) => {
    const isCostMetric = ["food_cost", "staff_cost", "marketing", "rent"].some(m => metric.includes(m))
    
    if (status === "within") return "#10b981" // green
    if (isCostMetric) {
      return status === "above" ? "#f59e0b" : "#3b82f6" // amber for high cost, blue for low cost
    } else {
      return status === "above" ? "#10b981" : "#f59e0b" // green for high profit/delivery, amber for low
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Benchmark Comparison
        </CardTitle>
        <CardDescription>
          Your performance compared to {restaurantName} industry benchmarks
        </CardDescription>
      </CardHeader>
      <CardContent>
        {metrics.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No metrics available for comparison</p>
            <p className="text-sm mt-1">Complete more orders to see benchmark comparisons</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {metrics.map((metric) => {
              const comparison = compareToBenchmark(
                metric.value!,
                metric.benchmark as string,
                metric.label
              )
              
              const benchmarkRange = parseBenchmarkRange(metric.benchmark as string)
              const metricColor = getMetricColor(comparison.status, metric.key)
              
              // Create chart data for better visualization
              const maxValue = Math.max(benchmarkRange.max * 1.3, metric.value! * 1.3, 100)
              
              return (
                <Card key={metric.key} className="border-2 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-base font-semibold">{metric.label}</CardTitle>
                        {getStatusIcon(comparison.status)}
                      </div>
                      <Badge 
                        variant={comparison.status === "within" ? "default" : "secondary"}
                        className="text-xs"
                        style={{
                          backgroundColor: comparison.status === "within" ? "#10b981" : 
                                         comparison.status === "above" ? "#f59e0b" : "#3b82f6",
                          color: "white"
                        }}
                      >
                        {comparison.status === "within" ? "On Target" : 
                         comparison.status === "above" ? "Above" : "Below"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Visual Progress Gauge with Benchmark Range */}
                    <div className="relative h-32 bg-gradient-to-r from-muted/20 via-muted/10 to-muted/20 rounded-lg p-4 flex items-center border border-border/50">
                      {/* Min label */}
                      <div className="absolute left-4 top-2 text-xs font-medium text-muted-foreground">
                        {benchmarkRange.min}%
                      </div>
                      
                      {/* Main gauge area */}
                      <div className="flex-1 mx-20 relative h-16">
                        {/* Background scale */}
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full h-2 bg-muted rounded-full relative overflow-visible">
                            {/* Benchmark range highlight */}
                            <div 
                              className="absolute h-2 rounded-full bg-green-200/60 border-2 border-green-400/40"
                              style={{
                                left: `${(benchmarkRange.min / maxValue) * 100}%`,
                                width: `${((benchmarkRange.max - benchmarkRange.min) / maxValue) * 100}%`
                              }}
                            />
                            
                            {/* Your value indicator - large dot */}
                            <div 
                              className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-white shadow-xl transition-all z-10"
                              style={{
                                left: `${Math.min((metric.value! / maxValue) * 100, 100)}%`,
                                backgroundColor: metricColor,
                                transform: 'translate(-50%, -50%)',
                                borderWidth: '3px'
                              }}
                            />
                            
                            {/* Value label above dot */}
                            <div 
                              className="absolute -top-8 text-sm font-bold whitespace-nowrap"
                              style={{
                                left: `${Math.min((metric.value! / maxValue) * 100, 100)}%`,
                                transform: 'translateX(-50%)',
                                color: metricColor
                              }}
                            >
                              {metric.value!.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Max label */}
                      <div className="absolute right-4 top-2 text-xs font-medium text-muted-foreground">
                        {benchmarkRange.max}%
                      </div>
                      
                      {/* Legend */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded bg-green-200/60 border border-green-400/40"></div>
                          <span className="text-muted-foreground">Target Range</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div 
                            className="w-3 h-3 rounded-full border-2 border-white"
                            style={{ backgroundColor: metricColor }}
                          ></div>
                          <span className="text-muted-foreground">Your Value</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bar Chart Visualization */}
                    <div className="h-[160px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={[
                            { 
                              name: "Min Target", 
                              value: benchmarkRange.min,
                              type: "benchmark"
                            },
                            { 
                              name: "Your Value", 
                              value: metric.value!,
                              type: "actual"
                            },
                            { 
                              name: "Max Target", 
                              value: benchmarkRange.max,
                              type: "benchmark"
                            }
                          ]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                          <XAxis 
                            dataKey="name"
                            tick={{ fontSize: 11 }}
                          />
                          <YAxis 
                            domain={[0, maxValue]}
                            tickFormatter={(value) => `${value}%`}
                          />
                          <Tooltip 
                            formatter={(value: number) => [`${value.toFixed(1)}%`, ""]}
                            contentStyle={{ backgroundColor: "rgba(0, 0, 0, 0.9)", color: "white", border: "none", borderRadius: "8px" }}
                          />
                          <Bar 
                            dataKey="value" 
                            radius={[8, 8, 0, 0]}
                          >
                            {[
                              { name: "Min Target", value: benchmarkRange.min, type: "benchmark" },
                              { name: "Your Value", value: metric.value!, type: "actual" },
                              { name: "Max Target", value: benchmarkRange.max, type: "benchmark" }
                            ].map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.type === "actual" ? metricColor : "#e5e7eb"}
                                opacity={entry.type === "benchmark" ? 0.4 : 1}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Key Metrics Display */}
                    <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                      <div className="text-center">
                        <div className="text-2xl font-bold" style={{ color: metricColor }}>
                          {metric.value!.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Your Value</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-muted-foreground">
                          {benchmarkRange.min}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Min Target</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-muted-foreground">
                          {benchmarkRange.max}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Max Target</p>
                      </div>
                    </div>
                    
                    {/* Progress Indicator */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Performance Indicator</span>
                        {comparison.deviation > 0 && (
                          <span className="font-medium" style={{ color: metricColor }}>
                            {comparison.deviation.toFixed(1)}% {comparison.status === "above" ? "above" : "below"} target
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Progress 
                          value={getProgressValue(comparison)} 
                          className="h-3"
                          style={{
                            backgroundColor: "#e5e7eb"
                          }}
                        />
                        <div 
                          className="absolute top-0 left-0 h-3 rounded-full transition-all"
                          style={{
                            width: `${getProgressValue(comparison)}%`,
                            backgroundColor: metricColor,
                            opacity: 0.8
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Status Message */}
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {comparison.message}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

