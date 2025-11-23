"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { saveRestaurantSettings } from "@/lib/restaurant-settings"
import { getRestaurantTypeDisplayName, getAvailableRestaurantTypes } from "@/lib/restaurant-benchmark-utils"
import type { RestaurantType, CityTier, Region } from "@/lib/restaurant-benchmarks"
import { useState } from "react"
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react"

interface RestaurantOnboardingProps {
  onComplete: () => void
}

export function RestaurantOnboarding({ onComplete }: RestaurantOnboardingProps) {
  const { toast } = useToast()
  const [step, setStep] = useState(1)
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

  const handleNext = () => {
    if (step === 1 && !settings.restaurant_type) {
      toast({
        title: "Required",
        description: "Please select a restaurant type",
        variant: "destructive"
      })
      return
    }
    if (step < 3) {
      setStep(step + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleComplete = async () => {
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
          title: "Setup Complete!",
          description: "Your restaurant has been configured successfully",
        })
        onComplete()
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      const errorMessage = error instanceof Error && error.message.includes("does not exist")
        ? "The restaurant_settings table doesn't exist. Please run the migration SQL in your Supabase database. See lib/supabase-migrations.sql"
        : "Failed to save settings. Please try again."
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 10000
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Welcome! Let's Set Up Your Restaurant</CardTitle>
          </div>
          <CardDescription>
            Configure your restaurant type to enable personalized analytics and benchmark comparisons
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step >= s
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-muted"
                  }`}
                >
                  {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step > s ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Restaurant Type */}
          {step === 1 && (
            <div className="space-y-4">
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
                  This enables personalized benchmarks and insights for your business model
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-4">
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
                  Helps adjust benchmarks for your location's cost structure
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
            </div>
          )}

          {/* Step 3: Summary */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div>
                  <Label className="text-sm text-muted-foreground">Restaurant Type</Label>
                  <p className="font-medium">
                    {settings.restaurant_type ? getRestaurantTypeDisplayName(settings.restaurant_type) : "Not set"}
                  </p>
                </div>
                {settings.restaurant_name && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Restaurant Name</Label>
                    <p className="font-medium">{settings.restaurant_name}</p>
                  </div>
                )}
                {settings.city_tier && (
                  <div>
                    <Label className="text-sm text-muted-foreground">City Tier</Label>
                    <p className="font-medium capitalize">{settings.city_tier.replace("_", " ")}</p>
                  </div>
                )}
                {settings.region && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Region</Label>
                    <p className="font-medium capitalize">{settings.region} India</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">What's Next?</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      You'll now have access to benchmark-aware analytics, personalized insights, 
                      and type-specific growth recommendations tailored to your restaurant.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleBack} disabled={step === 1}>
              Back
            </Button>
            <Button onClick={handleNext} disabled={saving || (step === 1 && !settings.restaurant_type)}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : step === 3 ? (
                <>
                  Complete Setup
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

