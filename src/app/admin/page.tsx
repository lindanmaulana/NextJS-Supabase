"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import supabase from "@/lib/db";
import { IMenu } from "@/types/menu";
import { Ellipsis } from "lucide-react";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

const AdminPage = () => {
    const [menus, setMenus] = useState<IMenu[] | []>([]);
    const [createDialog, setCreateDialog] = useState<boolean>(false)
    const [selectedMenu, setSelectedMenu] = useState<{menu: IMenu, action: "edit" | "delete"} | null>(null)

    const fetchMenu = async () => {
        try {
            const response = await fetch("/api/v1/products", {
                method: "GET"
            })

            const result = await response.json()

            if(!result.data) throw new Error(result.error)

            setMenus(result.data)
            return result.data
        } catch (err) {
            let errorMessage = "An unexpected error occurred!"

            if(err instanceof Error) {
                errorMessage = err.message
            }

            toast(errorMessage)
        }
    }

    useEffect(() => {
        const loadDataProducts = async () => {
            const data = await fetchMenu()

            setMenus(data)
        }

        loadDataProducts()
    }, []);

    if (menus.length < 1) return <p>Loading...</p>;

    const handleAddMenu = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData)


        try {
            const response = await fetch("/api/v1/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })

            const result = await response.json()

            if(!result.data) throw new Error(result.error)

            await fetchMenu()
            toast("Menu added successfully")

            setCreateDialog(false)
        } catch (err) {
            console.log({err})
        }
    }

    const handleDeleteMenu = async (id?: number) => {
        if(!id) return;

         try {
            const response = await fetch(`/api/v1/products/${id}`, {
                method: "DELETE"
            })
            const result = await response.json()

            if(result.error) {
                throw new Error(result.error)
            }
            else setMenus((prev) => prev.filter(menu => menu.id !== selectedMenu?.menu.id))

            toast("Menu deleted successfully")
            setSelectedMenu(null)
        } catch (err) {
            console.log(err)
        }
    }
    
    return (
        <div className="container max-w-6xl mx-auto py-8">
            <div className="mb-4 w-full flex items-center justify-between">
                <div className="text-3xl font-bold">Menu</div>
                <Dialog open={createDialog} onOpenChange={setCreateDialog}>
                    <DialogTrigger asChild>
                        <Button className="font-bold">Add Menu</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <form onSubmit={handleAddMenu} className="space-y-4">
                            <DialogHeader>
                                <DialogTitle>Add Menu</DialogTitle>
                                <DialogDescription>Create a new menu by insert data in this form</DialogDescription>
                            </DialogHeader>

                            <div className="w-full grid gap-4">
                                <div className="w-full grid gap-1.5">
                                    <Label htmlFor="name">Name</Label>
                                    <Input type="text" id="name" name="name" placeholder="Insert name" required />
                                </div>
                                <div className="w-full grid gap-1.5">
                                    <Label htmlFor="category">Category</Label>
                                    <Select name="category">
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Category</SelectLabel>
                                                <SelectItem value="coffe">Coffee</SelectItem>
                                                <SelectItem value="noncoffe">Non Coffee</SelectItem>
                                                <SelectItem value="food">Food</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-full grid gap-1.5">
                                    <Label htmlFor="price">Price</Label>
                                    <Input type="number" id="price" name="price" placeholder="Insert price" required />
                                </div>
                                <div className="w-full grid gap-1.5">
                                    <Label htmlFor="image">Image</Label>
                                    <Textarea id="image" name="image" placeholder="Insert name" required></Textarea>
                                </div>
                                <div className="w-full grid gap-1.5">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea id="description" name="description" placeholder="Insert name" className="resize-none" required></Textarea>
                                </div>
                            </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant={'secondary'} className="cursor-pointer">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" className="cursor-pointer">Create</Button>
                        </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                            {menus.map(menu => (
                                <TableRow key={menu.id}>
                                    <TableCell className="flex items-center gap-3">
                                        <Image src={menu.image} alt={menu.name} width={50} height={50} className="aspect-square object-cover rounded-lg" /> {menu.name}
                                    </TableCell>
                                    <TableCell>{menu.description?.split('').slice(0, 5).join(' ') + '...'}</TableCell>
                                    <TableCell>{menu.category}</TableCell>
                                    <TableCell>${menu.price}.00</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild className="cursor-pointer">
                                                <Ellipsis />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-56 ">
                                                <DropdownMenuLabel className="font-bold">Action</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuGroup>
                                                    <DropdownMenuItem>Update</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setSelectedMenu({menu, action: "delete"})} className="text-red-400">Delete</DropdownMenuItem>
                                                </DropdownMenuGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>

                <Dialog open={selectedMenu !== null && selectedMenu.action === "delete"} onOpenChange={(open) => {
                    if(!open)
                        setSelectedMenu(null)
                }}>
                    <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Delete Menu</DialogTitle>
                                <DialogDescription>Are you sure want to delete {selectedMenu?.menu.name}</DialogDescription>
                            </DialogHeader>

                        <DialogFooter>
                            <DialogClose>
                                <Button variant={'secondary'} className="cursor-pointer">Cancel</Button>
                            </DialogClose>
                            <Button onClick={() => handleDeleteMenu(selectedMenu?.menu.id)} variant={"destructive"} className="cursor-pointer">Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
        </div>  
    )
}

export default AdminPage