"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { supabase, type Order, type OrderItem, type MenuItem, type MenuCategory } from "@/lib/supabase"
import { Clock, CheckCircle2, ChefHat, Utensils } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { AnimatePresence, motion } from "motion/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

export default function KitchenDashboard() {
  const { toast: toastHook } = useToast()

  // State
  const [orders, setOrders] = useState<Order[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState<Date>(new Date())

  const fetchData = async () => {
    // Don't show loading on subsequent fetches - just update data smoothly
    if (orders.length === 0 && orderItems.length === 0) {
      setLoading(true)
    }
    await Promise.all([fetchOrders(), fetchOrderItems(), fetchMenuItems(), fetchMenuCategories()])
    setLoading(false)
  }

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("name")

    if (error) {
      console.error("Error fetching menu items:", error)
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
      console.error("Error fetching menu categories:", error)
    } else {
      setMenuCategories(data || [])
    }
  }

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        tables (*)
      `)
      .in("status", ["pending", "preparing", "ready"])
      .order("created_at", { ascending: true })

    if (error) {
      toastHook({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      })
    } else {
      setOrders(data || [])
    }
  }

  const fetchOrderItems = async () => {
    const { data, error } = await supabase
      .from("order_items")
      .select(`
        *,
        menu_items (*)
      `)

    if (error) {
      toastHook({
        title: "Error",
        description: "Failed to fetch order items",
        variant: "destructive",
      })
    } else {
      setOrderItems(data || [])
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchData()

    // Set up real-time subscriptions
    const ordersSubscription = supabase
      .channel("kitchen-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        fetchOrders()
      })
      .subscribe()

    const orderItemsSubscription = supabase
      .channel("kitchen-order-items")
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, () => {
        fetchOrderItems()
      })
      .subscribe()

    const menuItemsSubscription = supabase
      .channel("kitchen-menu-items")
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_items" }, () => {
        fetchMenuItems()
      })
      .subscribe()

    // Update time every second
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000)

    return () => {
      supabase.removeChannel(ordersSubscription)
      supabase.removeChannel(orderItemsSubscription)
      supabase.removeChannel(menuItemsSubscription)
      clearInterval(timeInterval)
    }
  }, [])

  // Update order status
  const updateOrderStatus = async (orderId: number, status: "pending" | "preparing" | "ready" | "served") => {
    try {
      // Optimistically update the UI first for smooth animation
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status } : order
        )
      )

      const { error: orderError } = await supabase.from("orders").update({ status }).eq("id", orderId)

      if (orderError) {
        // Revert on error
        fetchData()
        throw orderError
      }

      // Update all items in the order to match the order status
      const { error: itemsError } = await supabase.from("order_items").update({ status }).eq("order_id", orderId)

      if (itemsError) {
        // Revert on error
        fetchData()
        throw itemsError
      }

      toast.success(`Order #${orderId} marked as ${status}`)
      // Only fetch if there's a mismatch (shouldn't happen, but safety)
      setTimeout(() => fetchData(), 500)
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Failed to update order status")
    }
  }

  // Get order items for a specific order
  const getOrderItems = (orderId: number) => {
    return orderItems.filter((item) => item.order_id === orderId)
  }

  // Get elapsed time in minutes
  const getElapsedTime = (startTime: string) => {
    const start = new Date(startTime)
    const diff = Math.floor((currentTime.getTime() - start.getTime()) / 1000 / 60)
    return `${diff}m`
  }

  // Toggle menu item availability
  const toggleMenuItemAvailability = async (itemId: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("menu_items")
        .update({ is_available: !currentStatus })
        .eq("id", itemId)

      if (error) throw error

      // Optimistically update UI
      setMenuItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, is_available: !currentStatus } : item
        )
      )

      toast.success(`${!currentStatus ? "Enabled" : "Disabled"} menu item`)
    } catch (error) {
      console.error("Error toggling menu item availability:", error)
      toast.error("Failed to update menu item availability")
      fetchMenuItems() // Revert on error
    }
  }

  // Filter orders by status
  const pendingOrders = orders.filter((o) => o.status === "pending")
  const preparingOrders = orders.filter((o) => o.status === "preparing")
  const readyOrders = orders.filter((o) => o.status === "ready")

  // Show skeleton loaders instead of blocking spinner
  if (loading) {
    return (
      <div className="space-y-4 h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight flex items-center">
            <ChefHat className="mr-3 h-8 w-8" />
            Kitchen Display
          </h2>
          <div className="text-xl font-mono font-bold">
            {currentTime.toLocaleTimeString()}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
          {[1, 2, 3].map((col) => (
            <div key={col} className="flex flex-col bg-muted/30 rounded-lg p-4 border">
              <div className="h-6 bg-muted rounded mb-4 w-32 animate-pulse"></div>
              <div className="space-y-4 flex-1">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-card rounded-lg p-4 border animate-pulse">
                    <div className="h-6 bg-muted rounded mb-2 w-24"></div>
                    <div className="h-4 bg-muted rounded mb-4 w-16"></div>
                    <div className="space-y-2 mb-4">
                      <div className="h-4 bg-muted rounded w-full"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </div>
                    <div className="h-9 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight flex items-center">
          <ChefHat className="mr-3 h-8 w-8" />
          Kitchen Display
        </h2>
        <div className="text-xl font-mono font-bold">
          {currentTime.toLocaleTimeString()}
        </div>
      </div>

      <Tabs defaultValue="orders" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mb-4">
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ChefHat className="h-4 w-4" /> Orders
          </TabsTrigger>
          <TabsTrigger value="menu" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" /> Menu Availability
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="flex-1 overflow-hidden mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Pending Column */}
        <div className="flex flex-col bg-muted/30 rounded-lg p-4 border">
          <h3 className="font-semibold mb-4 flex items-center text-yellow-600">
            <Clock className="mr-2 h-5 w-5" /> Pending ({pendingOrders.length})
          </h3>
          <div className="space-y-4 overflow-y-auto flex-1">
            <AnimatePresence mode="popLayout">
              {pendingOrders.map((order) => {
                const items = getOrderItems(order.id)
                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: -100 }}
                    transition={{ 
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                  >
                    <OrderCard
                      order={order}
                      items={items}
                      getElapsedTime={getElapsedTime}
                      onAction={() => updateOrderStatus(order.id, "preparing")}
                      actionLabel="Start Preparing"
                    />
                  </motion.div>
                )
              })}
            </AnimatePresence>
            {pendingOrders.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-muted-foreground text-sm"
              >
                No pending orders
              </motion.div>
            )}
          </div>
        </div>

        {/* Preparing Column */}
        <div className="flex flex-col bg-muted/30 rounded-lg p-4 border">
          <h3 className="font-semibold mb-4 flex items-center text-blue-600">
            <ChefHat className="mr-2 h-5 w-5" /> Preparing ({preparingOrders.length})
          </h3>
          <div className="space-y-4 overflow-y-auto flex-1">
            <AnimatePresence mode="popLayout">
              {preparingOrders.map((order) => {
                const items = getOrderItems(order.id)
                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: 0 }}
                    transition={{ 
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                  >
                    <OrderCard
                      order={order}
                      items={items}
                      getElapsedTime={getElapsedTime}
                      onAction={() => updateOrderStatus(order.id, "ready")}
                      actionLabel="Mark Ready"
                    />
                  </motion.div>
                )
              })}
            </AnimatePresence>
            {preparingOrders.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-muted-foreground text-sm"
              >
                No orders in preparation
              </motion.div>
            )}
          </div>
        </div>

        {/* Ready Column */}
        <div className="flex flex-col bg-muted/30 rounded-lg p-4 border">
          <h3 className="font-semibold mb-4 flex items-center text-green-600">
            <CheckCircle2 className="mr-2 h-5 w-5" /> Ready ({readyOrders.length})
          </h3>
          <div className="space-y-4 overflow-y-auto flex-1">
            <AnimatePresence mode="popLayout">
              {readyOrders.map((order) => {
                const items = getOrderItems(order.id)
                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: 100 }}
                    transition={{ 
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                  >
                    <OrderCard
                      order={order}
                      items={items}
                      getElapsedTime={getElapsedTime}
                      onAction={() => updateOrderStatus(order.id, "served")}
                      actionLabel="Serve"
                    />
                  </motion.div>
                )
              })}
            </AnimatePresence>
            {readyOrders.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-muted-foreground text-sm"
              >
                No ready orders
              </motion.div>
            )}
          </div>
        </div>
      </div>
        </TabsContent>

        <TabsContent value="menu" className="flex-1 overflow-hidden mt-0">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Menu Item Availability</CardTitle>
              <CardDescription>Toggle menu items on/off for ordering</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <Tabs defaultValue={menuCategories[0]?.name || "All"} className="w-full">
                <TabsList className="mb-4 w-full flex-wrap h-auto gap-1 p-1 bg-muted">
                  {menuCategories.map((category) => (
                    <TabsTrigger
                      key={category.id}
                      value={category.name}
                      className="text-sm px-3 py-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
                    >
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {menuCategories.map((category) => (
                  <TabsContent key={category.id} value={category.name} className="mt-0">
                    <div className="space-y-2">
                      {menuItems
                        .filter((item) => item.category_id === category.id)
                        .map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">₹{item.price.toFixed(2)}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant={item.is_available ? "default" : "secondary"}>
                                {item.is_available ? "Available" : "Unavailable"}
                              </Badge>
                              <Switch
                                checked={item.is_available}
                                onCheckedChange={() => toggleMenuItemAvailability(item.id, item.is_available)}
                              />
                            </div>
                          </div>
                        ))}
                      {menuItems.filter((item) => item.category_id === category.id).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          No items in this category
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function OrderCard({
  order,
  items,
  getElapsedTime,
  onAction,
  actionLabel,
}: {
  order: Order
  items: OrderItem[]
  getElapsedTime: (d: string) => string
  onAction: () => void
  actionLabel: string
}) {
  const elapsedMinutes = parseInt(getElapsedTime(order.created_at))
  const isUrgent = elapsedMinutes > 20

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
          <div className="font-bold text-lg">Table {order.tables?.number || "N/A"}</div>
          <Badge variant={isUrgent ? "destructive" : "secondary"}>
            {getElapsedTime(order.created_at)}
          </Badge>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="text-xs text-muted-foreground mb-2">Order #{order.id}</div>
          <div className="space-y-1 mb-4">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex justify-between text-sm"
              >
                <span>{item.menu_items?.name || "Unknown Item"}</span>
                <span className="font-bold">x{item.quantity}</span>
              </motion.div>
            ))}
            {items.length === 0 && (
              <div className="text-xs text-muted-foreground">No items</div>
            )}
          </div>
          <Button className="w-full" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
