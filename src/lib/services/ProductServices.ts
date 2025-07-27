import supabase from "@/lib/db";
import { ProductCreateRequest, ProductUpdateRequest } from "@/lib/models/Product";
import { ParamsRequest } from "../models/supabase";
import { NextRequest } from "next/server";
import { ImageServices } from "./ImageServices";

export class ProductServices {
    static TableName = "products"

    static async create(req: ProductCreateRequest) {
        const uploadImage = await ImageServices.upload({filePath: "products", image: req.image })

        const data = {
            ...req,
            image: uploadImage.publicUrl
        }

        const result = await supabase.from(this.TableName).insert(data).select()

        if(result.error) throw new Error(`Gagal menambahkan data product, ${result.error.message}`)

        return result
    }

    static async getAll(req: NextRequest) {
        const query = supabase.from(this.TableName).select("*", {count: "exact"}).limit(5);

        const MAXIMUM_LIMIT: number = 20
        const DEFAULT_LIMIT: number = 5
        const DEFAULT_PAGE: number = 1

        let limit: number = DEFAULT_LIMIT
        let page: number = DEFAULT_PAGE
        let totalPage: number = 1;
        let nextPage: number | null = null
        let prevPage: number | null = null
        let links: number[] = [1]

        
        if(req) {
            const url = new URL(req.url)

            const limitParam = url.searchParams.get("limit")
            const keywordParam = url.searchParams.get("keyword")
            const pageParam = url.searchParams.get("page")

            if(limitParam) {
                const parsedLimit = Number(limitParam)

                if(parsedLimit > MAXIMUM_LIMIT) {
                    limit = DEFAULT_LIMIT
                } else {
                    limit = parsedLimit
                }
            }

            if(pageParam) {
                const parsedPage = Number(pageParam)

                if(parsedPage < DEFAULT_PAGE) {
                    page = DEFAULT_PAGE
                } else {
                    page = parsedPage
                }
            }

            if(keywordParam) query.ilike("name", `%${keywordParam}%`);


            const start = (page - 1) * limit 
            const end = start + limit - 1

            query.range(start, end)
        }

        const result = await query

        
        if (result.error) {
            throw new Error(`Gagal mengambil data produk dari Supabase: ${result.error.message}`);
        }

        if (!result.data) {
            throw new Error("Data produk tidak ditemukan atau kosong.");
        }

        if(result.count) {
            totalPage = Math.ceil(result.count / limit)
            nextPage= page > 0 && page < totalPage ? page + 1 : null
            prevPage= page > 1 ? page - 1 : null
            links = Array.from({length: totalPage}, (_, index) => index + 1);
        }

        const response = {
            ...result,
            pagination: {
                totalPage,
                currentPage: page,
                limit,
                links,
                nextPage,
                prevPage
            }
        }

        return response;
    }
    
    static async getOne(params: ParamsRequest) {
        await this.checkProduct(params.id)

        const result = await supabase.from(this.TableName).select("*").eq("id", params.id).single()

        if(result.error) throw new Error(`Gagal mengambil data produk ${result.error}`)

        return result
    }

    static async update(req: ProductUpdateRequest, params: ParamsRequest) {
        await this.checkProduct(params.id)

        const result = await supabase.from(this.TableName).update(req).eq("id", params.id)
        if(result.error) throw new Error(`Gagal mengubah data product ${result.error}`)

        return result
    }

    static async delete(params: ParamsRequest) {
        await this.checkProduct(params.id)

        const result = await supabase.from(this.TableName).delete().eq("id", params.id)

        if(result.error) throw new Error(`Gagal menghapus data produk ${result.error}`)

        return result
    }

    static async checkProduct(id: string) {
        const result = await supabase.from(this.TableName).select("id").eq("id", id).single()

        if(!result.data) throw new Error(`Data produk tidak ada: ${result.error}.`)
        
        return result.data
    }
}