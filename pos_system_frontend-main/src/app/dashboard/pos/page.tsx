"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ProductList } from "@/components/pos/product-list"
import { Cart } from "@/components/pos/cart"
import { PaymentModal } from "@/components/pos/payment-modal"
import { ReceiptPreview } from "@/components/pos/receipt-preview"
import { useStore, OrderItem } from "@/context/store-context"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

function POSPageContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const tableId = searchParams.get("tableId")
    const { tables, createOrder, updateOrder, orders, products, completeOrder } = useStore()

    const [cartItems, setCartItems] = useState<any[]>([])
    const [currentOrder, setCurrentOrder] = useState<any>(null)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [showReceipt, setShowReceipt] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState("")

    // Load existing order if table is occupied
    useEffect(() => {
        if (tableId) {
            const table = tables.find(t => t.id === tableId)
            if (table?.currentOrderId) {
                const order = orders.find(o => o.id === table.currentOrderId)
                if (order) {
                    setCurrentOrder(order)
                    // Map order items back to cart format
                    setCartItems(order.items.map(item => ({
                        id: parseInt(item.productId),
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity
                    })))
                }
            }
        }
    }, [tableId, tables, orders])

    const handleAddToCart = (product: any) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id)
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }
            return [...prev, { ...product, quantity: 1 }]
        })
    }

    const handleUpdateQuantity = (id: number, delta: number) => {
        setCartItems(prev => prev.map(item => {
            if (item.id === id) {
                const newQuantity = Math.max(0, item.quantity + delta)
                return { ...item, quantity: newQuantity }
            }
            return item
        }).filter(item => item.quantity > 0))
    }

    const handleRemoveItem = (id: number) => {
        setCartItems(prev => prev.filter(item => item.id !== id))
    }

    const handleSendToKitchen = () => {
        if (!tableId) {
            toast.error("No table selected")
            return
        }
        if (cartItems.length === 0) {
            toast.error("Cart is empty")
            return
        }

        const orderItems: OrderItem[] = cartItems.map(item => ({
            productId: item.id.toString(),
            name: item.name,
            price: item.price,
            quantity: item.quantity
        }))

        if (currentOrder) {
            updateOrder(currentOrder.id, orderItems)
            toast.success("Order updated")
        } else {
            createOrder(tableId, orderItems)
            toast.success("Order sent to kitchen")
        }
        router.push("/dashboard/tables")
    }

    const calculateTotal = () => {
        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        const tax = subtotal * 0.08 // 8% tax
        return { subtotal, tax, total: subtotal + tax }
    }

    const handleSettleBill = () => {
        if (!currentOrder) {
            toast.error("No active order to settle")
            return
        }
        setShowPaymentModal(true)
    }

    const handlePaymentComplete = (method: string, amountPaid: number) => {
        setPaymentMethod(method)
        if (currentOrder) {
            completeOrder(currentOrder.id)
        }
        setShowPaymentModal(false)
        setShowReceipt(true)
    }

    const handleReceiptClose = () => {
        setShowReceipt(false)
        toast.success("Bill settled! Receipt generated.")
        router.push("/dashboard/tables")
    }

    if (!tableId) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <h2 className="text-2xl font-bold">No Table Selected</h2>
                <p className="text-muted-foreground">Please select a table to start an order.</p>
                <Button onClick={() => router.push("/dashboard/tables")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tables
                </Button>
            </div>
        )
    }

    const table = tables.find(t => t.id === tableId)
    const { subtotal, tax, total } = calculateTotal()

    return (
        <>
            <div className="flex h-[calc(100vh-6rem)] gap-4">
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight">
                            Ordering for {table?.name || "Unknown Table"}
                        </h2>
                        <div className="space-x-2">
                            <Button variant="outline" onClick={() => router.push("/dashboard/tables")}>
                                Back to Tables
                            </Button>
                        </div>
                    </div>
                    <ProductList onAddToCart={handleAddToCart} />
                </div>
                <div className="w-[400px] flex-none flex flex-col">
                    <Cart
                        items={cartItems}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemove={handleRemoveItem}
                        onCheckout={handleSendToKitchen}
                    />
                    {currentOrder && (
                        <div className="mt-4">
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700"
                                size="lg"
                                onClick={handleSettleBill}
                            >
                                Settle Bill
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <PaymentModal
                open={showPaymentModal}
                onOpenChange={setShowPaymentModal}
                orderTotal={total}
                tax={tax}
                onPaymentComplete={handlePaymentComplete}
            />

            <ReceiptPreview
                open={showReceipt}
                onOpenChange={handleReceiptClose}
                items={cartItems}
                subtotal={subtotal}
                tax={tax}
                total={total}
                paymentMethod={paymentMethod}
                tableName={table?.name}
            />
        </>
    )
}

export default function POSPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-muted-foreground">Loading POS...</p>
            </div>
        }>
            <POSPageContent />
        </Suspense>
    )
}
