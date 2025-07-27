export interface IPagination {
    totalPage: number
    currentPage: number
    limit: number
    links: number[]
    nextPage: number | null
    prevPage: number | null
}