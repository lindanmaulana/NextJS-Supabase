export interface Product {
  name: string;
  category: string;
  price: number;
  image: string;
}

export type ProductCreateRequest = Product;

export interface ProductUpdateRequest {
    name?: string
    category?: string
    price?: number
    image?: string
}
