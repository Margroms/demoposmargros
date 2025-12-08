"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { useState } from "react"
import { Moon, Sun, Store, Receipt, Bell } from "lucide-react"
import { useTheme } from "next-themes"

export default function SettingsPage() {
    const { setTheme } = useTheme()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="store">Store Profile</TabsTrigger>
                    <TabsTrigger value="receipt">Receipt</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>
                                Customize the look and feel of the application.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="theme" className="flex flex-col space-y-1">
                                    <span>Theme Mode</span>
                                    <span className="font-normal text-xs text-muted-foreground">
                                        Select your preferred theme for the dashboard.
                                    </span>
                                </Label>
                                <div className="flex items-center space-x-2">
                                    <Button variant="outline" size="icon" onClick={() => setTheme("light")}>
                                        <Sun className="h-[1.2rem] w-[1.2rem]" />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => setTheme("dark")}>
                                        <Moon className="h-[1.2rem] w-[1.2rem]" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Notifications</CardTitle>
                            <CardDescription>
                                Configure how you receive alerts.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="order-alerts" className="flex flex-col space-y-1">
                                    <span>Order Alerts</span>
                                    <span className="font-normal text-xs text-muted-foreground">
                                        Receive notifications for new orders.
                                    </span>
                                </Label>
                                <Switch id="order-alerts" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="stock-alerts" className="flex flex-col space-y-1">
                                    <span>Low Stock Alerts</span>
                                    <span className="font-normal text-xs text-muted-foreground">
                                        Get notified when inventory is low.
                                    </span>
                                </Label>
                                <Switch id="stock-alerts" defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="store" className="space-y-4">
                    <StoreProfileForm />
                </TabsContent>

                <TabsContent value="receipt" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Receipt Configuration</CardTitle>
                            <CardDescription>Customize your printed receipts.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="header">Header Text</Label>
                                <Input id="header" placeholder="Thank you for visiting!" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="footer">Footer Text</Label>
                                <Input id="footer" placeholder="Visit us again soon." />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => toast.success("Receipt settings saved")}>Save Changes</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function StoreProfileForm() {
    const [loading, setLoading] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            toast.success("Store profile updated")
        }, 1000)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Store Profile</CardTitle>
                <CardDescription>
                    Manage your business details.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="storeName">Store Name</Label>
                        <Input id="storeName" defaultValue="Billez Store" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Contact Email</Label>
                        <Input id="email" type="email" defaultValue="contact@billez.com" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" defaultValue="+1 234 567 890" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" defaultValue="123 Main St, City, Country" />
                    </div>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
