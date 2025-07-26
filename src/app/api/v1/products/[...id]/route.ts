import { handleApiError } from "@/lib/helpers/ApiError"
import { ProductServices } from "@/lib/services/ProductServices"
import { NextRequest, NextResponse } from "next/server"

interface ProductParams {
    id: string
}


export const GET = async (req: NextRequest, params: {params: ProductParams}) => {
    try {
        const {id} = await params.params
        const result = await ProductServices.getOne({id})

        return NextResponse.json(result)
    } catch (err) {
        const errorMessage = handleApiError(err)

        return NextResponse.json({
            error: errorMessage
        })
    }
}


export const PATCH = async (req: NextRequest, params: {params: ProductParams}) => {
    try {
        const reqParams = await params.params
        const reqBody = await req.json()
        const result = await ProductServices.update(reqBody, reqParams)

        return NextResponse.json(result)
    } catch (err) {
        const errorMessage = handleApiError(err)

        return NextResponse.json({
            error: errorMessage
        })
    }
}

export const DELETE = async (req: NextRequest, params: {params: ProductParams}) => {
    try {
        const {id} = await params.params
        const result = await ProductServices.delete({id})

        return NextResponse.json(result)
    } catch (err) {
        const errorMessage = handleApiError(err)

        return NextResponse.json({
            error: errorMessage
        })
    }
}