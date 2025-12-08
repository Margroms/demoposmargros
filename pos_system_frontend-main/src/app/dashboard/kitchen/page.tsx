"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle2, ChefHat } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useStore, Order, OrderStatus } from "@/context/store-context"

export default function KitchenPage() {
    const { orders, updateOrderStatus } = useStore()
    const [currentTime, setCurrentTime] = useState<Date | null>(null)

    useEffect(() => {
        setCurrentTime(new Date())
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const getElapsedTime = (startTime: Date) => {
        if (!currentTime) return "0m"
        const start = new Date(startTime)
        const diff = Math.floor((currentTime.getTime() - start.getTime()) / 1000 / 60)
        return `${diff}m`
    }

    const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
        updateOrderStatus(orderId, newStatus)
        toast.success(`Order ${orderId} marked as ${newStatus}`)
    }

    const activeOrders = orders.filter(o => o.status !== "completed")

    return (
        <div className="space-y-4 h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight flex items-center">
                    <ChefHat className="mr-3 h-8 w-8" />
                    Kitchen Display System
                </h2>
                <div className="text-xl font-mono font-bold">
                    {currentTime ? currentTime.toLocaleTimeString() : "Loading..."}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
                {/* Pending Column */}
                <div className="flex flex-col bg-muted/30 rounded-lg p-4 border">
                    <h3 className="font-semibold mb-4 flex items-center text-yellow-600">
                        <Clock className="mr-2 h-5 w-5" /> Pending ({activeOrders.filter(o => o.status === "pending").length})
                    </h3>
                    <div className="space-y-4 overflow-y-auto flex-1">
                        <AnimatePresence>
                            {activeOrders.filter(o => o.status === "pending").map(order => (
                                <OrderCard key={order.id} order={order} getElapsedTime={getElapsedTime} onAction={() => handleUpdateStatus(order.id, "preparing")} actionLabel="Start Preparing" />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Preparing Column */}
                <div className="flex flex-col bg-muted/30 rounded-lg p-4 border">
                    <h3 className="font-semibold mb-4 flex items-center text-blue-600">
                        <ChefHat className="mr-2 h-5 w-5" /> Preparing ({activeOrders.filter(o => o.status === "preparing").length})
                    </h3>
                    <div className="space-y-4 overflow-y-auto flex-1">
                        <AnimatePresence>
                            {activeOrders.filter(o => o.status === "preparing").map(order => (
                                <OrderCard key={order.id} order={order} getElapsedTime={getElapsedTime} onAction={() => handleUpdateStatus(order.id, "ready")} actionLabel="Mark Ready" />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Ready Column */}
                <div className="flex flex-col bg-muted/30 rounded-lg p-4 border">
                    <h3 className="font-semibold mb-4 flex items-center text-green-600">
                        <CheckCircle2 className="mr-2 h-5 w-5" /> Ready ({activeOrders.filter(o => o.status === "ready").length})
                    </h3>
                    <div className="space-y-4 overflow-y-auto flex-1">
                        <AnimatePresence>
                            {activeOrders.filter(o => o.status === "ready").map(order => (
                                <OrderCard key={order.id} order={order} getElapsedTime={getElapsedTime} onAction={() => {
                                    // In KDS, "clearing" usually means it's served.
                                    // We won't complete the order here, just remove from KDS view if needed, 
                                    // but for now let's keep it until paid.
                                    // Or maybe we introduce a "served" status. 
                                    // For simplicity, let's say "Clear" here just hides it from KDS or marks served.
                                    // Let's assume "Ready" is the final KDS state before pickup.
                                    // But to clear the board, let's just mark it completed for now or have a separate Served state?
                                    // The prompt said "Settle Bill" clears the table.
                                    // Let's make this button just a visual "Served" which might not change global status if we want billing to persist.
                                    // Actually, let's just leave it as Ready.
                                    // Wait, the user wants "Table -> POS -> Bill".
                                    // So KDS is just for prep.
                                    // Let's make the action here "Serve" which updates status to "completed" (served)?
                                    // But then billing needs it.
                                    // Let's add a "served" status to context?
                                    // For now, let's just toast "Order Served" and maybe keep it in Ready or move to a history?
                                    // Let's just keep it simple: Ready orders stay until paid?
                                    // Or maybe we can "Complete" it here too?
                                    // Let's make it "Serve" -> effectively removes from KDS but keeps for billing?
                                    // I'll just make it a toast for now to avoid breaking billing flow.
                                    toast.success("Order served to table")
                                }} actionLabel="Serve" />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}

function OrderCard({ order, getElapsedTime, onAction, actionLabel }: { order: Order, getElapsedTime: (d: Date) => string, onAction: () => void, actionLabel: string }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="border-l-4 border-l-primary shadow-sm">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                    <div className="font-bold text-lg">{order.tableName}</div>
                    <Badge variant={parseInt(getElapsedTime(order.startTime)) > 20 ? "destructive" : "secondary"}>
                        {getElapsedTime(order.startTime)}
                    </Badge>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                    <div className="text-xs text-muted-foreground mb-2">{order.id}</div>
                    <div className="space-y-1 mb-4">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span>{item.name}</span>
                                <span className="font-bold">x{item.quantity}</span>
                            </div>
                        ))}
                    </div>
                    <Button className="w-full" size="sm" onClick={onAction}>
                        {actionLabel}
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    )
}
