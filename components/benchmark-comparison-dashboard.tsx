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
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

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
          <div className="space-y-6">
            {metrics.map((metric) => {
              const comparison = compareToBenchmark(
                metric.value!,
                metric.benchmark as string,
                metric.label
              )
              
              return (
                <div key={metric.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{metric.label}</span>
                      {getStatusIcon(comparison.status)}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn("text-sm font-medium", getStatusColor(comparison.status, metric.key))}>
                        {metric.value!.toFixed(1)}%
                      </span>
                      <Badge 
                        variant={comparison.status === "within" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {comparison.status === "within" ? "On Target" : 
                         comparison.status === "above" ? "Above" : "Below"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Progress value={getProgressValue(comparison)} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Benchmark: {metric.benchmark}%</span>
                      {comparison.deviation > 0 && (
                        <span className={cn(
                          comparison.status === "above" ? "text-amber-600" : "text-blue-600"
                        )}>
                          {comparison.deviation.toFixed(1)}% {comparison.status === "above" ? "above" : "below"}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    {comparison.message}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

