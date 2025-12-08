"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CreditCard, Banknote, Smartphone, Printer } from "lucide-react"
import { useState } from "react"
import { Separator } from "@/components/ui/separator"

interface PaymentModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    orderTotal: number
    tax: number
    onPaymentComplete: (paymentMethod: string, amountPaid: number) => void
}

export function PaymentModal({ open, onOpenChange, orderTotal, tax, onPaymentComplete }: PaymentModalProps) {
    const [paymentMethod, setPaymentMethod] = useState<string>("cash")
    const [amountPaid, setAmountPaid] = useState<string>(orderTotal.toFixed(2))

    const subtotal = orderTotal - tax
    const change = parseFloat(amountPaid) - orderTotal

    const handleConfirmPayment = () => {
        onPaymentComplete(paymentMethod, parseFloat(amountPaid))
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Complete Payment</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Order Summary */}
                    <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-medium">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax</span>
                            <span className="font-medium">${tax.toFixed(2)}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>${orderTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="space-y-3">
                        <Label className="text-base">Payment Method</Label>
                        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                            <div className="flex items-center space-x-3 border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition">
                                <RadioGroupItem value="cash" id="cash" />
                                <Label htmlFor="cash" className="flex items-center space-x-2 cursor-pointer flex-1">
                                    <Banknote className="h-5 w-5 text-green-600" />
                                    <span>Cash</span>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-3 border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition">
                                <RadioGroupItem value="card" id="card" />
                                <Label htmlFor="card" className="flex items-center space-x-2 cursor-pointer flex-1">
                                    <CreditCard className="h-5 w-5 text-blue-600" />
                                    <span>Card</span>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-3 border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition">
                                <RadioGroupItem value="upi" id="upi" />
                                <Label htmlFor="upi" className="flex items-center space-x-2 cursor-pointer flex-1">
                                    <Smartphone className="h-5 w-5 text-purple-600" />
                                    <span>UPI</span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Amount Input (for cash) */}
                    {paymentMethod === "cash" && (
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount Received</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                value={amountPaid}
                                onChange={(e) => setAmountPaid(e.target.value)}
                                className="text-lg"
                            />
                            {change >= 0 && (
                                <p className="text-sm text-muted-foreground">
                                    Change: <span className="font-bold text-foreground">${change.toFixed(2)}</span>
                                </p>
                            )}
                            {change < 0 && (
                                <p className="text-sm text-destructive">
                                    Insufficient amount
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmPayment}
                        disabled={paymentMethod === "cash" && change < 0}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        Confirm Payment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
