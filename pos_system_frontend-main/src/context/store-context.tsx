"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { toast } from "sonner"

// Types
export type TableStatus = "available" | "occupied" | "reserved"

export interface Table {
    id: string
    name: string
    seats: number
    status: TableStatus
    currentOrderId?: string
}

export interface Product {
    id: string
    name: string
    price: number
    category: string
    stock: number
}

export interface OrderItem {
    productId: string
    name: string
    price: number
    quantity: number
}

export type OrderStatus = "pending" | "preparing" | "ready" | "completed"

export interface Order {
    id: string
    tableId: string
    tableName: string
    items: OrderItem[]
    status: OrderStatus
    startTime: Date
    totalAmount: number
}

interface StoreContextType {
    tables: Table[]
    orders: Order[]
    products: Product[]
    addTable: (name: string, seats: number) => void
    updateTableStatus: (tableId: string, status: TableStatus) => void
    createOrder: (tableId: string, items: OrderItem[]) => string
    updateOrder: (orderId: string, items: OrderItem[]) => void
    updateOrderStatus: (orderId: string, status: OrderStatus) => void
    completeOrder: (orderId: string) => void
    getProduct: (productId: string) => Product | undefined
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

// Mock Data
const INITIAL_TABLES: Table[] = [
    { id: "T1", name: "Table 1", seats: 4, status: "available" },
    { id: "T2", name: "Table 2", seats: 2, status: "occupied", currentOrderId: "ORD-001" },
    { id: "T3", name: "Table 3", seats: 6, status: "reserved" },
    { id: "T4", name: "Table 4", seats: 4, status: "available" },
    { id: "T5", name: "Table 5", seats: 2, status: "available" },
    { id: "T6", name: "Table 6", seats: 8, status: "available" },
]

const INITIAL_PRODUCTS: Product[] = [
    { id: "1", name: "Milk", price: 2.50, category: "Dairy", stock: 50 },
    { id: "2", name: "Bread", price: 1.50, category: "Bakery", stock: 30 },
    { id: "3", name: "Eggs", price: 3.00, category: "Dairy", stock: 40 },
    { id: "4", name: "Cheese", price: 5.00, category: "Dairy", stock: 20 },
    { id: "5", name: "Croissant", price: 2.00, category: "Bakery", stock: 25 },
    { id: "6", name: "Coffee", price: 3.50, category: "Beverages", stock: 100 },
    { id: "7", name: "Tea", price: 2.50, category: "Beverages", stock: 100 },
    { id: "8", name: "Cake", price: 4.00, category: "Bakery", stock: 15 },
]

const INITIAL_ORDERS: Order[] = [
    {
        id: "ORD-001",
        tableId: "T2",
        tableName: "Table 2",
        items: [{ productId: "6", name: "Coffee", price: 3.50, quantity: 2 }],
        status: "preparing",
        startTime: new Date(),
        totalAmount: 7.00
    }
]

export function StoreProvider({ children }: { children: React.ReactNode }) {
    const [tables, setTables] = useState<Table[]>(INITIAL_TABLES)
    const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS)
    const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS)
    const [isInitialized, setIsInitialized] = useState(false)

    // Load from localStorage on mount
    useEffect(() => {
        const savedTables = localStorage.getItem("billez_tables")
        const savedOrders = localStorage.getItem("billez_orders")

        if (savedTables) setTables(JSON.parse(savedTables))
        if (savedOrders) setOrders(JSON.parse(savedOrders))
        setIsInitialized(true)
    }, [])

    // Save to localStorage on change
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem("billez_tables", JSON.stringify(tables))
            localStorage.setItem("billez_orders", JSON.stringify(orders))
        }
    }, [tables, orders, isInitialized])

    const addTable = (name: string, seats: number) => {
        const newTable: Table = {
            id: `T${tables.length + 1}`,
            name,
            seats,
            status: "available"
        }
        setTables([...tables, newTable])
        toast.success("Table added successfully")
    }

    const updateTableStatus = (tableId: string, status: TableStatus) => {
        setTables(tables.map(t => t.id === tableId ? { ...t, status } : t))
    }

    const createOrder = (tableId: string, items: OrderItem[]) => {
        const table = tables.find(t => t.id === tableId)
        if (!table) throw new Error("Table not found")

        const newOrder: Order = {
            id: `ORD-${Math.floor(Math.random() * 10000)}`,
            tableId,
            tableName: table.name,
            items,
            status: "pending",
            startTime: new Date(),
            totalAmount: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        }

        setOrders([...orders, newOrder])

        // Update table to occupied and link order
        setTables(tables.map(t =>
            t.id === tableId
                ? { ...t, status: "occupied", currentOrderId: newOrder.id }
                : t
        ))

        return newOrder.id
    }

    const updateOrder = (orderId: string, items: OrderItem[]) => {
        setOrders(orders.map(o => {
            if (o.id === orderId) {
                return {
                    ...o,
                    items,
                    totalAmount: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                }
            }
            return o
        }))
    }

    const updateOrderStatus = (orderId: string, status: OrderStatus) => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o))
    }

    const completeOrder = (orderId: string) => {
        const order = orders.find(o => o.id === orderId)
        if (order) {
            // Update order status
            updateOrderStatus(orderId, "completed")
            // Free the table
            setTables(tables.map(t =>
                t.id === order.tableId
                    ? { ...t, status: "available", currentOrderId: undefined }
                    : t
            ))
        }
    }

    const getProduct = (productId: string) => products.find(p => p.id === productId)

    return (
        <StoreContext.Provider value={{
            tables,
            orders,
            products,
            addTable,
            updateTableStatus,
            createOrder,
            updateOrder,
            updateOrderStatus,
            completeOrder,
            getProduct
        }}>
            {children}
        </StoreContext.Provider>
    )
}

export function useStore() {
    const context = useContext(StoreContext)
    if (context === undefined) {
        throw new Error("useStore must be used within a StoreProvider")
    }
    return context
}
