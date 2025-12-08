"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { supabase, type Order, type Payment } from "@/lib/supabase"
import { ArrowDown, ArrowUp, CreditCard, DollarSign, ShoppingBag, Users, Bot, Target, ClipboardList, Settings, Users2, BarChart3, RotateCcw, Activity, CheckCircle2, TrendingUp } from "lucide-react"
import { useState, useEffect } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { getAdminAssistantInsights, getStrategicBusinessPlan, getOperationalEfficiencyAnalysis, getCustomerInsightsAnalysis, getCompetitiveAnalysisReport, getBusinessIntelligenceDashboard } from "@/models/AdminAssistant"
import MarkdownRenderer from "@/components/markdown-renderer"
import { BenchmarkComparisonDashboard } from "@/components/benchmark-comparison-dashboard"
import { getRestaurantSettings } from "@/lib/restaurant-settings"

export default function AdminDashboard() {
  // State
  const [orders, setOrders] = useState<Order[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [menuCategories, setMenuCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageBill: 0,
  })
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<any[]>([])
  const [topSellingItems, setTopSellingItems] = useState<any[]>([])
  const [weeklyRevenueData, setWeeklyRevenueData] = useState<any[]>([])
  const [yearlyRevenueData, setYearlyRevenueData] = useState<any[]>([])
  const [aiInsights, setAiInsights] = useState<string | null>(null)
  const [showAiInsights, setShowAiInsights] = useState(false)
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [restaurantSettings, setRestaurantSettings] = useState<any>(null)
  const [cachedAdminData, setCachedAdminData] = useState<any>(null)

  // Fetch data on component mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    await Promise.all([
      fetchOrders(), 
      fetchPayments(), 
      fetchOrderItems(), 
      fetchMenuItems(), 
      fetchMenuCategories(),
      fetchRestaurantSettings()
    ])
    setLoading(false)
  }

  const fetchRestaurantSettings = async () => {
    const settings = await getRestaurantSettings()
    setRestaurantSettings(settings)
  }

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        tables (*),
        order_items (
          *,
          menu_items (*)
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error.message || error.code || JSON.stringify(error))
    } else {
      setOrders(data || [])
      calculateStats(data || [])
      generateRevenueData(data || [])
    }
  }

  const fetchPayments = async () => {
    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        orders (
          *,
          tables (*)
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching payments:", error.message || error.code || JSON.stringify(error))
    } else {
      setPayments(data || [])
    }
  }

  const fetchOrderItems = async () => {
    const { data, error } = await supabase
      .from("order_items")
      .select(`
        *,
        menu_items (*),
        orders (*)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching order items:", error.message || error.code || JSON.stringify(error))
    } else {
      setOrderItems(data || [])
      generateTopSellingItems(data || [])
    }
  }

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .select(`
        *,
        menu_categories (*)
      `)

    if (error) {
      console.error("Error fetching menu items:", error.message || error.code || JSON.stringify(error))
    } else {
      setMenuItems(data || [])
    }
  }

  const fetchMenuCategories = async () => {
    const { data, error } = await supabase
      .from("menu_categories")
      .select("*")
      .order("display_order")

    if (error) {
      console.error("Error fetching menu categories:", error.message || error.code || JSON.stringify(error))
    } else {
      setMenuCategories(data || [])
      // Generate category data after fetching categories
      if (data && data.length > 0) {
        await generateCategoryData(data)
      }
    }
  }

  const calculateStats = (ordersData: Order[]) => {
    const paidOrders = ordersData.filter((order) => order.status === "paid")
    const totalRevenue = paidOrders.reduce((sum, order) => sum + Number(order.total), 0)
    const totalOrders = ordersData.length
    const totalCustomers = new Set(ordersData.map((order) => order.table_id)).size
    const averageBill = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0

    setStats({
      totalRevenue,
      totalOrders,
      totalCustomers,
      averageBill,
    })
  }

  const generateRevenueData = (ordersData: Order[]) => {
    const paidOrders = ordersData.filter((order) => order.status === "paid")
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date
    })

    const dailyRevenue = last7Days.map(date => {
      const dayOrders = paidOrders.filter(order => {
        const orderDate = new Date(order.created_at)
        return orderDate.toDateString() === date.toDateString()
      })
      const revenue = dayOrders.reduce((sum, order) => sum + Number(order.total), 0)
      return {
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: revenue
      }
    })

    setRevenueData(dailyRevenue)

    // Generate weekly data
    const last4Weeks = Array.from({ length: 4 }, (_, i) => {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - (3 - i) * 7 - 6)
      const endDate = new Date()
      endDate.setDate(endDate.getDate() - (3 - i) * 7)
      return { startDate, endDate, name: `Week ${i + 1}` }
    })

    const weeklyRevenue = last4Weeks.map(week => {
      const weekOrders = paidOrders.filter(order => {
        const orderDate = new Date(order.created_at)
        return orderDate >= week.startDate && orderDate <= week.endDate
      })
      const revenue = weekOrders.reduce((sum, order) => sum + Number(order.total), 0)
      return {
        name: week.name,
        revenue: revenue
      }
    })

    setWeeklyRevenueData(weeklyRevenue)

    // Generate monthly data
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (11 - i))
      return date
    })

    const monthlyRevenue = last12Months.map(date => {
      const monthOrders = paidOrders.filter(order => {
        const orderDate = new Date(order.created_at)
        return orderDate.getMonth() === date.getMonth() && 
               orderDate.getFullYear() === date.getFullYear()
      })
      const revenue = monthOrders.reduce((sum, order) => sum + Number(order.total), 0)
      return {
        name: date.toLocaleDateString('en-US', { month: 'short' }),
        revenue: revenue
      }
    })

    setMonthlyRevenueData(monthlyRevenue)

    // Generate yearly data
    const last5Years = Array.from({ length: 5 }, (_, i) => {
      const year = new Date().getFullYear() - (4 - i)
      return year
    })

    const yearlyRevenue = last5Years.map(year => {
      const yearOrders = paidOrders.filter(order => {
        const orderDate = new Date(order.created_at)
        return orderDate.getFullYear() === year
      })
      const revenue = yearOrders.reduce((sum, order) => sum + Number(order.total), 0)
      return {
        name: year.toString(),
        revenue: revenue
      }
    })

    setYearlyRevenueData(yearlyRevenue)
  }

  const generateCategoryData = async (categoriesData: any[]) => {
    if (categoriesData.length === 0) return

    try {
      const { data: orderItemsWithCategories, error } = await supabase
        .from("order_items")
        .select(`
          *,
          menu_items!inner (
            *,
            menu_categories!inner (*)
          ),
          orders!inner (*)
        `)
        .eq("orders.status", "paid")

      if (error) {
        console.error("Error fetching category data:", error.message || error.code || JSON.stringify(error))
        return
      }

      const categoryRevenue = categoriesData.map(category => {
        const categoryItems = orderItemsWithCategories?.filter(
          item => item.menu_items?.menu_categories?.id === category.id
        ) || []
        
        const revenue = categoryItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0)
        
        return {
          name: category.name,
          value: revenue,
          fill: getRandomColor(category.id)
        }
      }).filter(item => item.value > 0)

      setCategoryData(categoryRevenue)
    } catch (error) {
      console.error("Error generating category data:", error)
    }
  }

  const generateTopSellingItems = (orderItemsData: any[]) => {
    const paidOrderItems = orderItemsData.filter(item => 
      item.orders?.status === "paid"
    )

    const itemQuantities = paidOrderItems.reduce((acc, item) => {
      const itemName = item.menu_items?.name || 'Unknown Item'
      acc[itemName] = (acc[itemName] || 0) + Number(item.quantity)
      return acc
    }, {} as Record<string, number>)

    const topItems = Object.entries(itemQuantities)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([name, quantity]) => ({
        name,
        quantity
      }))

    setTopSellingItems(topItems)
  }

  const getRandomColor = (seed: number) => {
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16"]
    return colors[seed % colors.length]
  }

  // AI Assistant Functions - Store data for consistency
  const getAdminData = () => {
    return {
      orders,
      payments,
      orderItems,
      menuItems,
      menuCategories,
      timeRange: "current_period"
    }
  }

  const handleGetAdminInsights = async () => {
    setLoadingInsights(true)
    try {
      const adminData = getAdminData()
      // Cache the data to ensure consistency
      setCachedAdminData(adminData)
      
      const insights = await getAdminAssistantInsights(adminData)
      setAiInsights(insights || "No insights available.")
      setShowAiInsights(true)
    } catch (error) {
      console.error('Error getting admin insights:', error)
      setAiInsights("Unable to generate insights at this time.")
      setShowAiInsights(true)
    } finally {
      setLoadingInsights(false)
    }
  }

  // Calculate metrics for visualization - consistent calculation method
  const getBusinessMetrics = () => {
    // Always use current data for freshness, but with consistent calculation parameters
    const paidOrders = orders.filter((order) => order.status === "paid")
    const totalRevenue = paidOrders.reduce((sum, order) => sum + Number(order.total), 0)
    const totalOrders = orders.length
    const completedOrders = paidOrders.length
    const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0

    // Top selling items - consistent calculation
    const itemQuantities = orderItems
      .filter(item => item.orders?.status === "paid")
      .reduce((acc, item) => {
        const itemName = item.menu_items?.name || 'Unknown Item'
        acc[itemName] = (acc[itemName] || 0) + Number(item.quantity)
        return acc
      }, {} as Record<string, number>)

    const topItems = Object.entries(itemQuantities)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, quantity]) => ({ name, quantity }))

    // Category performance - consistent calculation
    const categoryRevenue = menuCategories.map(category => {
      const categoryItems = orderItems.filter(
        item => item.menu_items?.category_id === category.id && item.orders?.status === "paid"
      )
      const revenue = categoryItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0)
      return {
        name: category.name,
        value: revenue,
        fill: getRandomColor(category.id)
      }
    }).filter(item => item.value > 0)

    // Payment method breakdown - consistent calculation
    const paymentMethods = payments
      .filter(p => p.status === 'completed')
      .reduce((acc, payment) => {
        const method = payment.payment_method || 'unknown'
        acc[method] = (acc[method] || 0) + payment.amount
        return acc
      }, {} as Record<string, number>)

    const paymentData = Object.entries(paymentMethods).map(([name, value]) => ({
      name: name.toUpperCase(),
      value,
      fill: getRandomColor(name.length)
    }))

    return {
      totalRevenue,
      totalOrders,
      completedOrders,
      averageOrderValue,
      topItems,
      categoryRevenue,
      paymentData
    }
  }

  const handleGetStrategicPlan = async () => {
    setLoadingInsights(true)
    try {
      const adminData = {
        orders,
        payments,
        orderItems,
        menuItems,
        menuCategories,
        timeRange: "quarterly"
      }
      
      const strategicPlan = await getStrategicBusinessPlan(adminData, "quarterly")
      setAiInsights(strategicPlan || "No strategic plan available.")
      setShowAiInsights(true)
    } catch (error) {
      console.error('Error getting strategic plan:', error)
      setAiInsights("Unable to generate strategic plan at this time.")
      setShowAiInsights(true)
    } finally {
      setLoadingInsights(false)
    }
  }

  const handleGetOperationalAnalysis = async () => {
    setLoadingInsights(true)
    try {
      const adminData = {
        orders,
        payments,
        orderItems,
        menuItems,
        menuCategories
      }
      
      const operationalAnalysis = await getOperationalEfficiencyAnalysis(adminData)
      setAiInsights(operationalAnalysis || "No operational analysis available.")
      setShowAiInsights(true)
    } catch (error) {
      console.error('Error getting operational analysis:', error)
      setAiInsights("Unable to generate operational analysis at this time.")
      setShowAiInsights(true)
    } finally {
      setLoadingInsights(false)
    }
  }

  const handleGetCustomerInsights = async () => {
    setLoadingInsights(true)
    try {
      const adminData = {
        orders,
        payments,
        orderItems,
        menuItems,
        menuCategories
      }
      
      const customerInsights = await getCustomerInsightsAnalysis(adminData)
      setAiInsights(customerInsights || "No customer insights available.")
      setShowAiInsights(true)
    } catch (error) {
      console.error('Error getting customer insights:', error)
      setAiInsights("Unable to generate customer insights at this time.")
      setShowAiInsights(true)
    } finally {
      setLoadingInsights(false)
    }
  }

  const handleGetBusinessIntelligence = async () => {
    setLoadingInsights(true)
    try {
      const adminData = {
        orders,
        payments,
        orderItems,
        menuItems,
        menuCategories
      }
      
      const businessIntelligence = await getBusinessIntelligenceDashboard(adminData)
      setAiInsights(businessIntelligence || "No business intelligence available.")
      setShowAiInsights(true)
    } catch (error) {
      console.error('Error getting business intelligence:', error)
      setAiInsights("Unable to generate business intelligence at this time.")
      setShowAiInsights(true)
    } finally {
      setLoadingInsights(false)
    }
  }

  const LoadingView = (
    <div className="flex-1 space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6 animate-pulse">
            <div className="h-4 w-24 bg-muted rounded mb-2"></div>
            <div className="h-8 w-32 bg-muted rounded"></div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6 animate-pulse">
            <div className="h-6 w-40 bg-muted rounded mb-4"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    </div>
  )

  if (loading) return LoadingView

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

        {/* AI Assistant Section - Enhanced UI */}
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 shadow-lg hover:shadow-xl transition-all">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/20 border border-primary/30">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    Business Intelligence Assistant
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
                      AI Powered
                    </span>
                  </CardTitle>
                  <CardDescription className="mt-1 text-base">
                    Your AI Business Partner for Strategic Insights
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 p-4 bg-background/50 rounded-lg border border-border/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalOrders}</div>
                <div className="text-xs text-muted-foreground mt-1">Total Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                <div className="text-xs text-muted-foreground mt-1">Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalCustomers}</div>
                <div className="text-xs text-muted-foreground mt-1">Tables Served</div>
              </div>
            </div>
            <Button 
              onClick={handleGetAdminInsights} 
              disabled={loadingInsights} 
              variant="default" 
              className="w-full h-14 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              {loadingInsights ? (
                <>
                  <RotateCcw className="mr-2 h-5 w-5 animate-spin" /> 
                  Generating Intelligence Report...
                </>
              ) : (
                <>
                  <BarChart3 className="mr-2 h-5 w-5" /> 
                  Generate Business Intelligence Report
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Get AI-powered insights with visual analytics and strategic recommendations
            </p>
          </CardContent>
        </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue - Donut Chart with Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-[180px] relative">
              {(() => {
                // Create a visual donut chart showing revenue progress
                const targetRevenue = Math.max(stats.totalRevenue * 1.5, 10000) // Set a target for visualization
                const revenuePercentage = Math.min((stats.totalRevenue / targetRevenue) * 100, 100)
                const revenueData = [
                  { name: 'Earned', value: stats.totalRevenue, fill: '#3b82f6' },
                  { name: 'Remaining', value: Math.max(targetRevenue - stats.totalRevenue, 0), fill: '#e5e7eb' }
                ]
                
                return (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={revenueData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                        >
                          {revenueData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name) => {
                            if (name === 'Earned') {
                              return [`₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, "Revenue Earned"]
                            }
                            return null
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">₹{stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total Earnings</p>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {revenuePercentage.toFixed(0)}% of target
                        </div>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Based on paid orders
            </p>
          </CardContent>
        </Card>

        {/* Orders - Donut Chart by Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Orders Status
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              {(() => {
                const orderStatusData = [
                  { name: 'Paid', value: orders.filter(o => o.status === 'paid').length, fill: '#10b981' },
                  { name: 'Pending', value: orders.filter(o => o.status === 'pending').length, fill: '#f59e0b' },
                  { name: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length, fill: '#ef4444' },
                ].filter(item => item.value > 0)
                
                return orderStatusData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={orderStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {orderStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="text-center mt-2">
                      <div className="text-2xl font-bold">{stats.totalOrders}</div>
                      <p className="text-xs text-muted-foreground">Total Orders</p>
                    </div>
                    <div className="flex justify-center gap-4 mt-2 text-xs">
                      {orderStatusData.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                          <span className="text-muted-foreground">{item.name}: {item.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.totalOrders}</div>
                      <p className="text-xs text-muted-foreground">Total Orders</p>
                    </div>
                  </div>
                )
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Tables Served - Visual Progress Donut */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tables Served</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-[180px] relative">
              {(() => {
                // Create a visual donut chart showing tables served
                const targetTables = Math.max(stats.totalCustomers * 2, 20) // Set a target for visualization
                const tablesPercentage = Math.min((stats.totalCustomers / targetTables) * 100, 100)
                const tablesData = [
                  { name: 'Served', value: stats.totalCustomers, fill: '#8b5cf6' },
                  { name: 'Available', value: Math.max(targetTables - stats.totalCustomers, 0), fill: '#e5e7eb' }
                ]
                
                return (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={tablesData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                        >
                          {tablesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name) => {
                            if (name === 'Served') {
                              return [`${value} tables`, "Tables Served"]
                            }
                            return null
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{stats.totalCustomers}</div>
                        <p className="text-xs text-muted-foreground mt-1">Unique Tables</p>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {tablesPercentage.toFixed(0)}% capacity
                        </div>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Customers served today
            </p>
          </CardContent>
        </Card>

        {/* Average Bill - Visual Donut with Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Bill</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-[180px] relative">
              {(() => {
                // Create a visual donut chart showing average bill
                const targetBill = Math.max(stats.averageBill * 1.3, 500) // Set a target for visualization
                const billPercentage = Math.min((stats.averageBill / targetBill) * 100, 100)
                const billData = [
                  { name: 'Average', value: stats.averageBill, fill: '#06b6d4' },
                  { name: 'Potential', value: Math.max(targetBill - stats.averageBill, 0), fill: '#e5e7eb' }
                ]
                
                return (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={billData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                        >
                          {billData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name) => {
                            if (name === 'Average') {
                              return [`₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, "Average Bill"]
                            }
                            return null
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-600">₹{stats.averageBill.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                        <p className="text-xs text-muted-foreground mt-1">Per Order</p>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {billPercentage.toFixed(0)}% of target
                        </div>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Average per paid order
            </p>
          </CardContent>
        </Card>
      </div>

        {/* Benchmark Comparison Dashboard */}
        {restaurantSettings && restaurantSettings.restaurant_type && (
          <BenchmarkComparisonDashboard
            restaurantType={restaurantSettings.restaurant_type}
            actualMetrics={{
              // Calculate actual metrics from orders/payments
              // These are simplified - in production you'd calculate from actual cost data
              food_cost_percent: undefined, // Would need inventory/cost tracking
              staff_cost_percent: undefined, // Would need staff cost data
              marketing_percent: undefined, // Would need marketing spend data
              rent_percent: undefined, // Would need rent data
              delivery_ratio_percent: stats.totalRevenue > 0 
                ? (payments.filter(p => p.payment_method === 'upi' || p.payment_method === 'qr').reduce((sum, p) => sum + p.amount, 0) / stats.totalRevenue) * 100
                : undefined,
              profit_margin_percent: undefined // Would need cost data
            }}
          />
        )}

        <Tabs defaultValue="daily" className="w-full">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Export
              </Button>
              <Button variant="outline" size="sm">
                Print
              </Button>
            </div>
          </div>

          <TabsContent value="daily" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Revenue</CardTitle>
                <CardDescription>Revenue breakdown for the current week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {revenueData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Revenue"]} />
                        <Legend />
                        <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No revenue data available</p>
                        <p className="text-xs">Complete some paid orders to see revenue charts</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Revenue</CardTitle>
                <CardDescription>Revenue breakdown for the last 4 weeks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Revenue"]} />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>Revenue breakdown for the current year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Revenue"]} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="yearly" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Yearly Revenue</CardTitle>
                <CardDescription>Revenue breakdown for the last 5 years</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yearlyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Revenue"]} />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>Revenue by menu category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Revenue"]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No category data available</p>
                      <p className="text-xs">Add menu categories and complete orders to see category performance</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Selling Items</CardTitle>
              <CardDescription>Most popular menu items by quantity sold</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {topSellingItems.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={topSellingItems}
                      margin={{ top: 20, right: 20, bottom: 20, left: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="quantity" name="Quantity Sold" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No sales data available</p>
                      <p className="text-xs">Complete some paid orders to see top selling items</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      {/* AI Insights Dialog - Enhanced with Graphics */}
      {showAiInsights && (() => {
        const metrics = getBusinessMetrics()
        return (
          <Dialog open={showAiInsights} onOpenChange={setShowAiInsights}>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden p-0">
              <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-primary/10 to-secondary/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Bot className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <DialogTitle className="text-2xl font-bold">
                        Business Intelligence Report
                      </DialogTitle>
                      <DialogDescription className="text-base mt-1">
                        AI-Powered Strategic Insights & Analytics
                      </DialogDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {new Date().toLocaleDateString()}
                  </Badge>
                </div>
              </DialogHeader>
              
              <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-6 py-4">
                <div className="space-y-6">
                  {/* Key Metrics Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border-2 border-green-500/30 bg-green-500/5">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
                            <p className="text-2xl font-bold text-green-600">
                              ₹{metrics.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </p>
                          </div>
                          <DollarSign className="h-8 w-8 text-green-500/50" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-blue-500/30 bg-blue-500/5">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Total Orders</p>
                            <p className="text-2xl font-bold text-blue-600">{metrics.totalOrders}</p>
                          </div>
                          <ShoppingBag className="h-8 w-8 text-blue-500/50" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-purple-500/30 bg-purple-500/5">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Completed</p>
                            <p className="text-2xl font-bold text-purple-600">{metrics.completedOrders}</p>
                          </div>
                          <CheckCircle2 className="h-8 w-8 text-purple-500/50" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-amber-500/30 bg-amber-500/5">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Avg Order Value</p>
                            <p className="text-2xl font-bold text-amber-600">
                              ₹{metrics.averageOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </p>
                          </div>
                          <CreditCard className="h-8 w-8 text-amber-500/50" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Charts Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Top Selling Items Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Top Selling Items
                        </CardTitle>
                        <CardDescription>Most popular items by quantity sold</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[250px]">
                          {metrics.topItems.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                layout="vertical"
                                data={metrics.topItems}
                                margin={{ top: 5, right: 30, bottom: 5, left: 80 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={70} />
                                <Tooltip />
                                <Bar dataKey="quantity" fill="#10b981" radius={[0, 8, 8, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                              <p>No data available</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Category Performance Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Category Performance
                        </CardTitle>
                        <CardDescription>Revenue by menu category</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[250px]">
                          {metrics.categoryRevenue.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={metrics.categoryRevenue}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {metrics.categoryRevenue.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, "Revenue"]} />
                              </PieChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                              <p>No data available</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Payment Methods Chart */}
                    {metrics.paymentData.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Payment Methods
                          </CardTitle>
                          <CardDescription>Revenue breakdown by payment type</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={metrics.paymentData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {metrics.paymentData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, "Amount"]} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* AI Insights Text - Condensed */}
                  {aiInsights && (
                    <Card className="border-2 border-primary/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bot className="h-5 w-5" />
                          AI Strategic Insights
                        </CardTitle>
                        <CardDescription>Key recommendations and insights</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="max-h-[300px] overflow-y-auto prose prose-sm dark:prose-invert max-w-none">
                          <MarkdownRenderer content={aiInsights} />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
              
              <DialogFooter className="px-6 py-4 border-t bg-muted/30">
                <Button variant="outline" onClick={() => setShowAiInsights(false)}>
                  Close Report
                </Button>
                <Button 
                  onClick={handleGetAdminInsights} 
                  disabled={loadingInsights}
                  className="bg-primary hover:bg-primary/90"
                >
                  {loadingInsights ? (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Refresh Report
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )
      })()}
    </div>
  )
}
