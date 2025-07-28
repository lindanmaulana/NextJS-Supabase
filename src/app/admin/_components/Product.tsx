"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { handleApiError } from "@/lib/helpers/ApiError";
import { IMenu } from "@/types/menu";
import { IPagination } from "@/types/pagination";
import { Ellipsis } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";

const Product = () => {
    const [menus, setMenus] = useState<IMenu[] | []>([]);
    const [pagination, setPagination] = useState<IPagination>({currentPage: 1, limit: 5, links: [1, 2], nextPage: 2, prevPage: 1, totalPage: 2})
    const [product, setProduct] = useState<IMenu>()
    const [createDialog, setCreateDialog] = useState<boolean>(false)
    const [selectedMenu, setSelectedMenu] = useState<{menu: IMenu, action: "edit" | "delete"} | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const currentSearchParams = useSearchParams()

    const router = useRouter()
    const pathname = usePathname()

    const fetchMenu = async (params: string) => {
        setLoading(true)
        try {
            const response = await fetch(`/api/v1/products?${params}`, {
                method: "GET"
            })

            const result = await response.json()

            if(result.error) throw new Error(result.error)

            setLoading(false)
            setMenus(result.data)
            setPagination(result.pagination)
            return result
        } catch (err) {
            let errorMessage = "An unexpected error occurred!"

            if(err instanceof Error) {
                errorMessage = err.message
            }

            toast(errorMessage)
        }
    }

    const fetchOneProduct = async (id: number) => {
        try {
            const response = await fetch(`/api/v1/products/${id}`, {
                method: "GET"
            })

            const result = await response.json()

            if(result.error) throw new Error(result.error)

            setProduct(result.data)
        } catch (err) {
            const errorMessage = handleApiError(err)

            toast(errorMessage)
        }
    }

    
    const handleDebounceSearch = useDebouncedCallback((value: string) => {
        const queryParams = new URLSearchParams(currentSearchParams.toString())

        switch(value) {
            case "":
                queryParams.delete("keyword")
            break
            default:
                queryParams.set("page", "1")
                queryParams.set("keyword", value)
        }

        fetchMenu(queryParams.toString())
        router.push(`${pathname}?${queryParams.toString()}`)
    }, 1000)

    useEffect(() => {
        const queryParams = new URLSearchParams(URLSearchParams.toString())
        fetchMenu(queryParams.toString())
    }, []);

    // if(!loading) return <p>Loading...</p>

    const handleAddMenu = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const queryParams = new URLSearchParams(currentSearchParams.toString())

        try {
            const response = await fetch("/api/v1/products", {
                method: "POST",
                body: formData
            })

            const result = await response.json()

            if(!result.data) throw new Error(result.error)

            await fetchMenu(queryParams.toString())
            toast("Menu added successfully")

            setCreateDialog(false)
        } catch (err) {
            console.log({err})
        }
    }

    const handleUpdateMenu = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if(!selectedMenu?.menu.id) {
            toast("product not found")
            return;
        }

        const queryParams = new URLSearchParams(currentSearchParams.toString())

        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData)

        try {
            const response = await fetch(`/api/v1/products/${selectedMenu.menu.id}`, {
                method: "PATCH",
                body: JSON.stringify(data)
            })
            
            const result = await response.json()
            
            if(result.error) throw new Error(result.error)

            toast("Berhasil mengubah data produk")

            setSelectedMenu(null)
            await fetchMenu(queryParams.toString())
        } catch (err) {
            const errorMessage = handleApiError(err)

            toast(errorMessage)
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

    const handleFilterLimit = (value: string) => {
        const queryParams = new URLSearchParams(currentSearchParams.toString())

        switch(value) {
            case "":
                queryParams.set("limit", "5")
            break
            default:
                queryParams.set("page", "1")
                queryParams.set("limit", value)
        }
        
        fetchMenu(queryParams.toString())
        router.replace(`${pathname}?${queryParams.toString()}`)
    }

    const handleFilterSearch = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value

        handleDebounceSearch(value)
    }

    const handlePagination = (page?: string | null) => {
        const queryParams = new URLSearchParams(currentSearchParams.toString())
        switch(page) {
            case null:
                return;
            case undefined:
                return;
            default:
                queryParams.set("page", page)
                fetchMenu(queryParams.toString())
        }

        router.replace(`${pathname}?${queryParams.toString()}`)
    }
    
    return (
        <div className="container max-w-6xl mx-auto py-8">
            <div className="mb-4 w-full flex items-center justify-between">
                <div className="text-3xl font-bold">Menu</div>
                <div className="flex items-center gap-4">
                    <Input onChange={handleFilterSearch} placeholder="Search..." defaultValue={currentSearchParams.get("keyword")?.toString() ?? ""} />
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
                                        <input type="file" id="image" name="image" accept="image/*" />
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
            </div>

            <div className="space-y-4">
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
                            {menus.length > 0 ? menus.map(menu => (
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
                                                    <DropdownMenuItem onClick={() => {
                                                        setSelectedMenu({menu, action: "edit"})
                                                        fetchOneProduct(menu.id)
                                                    }}>Update</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setSelectedMenu({menu, action: "delete"})} className="text-red-400">Delete</DropdownMenuItem>
                                                </DropdownMenuGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )): (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">
                                        <p className="p-4">Data Produk tidak tersedia!</p>
                                    </TableCell>
                                </TableRow>
                            )}
                    </TableBody>
                </Table>

                <div>
                    <Select onValueChange={(value) => handleFilterLimit(value)} defaultValue={currentSearchParams.get("limit") ? currentSearchParams.get("limit")?.toString() : "5"}>
                        <SelectTrigger>
                            <SelectValue placeholder="Limit" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="15">15</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious onClick={() => handlePagination(pagination.prevPage?.toString())} className={`${!pagination.prevPage && "pointer-events-none opacity-50 cursor-not-allowed"}`} />
                            </PaginationItem>
                            {pagination.links?.map(page => {
                                const isActive: boolean = page === pagination.currentPage
                                return (
                                    <PaginationItem key={page}>
                                        <PaginationLink onClick={() => handlePagination(page.toString())} isActive={isActive} className={`${isActive ? "pointer-events-none opacity-50 cursor-not-allowed" : ""}`}>{page}</PaginationLink>
                                    </PaginationItem>
                                )
                            })}
                            <PaginationItem>
                                <PaginationNext onClick={() => handlePagination(pagination.nextPage?.toString())} className={`${!pagination.nextPage && "pointer-events-none opacity-50 cursor-not-allowed"}`} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
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
                            <DialogClose asChild>
                                <Button variant={'secondary'} className="cursor-pointer">Cancel</Button>
                            </DialogClose>
                            <Button onClick={() => handleDeleteMenu(selectedMenu?.menu.id)} variant={"destructive"} className="cursor-pointer">Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={selectedMenu !== null && selectedMenu.action === "edit"} onOpenChange={(open) => !open && setSelectedMenu(null)}>
                    <DialogContent key={product?.id} className="sm:max-w-md">
                        <form onSubmit={handleUpdateMenu} className="space-y-4">
                            <DialogHeader>
                                <DialogTitle>Update Menu</DialogTitle>
                                <DialogDescription>Update a menu by insert data in this form</DialogDescription>
                            </DialogHeader>

                            <div className="w-full grid gap-4">
                                <div className="w-full grid gap-1.5">
                                    <Label htmlFor="name">Name</Label>
                                    <Input type="text" id="name" name="name" placeholder="Insert name" defaultValue={product?.name} required />
                                </div>
                                <div className="w-full grid gap-1.5">
                                    <Label htmlFor="category">Category</Label>
                                    <Select name="category" defaultValue={product?.category}>
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
                                    <Input type="number" id="price" name="price" placeholder="Insert price" defaultValue={product?.price} required />
                                </div>
                                <div className="w-full grid gap-1.5">
                                    <Label htmlFor="image">Image</Label>
                                    <Textarea id="image" name="image" placeholder="Insert name" defaultValue={product?.image} required></Textarea>
                                </div>
                                <div className="w-full grid gap-1.5">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea id="description" name="description" placeholder="Insert name" className="resize-none" defaultValue={product?.description} required></Textarea>
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
    )
}

export default Product