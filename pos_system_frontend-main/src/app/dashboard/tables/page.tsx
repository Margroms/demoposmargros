"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Users, Armchair } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useStore, Table } from "@/context/store-context"

export default function TablesPage() {
    const { tables, addTable } = useStore()
    const [newTableName, setNewTableName] = useState("")
    const [newTableSeats, setNewTableSeats] = useState("4")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const router = useRouter()

    const handleAddTable = () => {
        if (newTableName) {
            addTable(newTableName, parseInt(newTableSeats))
            setNewTableName("")
            setNewTableSeats("4")
            setIsDialogOpen(false)
        }
    }

    const handleTableClick = (tableId: string) => {
        router.push(`/dashboard/pos?tableId=${tableId}`)
    }

    const getStatusColor = (status: Table["status"]) => {
        switch (status) {
            case "available": return "bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400"
            case "occupied": return "bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-400"
            case "reserved": return "bg-yellow-500/10 border-yellow-500/50 text-yellow-700 dark:text-yellow-400"
            default: return "bg-muted border-muted-foreground/20"
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Table Management</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Table
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Table</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={newTableName}
                                    onChange={(e) => setNewTableName(e.target.value)}
                                    className="col-span-3"
                                    placeholder="e.g. T-12"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="seats" className="text-right">
                                    Seats
                                </Label>
                                <Input
                                    id="seats"
                                    type="number"
                                    value={newTableSeats}
                                    onChange={(e) => setNewTableSeats(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddTable}>Save Table</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {tables.map((table) => (
                    <motion.div
                        key={table.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => handleTableClick(table.id)}
                        className="cursor-pointer"
                    >
                        <Card className={`border-2 transition-colors ${getStatusColor(table.status)}`}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xl font-bold">{table.name}</CardTitle>
                                <Armchair className="h-5 w-5 opacity-50" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-2 text-sm font-medium opacity-80 mb-2">
                                    <Users className="h-4 w-4" />
                                    <span>{table.seats} Seats</span>
                                </div>
                                <div className="text-xs uppercase font-bold tracking-wider opacity-70">
                                    {table.status}
                                </div>
                                {table.currentOrderId && (
                                    <div className="mt-2 text-xs bg-background/50 p-1 rounded text-center">
                                        Order Active
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
