"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { saveRestaurantSettings, getRestaurantSettings } from "@/lib/restaurant-settings"
import { getRestaurantTypeDisplayName, getAvailableRestaurantTypes } from "@/lib/restaurant-benchmark-utils"
import type { RestaurantType, CityTier, Region } from "@/lib/restaurant-benchmarks"
import { useState, useEffect } from "react"
import { Settings, Save, CheckCircle2 } from "lucide-react"

export default function RestaurantSettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<{
    restaurant_type: RestaurantType | ""
    city_tier: CityTier | ""
    region: Region | ""
    restaurant_name: string
  }>({
    restaurant_type: "",
    city_tier: "",
    region: "",
    restaurant_name: ""
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    const existing = await getRestaurantSettings()
    if (existing) {
      setSettings({
        restaurant_type: existing.restaurant_type || "",
        city_tier: existing.city_tier || "",
        region: existing.region || "",
        restaurant_name: existing.restaurant_name || ""
      })
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!settings.restaurant_type) {
      toast({
        title: "Error",
        description: "Please select a restaurant type",
        variant: "destructive"
      })
      return
    }

    setSaving(true)
    try {
      const saved = await saveRestaurantSettings({
        restaurant_type: settings.restaurant_type as RestaurantType,
        city_tier: settings.city_tier ? (settings.city_tier as CityTier) : undefined,
        region: settings.region ? (settings.region as Region) : undefined,
        restaurant_name: settings.restaurant_name || undefined
      })

      if (saved) {
        toast({
          title: "Settings Saved",
          description: "Restaurant settings have been updated successfully",
        })
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Restaurant Settings
          </h1>
          <p className="text-muted-foreground">
            Configure your restaurant type and location for personalized analytics
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Restaurant Configuration</CardTitle>
            <CardDescription>
              These settings enable benchmark-aware analytics and personalized insights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="restaurant_name">Restaurant Name (Optional)</Label>
              <Input
                id="restaurant_name"
                placeholder="Enter your restaurant name"
                value={settings.restaurant_name}
                onChange={(e) => setSettings({ ...settings, restaurant_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="restaurant_type">
                Restaurant Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={settings.restaurant_type}
                onValueChange={(value) => setSettings({ ...settings, restaurant_type: value as RestaurantType })}
              >
                <SelectTrigger id="restaurant_type">
                  <SelectValue placeholder="Select restaurant type" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableRestaurantTypes().map((type) => (
                    <SelectItem key={type} value={type}>
                      {getRestaurantTypeDisplayName(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                This determines your benchmark comparisons and personalized insights
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city_tier">City Tier (Optional)</Label>
              <Select
                value={settings.city_tier}
                onValueChange={(value) => setSettings({ ...settings, city_tier: value as CityTier })}
              >
                <SelectTrigger id="city_tier">
                  <SelectValue placeholder="Select city tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metro">Metro (Mumbai, Delhi, Bangalore, etc.)</SelectItem>
                  <SelectItem value="tier_1">Tier 1 (Pune, Hyderabad, Chennai, etc.)</SelectItem>
                  <SelectItem value="tier_2">Tier 2 (Jaipur, Lucknow, etc.)</SelectItem>
                  <SelectItem value="tier_3">Tier 3 (Smaller cities)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Helps adjust benchmarks for your location
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region (Optional)</Label>
              <Select
                value={settings.region}
                onValueChange={(value) => setSettings({ ...settings, region: value as Region })}
              >
                <SelectTrigger id="region">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="north">North India</SelectItem>
                  <SelectItem value="south">South India</SelectItem>
                  <SelectItem value="west">West India</SelectItem>
                  <SelectItem value="east">East India</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Enables regional preference adjustments
              </p>
            </div>

            {settings.restaurant_type && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Why this matters:</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your restaurant type enables personalized benchmarks, seasonal predictions, and 
                      type-specific growth recommendations. This makes your analytics much more accurate 
                      and actionable.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button onClick={handleSave} disabled={saving || !settings.restaurant_type}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

