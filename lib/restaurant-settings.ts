/**
 * Restaurant Settings Utilities
 * Functions to get and set restaurant configuration
 */

import { supabase, type RestaurantSettings } from "./supabase"
import type { RestaurantType, CityTier, Region } from "./restaurant-benchmarks"

/**
 * Get restaurant settings (singleton - only one restaurant per database)
 */
export async function getRestaurantSettings(): Promise<RestaurantSettings | null> {
  try {
    const { data, error } = await supabase
      .from("restaurant_settings")
      .select("*")
      .limit(1)
      .maybeSingle()

    if (error) {
      // Check for common error codes
      if (error.code === "PGRST116" || error.code === "42P01") {
        // No settings found or table doesn't exist
        return null
      }
      // Only log non-expected errors
      if (error.message && !error.message.includes("relation") && !error.message.includes("does not exist")) {
        console.error("Error fetching restaurant settings:", error)
      }
      return null
    }

    return data
  } catch (err) {
    // Handle any unexpected errors (like table not existing)
    return null
  }
}

/**
 * Create or update restaurant settings
 */
export async function saveRestaurantSettings(settings: {
  restaurant_type: RestaurantType
  city_tier?: CityTier
  region?: Region
  restaurant_name?: string
}): Promise<RestaurantSettings | null> {
  try {
    // Check if settings already exist
    const existing = await getRestaurantSettings()

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from("restaurant_settings")
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq("id", existing.id)
        .select()
        .single()

      if (error) {
        // Check if it's a table-not-found error
        if (error.code === "42P01" || (error.message && error.message.includes("does not exist"))) {
          throw new Error("restaurant_settings table does not exist. Please create it in your Supabase database.")
        }
        console.error("Error updating restaurant settings:", error)
        return null
      }

      return data
    } else {
      // Create new
      const { data, error } = await supabase
        .from("restaurant_settings")
        .insert({
          ...settings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        // Check if it's a table-not-found error
        if (error.code === "42P01" || (error.message && error.message.includes("does not exist"))) {
          throw new Error("restaurant_settings table does not exist. Please create it in your Supabase database.")
        }
        console.error("Error creating restaurant settings:", error)
        return null
      }

      return data
    }
  } catch (err) {
    // Re-throw if it's our custom error about table not existing
    if (err instanceof Error && err.message.includes("does not exist")) {
      throw err
    }
    console.error("Unexpected error saving restaurant settings:", err)
    return null
  }
}

/**
 * Check if restaurant is configured
 */
export async function isRestaurantConfigured(): Promise<boolean> {
  const settings = await getRestaurantSettings()
  return settings !== null && settings.restaurant_type !== null
}

