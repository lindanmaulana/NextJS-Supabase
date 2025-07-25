export const handleApiError = (err: unknown) => {
    let errorMessage = "An unexpected error occurred!"

    if(err instanceof Error) {
        errorMessage = err.message
    }

    return errorMessage
}   