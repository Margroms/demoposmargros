/**
 * Utility functions for restaurant benchmark analysis
 * These functions enable benchmark-aware ML and analytics
 */

import { 
  restaurantBenchmarks, 
  type RestaurantType, 
  type CityTier, 
  type Season, 
  type Region,
  type RestaurantTypeProfile 
} from "./restaurant-benchmarks"

/**
 * Get benchmark profile for a restaurant type
 */
export function getRestaurantProfile(type: RestaurantType): RestaurantTypeProfile {
  return restaurantBenchmarks.benchmarks_india[type]
}

/**
 * Parse range string (e.g., "32-38") into min and max numbers
 */
export function parseRange(range: string): { min: number; max: number } | null {
  if (!range) return null
  
  const parts = range.split("-")
  if (parts.length !== 2) return null
  
  const min = parseFloat(parts[0])
  const max = parseFloat(parts[1])
  
  if (isNaN(min) || isNaN(max)) return null
  
  return { min, max }
}

/**
 * Parse INR range string (e.g., "3L-12L") into min and max numbers
 */
export function parseINRRange(range: string): { min: number; max: number } | null {
  if (!range) return null
  
  const parts = range.split("-")
  if (parts.length !== 2) return null
  
  const parseValue = (val: string): number => {
    const trimmed = val.trim().toUpperCase()
    if (trimmed.endsWith("L")) {
      return parseFloat(trimmed.slice(0, -1)) * 100000
    }
    return parseFloat(trimmed)
  }
  
  const min = parseValue(parts[0])
  const max = parseValue(parts[1])
  
  if (isNaN(min) || isNaN(max)) return null
  
  return { min, max }
}

/**
 * Check if a value is within benchmark range
 */
export function isWithinBenchmark(
  value: number, 
  range: string | undefined
): { within: boolean; min?: number; max?: number } {
  if (!range) return { within: false }
  
  const parsed = parseRange(range)
  if (!parsed) return { within: false }
  
  return {
    within: value >= parsed.min && value <= parsed.max,
    min: parsed.min,
    max: parsed.max
  }
}

/**
 * Get benchmark comparison for a metric
 * Returns how the actual value compares to expected range
 */
export function compareToBenchmark(
  actualValue: number,
  benchmarkRange: string | undefined,
  metricName: string
): {
  metric: string
  actual: number
  benchmark: string | undefined
  status: "within" | "below" | "above"
  deviation: number
  message: string
} {
  if (!benchmarkRange) {
    return {
      metric: metricName,
      actual: actualValue,
      benchmark: undefined,
      status: "within",
      deviation: 0,
      message: `No benchmark available for ${metricName}`
    }
  }
  
  const parsed = parseRange(benchmarkRange)
  if (!parsed) {
    return {
      metric: metricName,
      actual: actualValue,
      benchmark: benchmarkRange,
      status: "within",
      deviation: 0,
      message: `Invalid benchmark format for ${metricName}`
    }
  }
  
  let status: "within" | "below" | "above"
  let deviation: number
  let message: string
  
  if (actualValue < parsed.min) {
    status = "below"
    deviation = ((parsed.min - actualValue) / parsed.min) * 100
    message = `${metricName} is ${deviation.toFixed(1)}% below expected minimum (${parsed.min}%)`
  } else if (actualValue > parsed.max) {
    status = "above"
    deviation = ((actualValue - parsed.max) / parsed.max) * 100
    message = `${metricName} is ${deviation.toFixed(1)}% above expected maximum (${parsed.max}%)`
  } else {
    status = "within"
    deviation = 0
    message = `${metricName} is within expected range (${parsed.min}-${parsed.max}%)`
  }
  
  return {
    metric: metricName,
    actual: actualValue,
    benchmark: benchmarkRange,
    status,
    deviation,
    message
  }
}

/**
 * Get seasonal adjustment factor for a restaurant type
 */
export function getSeasonalAdjustment(
  type: RestaurantType,
  season: Season,
  metric: string
): number | null {
  const profile = getRestaurantProfile(type)
  const seasonalEffects = profile.seasonal_effects?.[season]
  
  if (!seasonalEffects) return null
  
  const effect = seasonalEffects[metric]
  if (!effect) return null
  
  // Parse percentage string like "+35" or "-12"
  const match = effect.match(/^([+-]?)(\d+)$/)
  if (!match) return null
  
  const sign = match[1] === "-" ? -1 : 1
  const value = parseInt(match[2])
  
  return sign * value
}

