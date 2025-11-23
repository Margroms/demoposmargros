/**
 * Restaurant Type Benchmarks for India
 * This is the foundation for ML-enhanced POS analytics
 * Each restaurant type has specific benchmarks, problems, and patterns
 */

export type RestaurantType = 
  | "cafe" 
  | "qsr" 
  | "fine_dine" 
  | "pub_restobar" 
  | "cloud_kitchen" 
  | "bakery" 
  | "food_truck"

export type CityTier = "metro" | "tier_1" | "tier_2" | "tier_3"
export type Season = "summer" | "monsoon" | "winter"
export type Region = "south" | "north" | "west" | "east"

export interface CoreBenchmarks {
  food_cost_percent_range?: string
  staff_cost_percent_range?: string
  marketing_percent_range?: string
  rent_percent_of_revenue?: string
  electricity_percent?: string
  waste_percent_range?: string
  delivery_ratio_percent?: string
  dinein_ratio_percent?: string
  avg_ticket_size_range_inr?: string
  monthly_revenue_range_inr?: string
  monthly_profit_margin_percent?: string
  profit_margin_percent?: string
  profit_margin_range_percent?: string
  seating_capacity_norm?: string
  equipment_investment_range_inr?: string
  kitchen_size_sqft_range?: string
  ideal_staff_count_range?: string
  liquor_cost_percent_range?: string
}

export interface SeasonalEffects {
  summer?: Record<string, string>
  monsoon?: Record<string, string>
  winter?: Record<string, string>
}

export interface CityTierAdjustments {
  metro?: Record<string, string>
  tier_1?: Record<string, string>
  tier_2?: Record<string, string>
  tier_3?: Record<string, string>
}

export interface RegionalAdjustments {
  south?: Record<string, string>
  north?: Record<string, string>
  west?: Record<string, string>
  east?: Record<string, string>
}

export interface RestaurantTypeProfile {
  core_benchmarks: CoreBenchmarks
  staff_structure?: string[]
  common_problems: string[]
  seasonal_effects?: SeasonalEffects
  city_tier_adjustments?: CityTierAdjustments
  regional_adjustments?: RegionalAdjustments
  cuisine_variations?: Record<string, any>
}

export interface RestaurantBenchmarks {
  benchmarks_india: {
    [key in RestaurantType]: RestaurantTypeProfile
  }
}

