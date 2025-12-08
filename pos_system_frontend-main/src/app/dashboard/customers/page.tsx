"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, UserPlus, Mail, Phone, Calendar } from "lucide-react"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock Data
const INITIAL_CUSTOMERS = [
    { id: 1, name: "Alice Johnson", email: "alice@example.com", phone: "+1 555-0101", totalSpent: 1250.50, lastVisit: "2023-10-25", visits: 12 },
    { id: 2, name: "Bob Smith", email: "bob@example.com", phone: "+1 555-0102", totalSpent: 850.00, lastVisit: "2023-10-20", visits: 8 },
    { id: 3, name: "Charlie Brown", email: "charlie@example.com", phone: "+1 555-0103", totalSpent: 2100.75, lastVisit: "2023-10-28", visits: 25 },
    { id: 4, name: "Diana Prince", email: "diana@example.com", phone: "+1 555-0104", totalSpent: 350.25, lastVisit: "2023-10-15", visits: 3 },
    { id: 5, name: "Evan Wright", email: "evan@example.com", phone: "+1 555-0105", totalSpent: 150.00, lastVisit: "2023-10-05", visits: 2 },
    { id: 6, name: "Fiona Gallagher", email: "fiona@example.com", phone: "+1 555-0106", totalSpent: 5400.00, lastVisit: "2023-10-29", visits: 45 },
    { id: 7, name: "George Miller", email: "george@example.com", phone: "+1 555-0107", totalSpent: 95.50, lastVisit: "2023-09-30", visits: 1 },
]

export default function CustomersPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [customers, setCustomers] = useState(INITIAL_CUSTOMERS)

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
    )

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
                <div className="flex items-center space-x-2">
                    <Button>
                        <UserPlus className="mr-2 h-4 w-4" /> Add Customer
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Customer Directory</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center py-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search customers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[250px]">Customer</TableHead>
                                    <TableHead>Contact Info</TableHead>
                                    <TableHead>Total Spent</TableHead>
                                    <TableHead>Visits</TableHead>
                                    <TableHead className="text-right">Last Visit</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCustomers.length > 0 ? (
                                    filteredCustomers.map((customer) => (
                                        <TableRow key={customer.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center space-x-3">
                                                    <Avatar>
                                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.name}`} />
                                                        <AvatarFallback>{customer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-bold">{customer.name}</div>
                                                        <div className="text-xs text-muted-foreground">ID: #{customer.id}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col space-y-1 text-sm">
                                                    <div className="flex items-center text-muted-foreground">
                                                        <Mail className="mr-2 h-3 w-3" /> {customer.email}
                                                    </div>
                                                    <div className="flex items-center text-muted-foreground">
                                                        <Phone className="mr-2 h-3 w-3" /> {customer.phone}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>${customer.totalSpent.toFixed(2)}</TableCell>
                                            <TableCell>{customer.visits}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end text-muted-foreground">
                                                    <Calendar className="mr-2 h-3 w-3" /> {customer.lastVisit}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No customers found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
