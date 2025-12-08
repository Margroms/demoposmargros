"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Trash2, Plus, Minus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface CartItem {
    id: number
    name: string
    price: number
    quantity: number
}

interface CartProps {
    items: CartItem[]
    onUpdateQuantity: (id: number, delta: number) => void
    onRemove: (id: number) => void
    onCheckout: () => void
}

export function Cart({ items, onUpdateQuantity, onRemove, onCheckout }: CartProps) {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const tax = total * 0.1 // 10% tax example
    const finalTotal = total + tax

    return (
        <div className="h-full flex flex-col bg-card border rounded-lg shadow-sm">
            <div className="p-4 border-b">
                <h3 className="font-semibold text-lg">Current Order</h3>
                <p className="text-sm text-muted-foreground">{items.length} items</p>
            </div>

            <ScrollArea className="flex-1 p-4">
                {items.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                        Cart is empty
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence initial={false}>
                            {items.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ opacity: { duration: 0.2 }, height: { duration: 0.3 } }}
                                    className="flex items-center justify-between overflow-hidden"
                                >
                                    <div className="flex-1 py-1">
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-sm text-muted-foreground">${item.price.toFixed(2)}</div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => onUpdateQuantity(item.id, -1)}
                                        >
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-6 text-center">{item.quantity}</span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => onUpdateQuantity(item.id, 1)}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500 hover:text-red-600"
                                            onClick={() => onRemove(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </ScrollArea>

            <div className="p-4 border-t bg-muted/50 space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Tax (10%)</span>
                        <span>${tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>${finalTotal.toFixed(2)}</span>
                    </div>
                </div>
                <Button className="w-full size-lg" size="lg" onClick={onCheckout} disabled={items.length === 0}>
                    Charge ${finalTotal.toFixed(2)}
                </Button>
            </div>
        </div>
    )
}
