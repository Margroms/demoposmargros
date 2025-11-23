/**
 * Benchmark-Aware Analytics Agent
 * Uses restaurant type benchmarks to provide intelligent, personalized insights
 */

import { getGroqCompletion } from "./AIAgent"
import {
  getRestaurantProfile,
  compareToBenchmark,
  getCommonProblems,
  getRestaurantTypeDisplayName,
  type RestaurantType,
  type CityTier,
  type Season
} from "@/lib/restaurant-benchmark-utils"

interface RestaurantMetrics {
  food_cost_percent?: number
  staff_cost_percent?: number
  marketing_percent?: number
  rent_percent?: number
  electricity_percent?: number
  waste_percent?: number
  delivery_ratio_percent?: number
  dinein_ratio_percent?: number
  avg_ticket_size?: number
  monthly_revenue?: number
  profit_margin_percent?: number
}

interface BenchmarkAnalysisData {
  restaurantType: RestaurantType
  cityTier?: CityTier
  season?: Season
  actualMetrics: RestaurantMetrics
  timeRange?: string
  additionalContext?: string
}

/**
 * Generate benchmark-aware executive insights
 */
export async function getBenchmarkAwareInsights(data: BenchmarkAnalysisData) {
  const profile = getRestaurantProfile(data.restaurantType)
  const restaurantName = getRestaurantTypeDisplayName(data.restaurantType)
  const commonProblems = getCommonProblems(data.restaurantType)
  
  // Build comparison analysis
  const comparisons: Array<ReturnType<typeof compareToBenchmark>> = []
  
  if (data.actualMetrics.food_cost_percent !== undefined) {
    comparisons.push(compareToBenchmark(
      data.actualMetrics.food_cost_percent,
      profile.core_benchmarks.food_cost_percent_range,
      "Food Cost"
    ))
  }
  
  if (data.actualMetrics.staff_cost_percent !== undefined) {
    comparisons.push(compareToBenchmark(
      data.actualMetrics.staff_cost_percent,
      profile.core_benchmarks.staff_cost_percent_range,
      "Staff Cost"
    ))
  }
  
  if (data.actualMetrics.delivery_ratio_percent !== undefined) {
    comparisons.push(compareToBenchmark(
      data.actualMetrics.delivery_ratio_percent,
      profile.core_benchmarks.delivery_ratio_percent,
      "Delivery Ratio"
    ))
  }
  
  if (data.actualMetrics.profit_margin_percent !== undefined) {
    const profitBenchmark = profile.core_benchmarks.monthly_profit_margin_percent || 
                           profile.core_benchmarks.profit_margin_percent ||
                           profile.core_benchmarks.profit_margin_range_percent
    comparisons.push(compareToBenchmark(
      data.actualMetrics.profit_margin_percent,
      profitBenchmark,
      "Profit Margin"
    ))
  }
  
  // Format comparisons for prompt
  const comparisonText = comparisons.map(comp => {
    let statusIcon = "✅"
    if (comp.status === "above") statusIcon = "⚠️"
    if (comp.status === "below") statusIcon = "📉"
    
    return `${statusIcon} **${comp.metric}**: ${comp.message}`
  }).join("\n")
  
  const problemsText = commonProblems.length > 0
    ? `\n**Common Issues for ${restaurantName}:**\n${commonProblems.map(p => `• ${p}`).join("\n")}`
    : ""
  
  const prompt = `
You are an expert restaurant business analyst providing benchmark-aware insights for a ${restaurantName}.

**RESTAURANT PROFILE**
• Type: ${restaurantName}
${data.cityTier ? `• City Tier: ${data.cityTier}` : ""}
${data.season ? `• Current Season: ${data.season}` : ""}
${data.timeRange ? `• Analysis Period: ${data.timeRange}` : ""}

**BENCHMARK COMPARISON ANALYSIS**
${comparisonText}

**ACTUAL METRICS**
${Object.entries(data.actualMetrics)
  .filter(([_, value]) => value !== undefined)
  .map(([key, value]) => {
    const displayKey = key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())
    return `• ${displayKey}: ${typeof value === "number" ? value.toFixed(2) + "%" : value}`
  })
  .join("\n")}

${problemsText}

${data.additionalContext ? `\n**ADDITIONAL CONTEXT:**\n${data.additionalContext}` : ""}

**YOUR TASK:**
Provide comprehensive, actionable insights that:
1. Interpret the benchmark comparisons in the context of ${restaurantName} operations
2. Explain what each metric deviation means for this specific restaurant type
3. Provide type-specific recommendations (e.g., for cafes: coffee bean costs, for QSR: delivery optimization)
4. Highlight opportunities based on restaurant type patterns
5. Address common problems for ${restaurantName} if metrics suggest they're occurring

Format your response with clear sections, use markdown, and be specific to ${restaurantName} business model.
`

  return await getGroqCompletion(prompt)
}

