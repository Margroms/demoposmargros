"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"

// Mock data
const PRODUCTS = [
    { id: 1, name: "Milk", price: 2.50, category: "Dairy", image: "🥛" },
    { id: 2, name: "Bread", price: 1.80, category: "Bakery", image: "🍞" },
    { id: 3, name: "Eggs", price: 3.20, category: "Dairy", image: "🥚" },
    { id: 4, name: "Apples", price: 0.50, category: "Produce", image: "🍎" },
    { id: 5, name: "Chicken", price: 8.00, category: "Meat", image: "🍗" },
    { id: 6, name: "Rice", price: 5.00, category: "Grains", image: "🍚" },
    { id: 7, name: "Tomato", price: 0.30, category: "Produce", image: "🍅" },
    { id: 8, name: "Cheese", price: 4.50, category: "Dairy", image: "🧀" },
]

interface ProductListProps {
    onAddToCart: (product: any) => void
}

export function ProductList({ onAddToCart }: ProductListProps) {
    const [search, setSearch] = useState("")
    const [category, setCategory] = useState("All")

    const filteredProducts = PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) &&
        (category === "All" || p.category === category)
    )

    const categories = ["All", ...Array.from(new Set(PRODUCTS.map(p => p.category)))]

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex space-x-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-2">
                {categories.map(c => (
                    <Button
                        key={c}
                        variant={category === c ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCategory(c)}
                    >
                        {c}
                    </Button>
                ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-20">
                {filteredProducts.map((product) => (
                    <motion.div
                        key={product.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card
                            className="cursor-pointer hover:bg-accent transition-colors h-full"
                            onClick={() => onAddToCart(product)}
                        >
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2 h-full">
                                <div className="text-4xl mb-2">{product.image}</div>
                                <div className="font-medium leading-tight">{product.name}</div>
                                <div className="text-sm text-muted-foreground">${product.price.toFixed(2)}</div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
