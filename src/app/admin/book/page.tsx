interface AdminBookPageProps {
    searchParams?: {[key: string]: string | string[] | undefined}
}

const AdminBookPage = async (props: AdminBookPageProps) => {
    const searchParams = await props.searchParams
    console.log({searchParams})
    return (
        <div>
            <h2>Hello {searchParams?.page}</h2>
        </div>
    )
}

export default AdminBookPage