/**
 * Generate restaurant-type specific growth tips
 */
export async function getTypeSpecificGrowthTips(
  restaurantType: RestaurantType,
  currentMetrics: RestaurantMetrics,
  seasonalContext?: Season
) {
  const profile = getRestaurantProfile(restaurantType)
  const restaurantName = getRestaurantTypeDisplayName(restaurantType)
  
  const seasonalEffects = seasonalContext && profile.seasonal_effects?.[seasonalContext]
  const seasonalText = seasonalEffects
    ? `\n**Current Season (${seasonalContext}):**\n${Object.entries(seasonalEffects)
        .map(([key, value]) => `• ${key.replace(/_/g, " ")}: ${value}`)
        .join("\n")}`
    : ""
  
  const prompt = `
You are a restaurant growth strategist specializing in ${restaurantName} operations.

**RESTAURANT TYPE:** ${restaurantName}

**CURRENT METRICS:**
${Object.entries(currentMetrics)
  .filter(([_, value]) => value !== undefined)
  .map(([key, value]) => {
    const displayKey = key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())
    return `• ${displayKey}: ${typeof value === "number" ? value.toFixed(2) + "%" : value}`
  })
  .join("\n")}

${seasonalText}

**COMMON CHALLENGES FOR ${restaurantName.toUpperCase()}:**
${profile.common_problems.map(p => `• ${p}`).join("\n")}

**YOUR TASK:**
Generate 5-7 actionable growth tips specifically tailored for ${restaurantName}:
1. Tips should leverage seasonal patterns if applicable
2. Address common problems for this restaurant type
3. Be specific to ${restaurantName} business model (e.g., cafes: beverage combos, QSR: delivery optimization, pubs: weekend strategies)
4. Include timing recommendations (when to implement)
5. Reference benchmark ranges where relevant

Format as a numbered list with clear, actionable recommendations.
`

  return await getGroqCompletion(prompt)
}

/**
 * Analyze menu performance with restaurant type context
 */
export async function getTypeAwareMenuAnalysis(
  restaurantType: RestaurantType,
  menuData: {
    topItems: Array<{ name: string; quantity: number; revenue: number }>
    categories: Array<{ name: string; revenue: number; items: number }>
  }
) {
  const restaurantName = getRestaurantTypeDisplayName(restaurantType)
  const profile = getRestaurantProfile(restaurantType)
  
  const prompt = `
You are analyzing menu performance for a ${restaurantName}.

**RESTAURANT TYPE:** ${restaurantName}

**TOP SELLING ITEMS:**
${menuData.topItems.map((item, idx) => 
  `${idx + 1}. ${item.name} - ${item.quantity} sold, ₹${item.revenue.toLocaleString()} revenue`
).join("\n")}

**CATEGORY PERFORMANCE:**
${menuData.categories.map(cat => 
  `• ${cat.name}: ₹${cat.revenue.toLocaleString()} (${cat.items} items)`
).join("\n")}

**EXPECTED PATTERNS FOR ${restaurantName.toUpperCase()}:**
${restaurantType === "cafe" ? "• Beverages typically drive profit\n• Seasonal beverage variations\n• Dessert pairings important" : ""}
${restaurantType === "qsr" ? "• High-volume items (rolls/burgers)\n• Delivery-friendly items\n• Quick prep items" : ""}
${restaurantType === "fine_dine" ? "• Mains + desserts combo\n• Premium items\n• Seasonal menu rotations" : ""}
${restaurantType === "pub_restobar" ? "• Liquor + food pairings\n• Bar snacks\n• Weekend specials" : ""}
${restaurantType === "cloud_kitchen" ? "• Delivery-optimized items\n• Packaging-friendly\n• High margin items" : ""}
${restaurantType === "bakery" ? "• Festival season spikes\n• Daily fresh items\n• Shelf-life considerations" : ""}
${restaurantType === "food_truck" ? "• Portable items\n• Weather-resistant\n• Quick service items" : ""}

**YOUR TASK:**
Analyze the menu performance in the context of ${restaurantName}:
1. Identify items that align with expected patterns for this restaurant type
2. Highlight opportunities based on restaurant type (e.g., cafes: promote beverage combos)
3. Suggest menu optimizations specific to ${restaurantName}
4. Predict seasonal variations based on restaurant type
5. Recommend category strategies

Provide specific, actionable insights tailored to ${restaurantName} operations.
`

  return await getGroqCompletion(prompt)
}

