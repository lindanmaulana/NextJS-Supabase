import supabase from "../db";
import { ImageUploadRequest } from "../models/Image";

export class ImageServices {
    static BUCKET_NAME = "learn-supabase"

    static async upload(req: ImageUploadRequest) {
        const strImage = Math.floor(Math.random() * (99999 - 1000 + 1) + 1000).toString();

        const originalImageName = req.image.name.replace(/\s+/g, '_').replace(/[^\w.-]/g, '')
        const imageName = `${strImage}-${originalImageName}`
        const filePath = `public/${req.filePath}/${imageName}`

        const result = await supabase.storage.from(this.BUCKET_NAME).upload(filePath, req.image, {
            cacheControl: '3600',
            upsert: false
        })

        if(result.error) throw new Error(`Gagal upload image: ${result.error.message}`)

        const resultUrlPublic = await supabase.storage.from(this.BUCKET_NAME).getPublicUrl(result.data.path)

        if(!resultUrlPublic) throw new Error(`Gagal mengambil image url public.`)

        return resultUrlPublic.data
    }
}