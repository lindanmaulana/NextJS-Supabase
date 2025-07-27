import { ProductCreateRequest } from "@/lib/models/Product";
import { ProductServices } from "@/lib/services/ProductServices";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    try {
        const response = await ProductServices.getAll(req);
        
        return NextResponse.json(response);
    } catch (err) {
        let errorMessage = "An unexpected error occurred!"

        if(err instanceof Error) {
            errorMessage = err.message
        }
        return NextResponse.json({
            error: errorMessage
        })
    }
}

export const POST = async (req: NextRequest) => {
    try {
        console.log({req})
        const body = await req.formData()

        const name = body.get("name") as string
        const category = body.get("category") as string
        const price = Number(body.get("price")) as number
        const image = body.get("image") as File 

        const newProduct: ProductCreateRequest = {name, category, price, image}
        const response = await ProductServices.create(newProduct)
        
        return NextResponse.json(response)
    } catch (err) {
        let errorMessage = "An unexpected error occurred!"

        if(err instanceof Error) {
            errorMessage = err.message
        }
        return NextResponse.json({
            error: errorMessage
        })
    }
}