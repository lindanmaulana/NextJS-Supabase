import { ProductCreateRequest } from "@/lib/models/Product";
import { ProductServices } from "@/lib/services/ProductServices";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () => {
    try {
        const response = await ProductServices.getAll();
        
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
        const body = await req.json() as ProductCreateRequest
        const response = await ProductServices.create(body)
        
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