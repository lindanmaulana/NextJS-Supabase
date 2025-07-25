'use client'

import { Button } from "@/components/ui/button"
import supabase from "@/lib/db"
import { IMenu } from "@/types/menu"
import Image from "next/image"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

const DetailMenu = () => {
    const params = useParams()
    const [menu, setMenu] = useState<IMenu | null>(null)

    useEffect(() => {
        if(params.id) {
            const fetchMenu = async () => {
                const {data, error} = await supabase.from('products').select("*").eq('id', params.id).single()

                if(error) console.log({error})
                else setMenu(data)
            }

            fetchMenu()
        }
    }, [params.id])

    if(menu === null) return <p>Loading...</p>

    console.log({menu})
    return (
        <div className="container max-w-6xl mx-auto py-8">
            <div className="flex gap-16">
                {menu && (
                    <div className="w-full flex items-center gap-16">
                        <div className="w-1/2">
                            <Image src={menu.image} alt={menu.name} width={1080} height={1080} className="w-full h-[70vh] object-cover rounded-2xl" />
                        </div>
                        <div className="w-1/2">
                            <h1 className="text-3xl font-bold mb-4">{menu.name}</h1>
                            <p className="text-xl mb-4 text-neutral-500">{menu.description}</p>
                            <div className="flex items-center gap-4">
                                <p className="text-4xl font-bold ">${menu.price}.00</p>
                                <Button className="text-lg py-6 font-bold" size={"lg"}>Buy Now</Button>
                            </div>
                        </div>
                    </div>  
                )}
            </div>
        </div>
    )
}

export default DetailMenu