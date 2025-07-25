"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { IMenu } from "@/types/menu";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const MenuContent = () => {
  const [menus, setMenus] = useState<IMenu[] | []>([]);

  useEffect(() => {
    const fetchMenus = async () => {

      try {
        const response = await fetch("/api/v1/products", {
          method: "GET"
        });
        const result = await response.json()

        if(!result.data) throw new Error(result.error)
  
        setMenus(result.data)
        
      } catch (err) {
        let errorMessage = "Unexpected error occurred!"

        if(err instanceof Error) {
          errorMessage = err.message
        }

        toast(errorMessage);
      }
    };

    fetchMenus();
  }, []);

  if (!menus) return <p>Loading...</p>;

  return (
    <div className="container max-w-6xl mx-auto py-8">
      <h2 className="text-3xl font-bold mb-4">Menu</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {menus.map((menu) => (
          <Card key={menu.id}>
              <CardContent>
                <Image src={menu.image} alt={menu.name} width={200} height={200} className="w-full h-[30vh] object-cover rounded-lg" />
                <div>
                  <div>
                    <h4 className="font-semibold text-xl">{menu.name}</h4>
                    <p>{menu.category}</p>
                  </div>
                  <p className="font-semibold text-2xl">${menu.price},00</p>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/menu/${menu.id}`} className="w-full">
                  <Button className="w-full font-bold" size="lg">Detail Menu</Button>
                </Link>
              </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
