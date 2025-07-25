import { handleApiError } from "@/lib/helpers/ApiError"
import { ProductServices } from "@/lib/services/ProductServices"
import { NextRequest, NextResponse } from "next/server"

interface ProductParams {
    id: string
}

export const PATCH = async (req: NextRequest, params: {params: ProductParams}) => {
    try {
        const reqBody = await req.json()
        const result = await ProductServices.update(reqBody, params.params)

        return NextResponse.json(result)
    } catch (err) {
        const errorMessage = handleApiError(err)

        return NextResponse.json({
            error: errorMessage
        })
    }
}

export const DELETE = async (params: {params: ProductParams}) => {
    console.log({params: params})
    try {
        const result = await ProductServices.delete(params.params)

        return NextResponse.json(result)
    } catch (err) {
        const errorMessage = handleApiError(err)

        return NextResponse.json({
            error: errorMessage
        })
    }
}