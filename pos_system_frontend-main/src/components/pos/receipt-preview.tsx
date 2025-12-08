"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Printer } from "lucide-react"

interface ReceiptItem {
    name: string
    quantity: number
    price: number
}

interface ReceiptPreviewProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    items: ReceiptItem[]
    subtotal: number
    tax: number
    total: number
    paymentMethod: string
    tableName?: string
}

export function ReceiptPreview({
    open,
    onOpenChange,
    items,
    subtotal,
    tax,
    total,
    paymentMethod,
    tableName
}: ReceiptPreviewProps) {
    const handlePrint = () => {
        window.print()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] print:shadow-none">
                <DialogHeader>
                    <DialogTitle className="text-center">Receipt</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4 print:text-black" id="receipt-content">
                    {/* Store Header */}
                    <div className="text-center space-y-1">
                        <h2 className="text-2xl font-bold">Billez POS</h2>
                        <p className="text-sm text-muted-foreground print:text-gray-600">123 Main Street, City</p>
                        <p className="text-sm text-muted-foreground print:text-gray-600">Phone: (555) 123-4567</p>
                    </div>

                    <Separator />

                    {/* Order Details */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground print:text-gray-600">Date:</span>
                            <span>{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground print:text-gray-600">Time:</span>
                            <span>{new Date().toLocaleTimeString()}</span>
                        </div>
                        {tableName && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground print:text-gray-600">Table:</span>
                                <span className="font-medium">{tableName}</span>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Items */}
                    <div className="space-y-2">
                        {items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                                <div className="flex-1">
                                    <div>{item.name}</div>
                                    <div className="text-muted-foreground print:text-gray-600">
                                        {item.quantity} x ${item.price.toFixed(2)}
                                    </div>
                                </div>
                                <div className="font-medium">
                                    ${(item.quantity * item.price).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <Separator />

                    {/* Totals */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground print:text-gray-600">Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground print:text-gray-600">Tax</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>

                    <Separator />

                    {/* Payment Method */}
                    <div className="text-center space-y-1">
                        <p className="text-sm text-muted-foreground print:text-gray-600">
                            Payment Method: <span className="font-medium text-foreground print:text-black capitalize">{paymentMethod}</span>
                        </p>
                        <p className="text-xs text-muted-foreground print:text-gray-600 mt-4">
                            Thank you for your business!
                        </p>
                    </div>
                </div>

                <div className="print:hidden">
                    <Button onClick={handlePrint} className="w-full">
                        <Printer className="mr-2 h-4 w-4" /> Print Receipt
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
