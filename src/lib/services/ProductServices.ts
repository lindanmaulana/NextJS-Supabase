import supabase from "@/lib/db";
import { ProductCreateRequest, ProductUpdateRequest } from "@/lib/models/Product";
import { ParamsRequest } from "../models/supabase";
import { NextRequest } from "next/server";

export class ProductServices {
    static TableName = "products"

    static async create(req: ProductCreateRequest) {
        const result = await supabase.from(this.TableName).insert(req).select()

        if(result.error) throw new Error(`Gagal menambahkan data product, ${result.error.message}`)

        return result
    }

    static async getAll(req: NextRequest) {
        const query = supabase.from(this.TableName).select("*");
        
        if(req) {
            const url = new URL(req.url)

            const limitParam = url.searchParams.get("limit")
            const keywordParam = url.searchParams.get("keyword")

            if(limitParam) {
                let limit = Number(limitParam)

                if(limit > 20) limit = 5

                query.limit(limit)
            }

            if(keywordParam) query.ilike("name", `%${keywordParam}%`)
        }

        const result = await query

        if (result.error) {
            throw new Error(`Gagal mengambil data produk dari Supabase: ${result.error.message}`);
        }

        if (!result.data) {
            throw new Error("Data produk tidak ditemukan atau kosong.");
        }

        return result;
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