/**
 * Get city tier adjustment for a metric
 */
export function getCityTierAdjustment(
  type: RestaurantType,
  cityTier: CityTier,
  metric: string
): number | null {
  const profile = getRestaurantProfile(type)
  const adjustments = profile.city_tier_adjustments?.[cityTier]
  
  if (!adjustments) return null
  
  const adjustment = adjustments[metric]
  if (!adjustment) return null
  
  // Parse percentage string like "+30" or "-10"
  const match = adjustment.match(/^([+-]?)(\d+)$/)
  if (!match) return null
  
  const sign = match[1] === "-" ? -1 : 1
  const value = parseFloat(match[2])
  
  return sign * value
}

/**
 * Get all common problems for a restaurant type
 */
export function getCommonProblems(type: RestaurantType): string[] {
  return getRestaurantProfile(type).common_problems || []
}

/**
 * Get staff structure recommendations
 */
export function getStaffStructure(type: RestaurantType): string[] {
  return getRestaurantProfile(type).staff_structure || []
}

/**
 * Calculate expected metrics based on restaurant type and adjustments
 */
export function calculateAdjustedBenchmark(
  type: RestaurantType,
  baseMetric: string,
  adjustments: {
    cityTier?: CityTier
    season?: Season
    region?: Region
  }
): number | null {
  const profile = getRestaurantProfile(type)
  const benchmark = profile.core_benchmarks[baseMetric as keyof typeof profile.core_benchmarks]
  
  if (!benchmark) return null
  
  const parsed = parseRange(benchmark as string)
  if (!parsed) return null
  
  // Use midpoint as base
  let adjusted = (parsed.min + parsed.max) / 2
  
  // Apply city tier adjustment
  if (adjustments.cityTier) {
    const cityAdjustment = getCityTierAdjustment(type, adjustments.cityTier, baseMetric)
    if (cityAdjustment !== null) {
      adjusted = adjusted * (1 + cityAdjustment / 100)
    }
  }
  
  // Apply seasonal adjustment
  if (adjustments.season) {
    const seasonalAdjustment = getSeasonalAdjustment(type, adjustments.season, baseMetric)
    if (seasonalAdjustment !== null) {
      adjusted = adjusted * (1 + seasonalAdjustment / 100)
    }
  }
  
  return adjusted
}

/**
 * Generate benchmark-aware insights
 */
export function generateBenchmarkInsights(
  type: RestaurantType,
  actualMetrics: Record<string, number>
): Array<{
  metric: string
  comparison: ReturnType<typeof compareToBenchmark>
  recommendation?: string
}> {
  const profile = getRestaurantProfile(type)
  const insights: Array<{
    metric: string
    comparison: ReturnType<typeof compareToBenchmark>
    recommendation?: string
  }> = []
  
  // Compare each actual metric to its benchmark
  for (const [metric, value] of Object.entries(actualMetrics)) {
    const benchmarkKey = `${metric}_percent_range` as keyof typeof profile.core_benchmarks
    const benchmark = profile.core_benchmarks[benchmarkKey]
    
    if (benchmark) {
      const comparison = compareToBenchmark(value, benchmark as string, metric)
      let recommendation: string | undefined
      
      if (comparison.status === "above") {
        recommendation = `Consider optimizing ${metric} to reduce costs`
      } else if (comparison.status === "below") {
        recommendation = `Your ${metric} is lower than expected - this could indicate underinvestment`
      }
      
      insights.push({
        metric,
        comparison,
        recommendation
      })
    }
  }
  
  return insights
}

/**
 * Get restaurant type display name
 */
export function getRestaurantTypeDisplayName(type: RestaurantType): string {
  const names: Record<RestaurantType, string> = {
    cafe: "Café",
    qsr: "Quick Service Restaurant (QSR)",
    fine_dine: "Fine Dining",
    pub_restobar: "Pub/Restobar",
    cloud_kitchen: "Cloud Kitchen",
    bakery: "Bakery",
    food_truck: "Food Truck"
  }
  
  return names[type] || type
}

/**
 * Get all available restaurant types
 */
export function getAvailableRestaurantTypes(): RestaurantType[] {
  return Object.keys(restaurantBenchmarks.benchmarks_india) as RestaurantType[]
}

