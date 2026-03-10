import { ImageGrid } from "./ImageGrid.jsx";
import { useImageFetch } from "./useImageFetch.js";

export function AllImages() {
    const { imageData, isLoading, error } = useImageFetch();

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <>
            <h2>All Images</h2>
            <ImageGrid images={imageData} />
        </>
    );
}