export const restaurantBenchmarks: RestaurantBenchmarks = {
  benchmarks_india: {
    cafe: {
      core_benchmarks: {
        food_cost_percent_range: "32-38",
        staff_cost_percent_range: "18-25",
        marketing_percent_range: "5-8",
        rent_percent_of_revenue: "12-18",
        electricity_percent: "4-7",
        waste_percent_range: "3-5",
        delivery_ratio_percent: "25-40",
        dinein_ratio_percent: "60-75",
        avg_ticket_size_range_inr: "250-450",
        monthly_revenue_range_inr: "3L-12L",
        monthly_profit_margin_percent: "12-18",
        seating_capacity_norm: "20-60",
        equipment_investment_range_inr: "4L-10L",
        kitchen_size_sqft_range: "80-150",
        ideal_staff_count_range: "6-14"
      },
      staff_structure: [
        "1-2 baristas",
        "1-2 kitchen staff",
        "1 cashier",
        "1 floor staff",
        "1 cleaning/helper",
        "Optional pastry chef"
      ],
      common_problems: [
        "High metro rents",
        "Unstable staff skill",
        "Coffee bean price fluctuations",
        "Season-dependent footfall",
        "Delivery commission issues",
        "High electricity consumption"
      ],
      seasonal_effects: {
        summer: { cold_beverages_sales_boost: "+35", hot_sales_drop: "-12" },
        monsoon: { footfall_drop: "-8", snack_demand: "+12" },
        winter: { hot_coffee_boost: "+22", desserts_boost: "+18" }
      },
      city_tier_adjustments: {
        metro: { rent_increase_percent: "+30", salary_increase_percent: "+18", ticket_size_variation: "+22" },
        tier_1: { rent_increase_percent: "+15", salary_increase_percent: "+10" },
        tier_2: { rent_variation: "+5", ticket_size_variation: "-5" },
        tier_3: { rent_variation: "-10", ticket_size_variation: "-15" }
      },
      regional_adjustments: {
        south: { coffee_preference: "High", milk_usage: "High" },
        north: { milkshake_demand: "High" },
        west: { cold_coffee_preference: "Very High" },
        east: { tea_preference: "Higher than coffee" }
      }
    },

    qsr: {
      core_benchmarks: {
        food_cost_percent_range: "28-35",
        staff_cost_percent_range: "14-20",
        marketing_percent_range: "3-7",
        rent_percent_of_revenue: "10-14",
        electricity_percent: "5-8",
        waste_percent_range: "4-7",
        delivery_ratio_percent: "60-75",
        dinein_ratio_percent: "25-40",
        avg_ticket_size_range_inr: "150-300",
        monthly_revenue_range_inr: "4L-18L",
        monthly_profit_margin_percent: "10-15"
      },
      common_problems: [
        "Delivery commissions 25-30%",
        "Vegetable and oil price spikes",
        "Peak-hour bottlenecks",
        "Prep inconsistency",
        "High packaging cost"
      ],
      seasonal_effects: {
        summer: { beverage_boost: "+20" },
        monsoon: { fried_sales_boost: "+30" },
        winter: { rolls_boost: "+25" }
      },
      cuisine_variations: {
        burger_qsr: { food_cost: "30-35", top_items: ["Chicken Burger", "Veg Burger"] },
        biryani_qsr: { food_cost: "32-40", oil_usage: "High" },
        roll_qsr: { food_cost: "28-34", top_items: ["Paneer Roll", "Egg Roll"] }
      },
      city_tier_adjustments: {
        metro: { rent: "+22", salary: "+15", ticket_size: "+18" },
        tier_2: { ticket_size: "-5", dinein_increase: "+15" }
      }
    },

    fine_dine: {
      core_benchmarks: {
        food_cost_percent_range: "30-40",
        staff_cost_percent_range: "22-30",
        marketing_percent_range: "4-7",
        rent_percent_of_revenue: "12-20",
        avg_ticket_size_range_inr: "600-1500",
        profit_margin_percent: "8-12",
        seating_capacity_norm: "40-120"
      },
      staff_structure: [
        "Executive Chef",
        "Sous Chef",
        "Commis",
        "Stewards",
        "Hostess",
        "Biller"
      ],
      common_problems: [
        "High staff cost",
        "Footfall instability",
        "High expectations",
        "Food wastage from fine plating",
        "Rental burden"
      ]
    },

    pub_restobar: {
      core_benchmarks: {
        liquor_cost_percent_range: "18-25",
        food_cost_percent_range: "28-35",
        staff_cost_percent_range: "20-28",
        rent_percent_of_revenue: "15-25",
        avg_ticket_size_range_inr: "800-2000",
        waste_percent_range: "5-10"
      },
      common_problems: [
        "Excise issues",
        "Liquor pilferage",
        "Weekend dependency",
        "Police checks",
        "High licensing cost"
      ]
    },

    cloud_kitchen: {
      core_benchmarks: {
        food_cost_percent_range: "28-34",
        staff_cost_percent_range: "10-16",
        marketing_percent_range: "8-15",
        delivery_ratio_percent: "85-95",
        avg_ticket_size_range_inr: "120-250",
        profit_margin_range_percent: "12-20",
        waste_percent_range: "3-6"
      },
      common_problems: [
        "Delivery partner dependency",
        "Refunds/cancellations",
        "Brand discovery issues",
        "Packaging costs"
      ]
    },

    bakery: {
      core_benchmarks: {
        food_cost_percent_range: "32-40",
        staff_cost_percent_range: "16-22",
        waste_percent_range: "7-12",
        avg_ticket_size_range_inr: "100-250"
      },
      common_problems: [
        "Shelf-life issues",
        "Festive season spikes",
        "Unsold inventory wastage"
      ]
    },

    food_truck: {
      core_benchmarks: {
        food_cost_percent_range: "28-36",
        staff_cost_percent_range: "10-14",
        waste_percent_range: "3-6",
        avg_ticket_size_range_inr: "80-200",
        monthly_revenue_range_inr: "1.5L-6L",
        profit_margin_percent_range: "12-20"
      },
      common_problems: [
        "Location instability",
        "Weather dependency",
        "Parking permissions",
        "Limited storage"
      ]
    }
  }
}

