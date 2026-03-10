import { useState, useEffect } from "react";

export function useImageFetch() {
    const [imageData, setImageData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function doFetch() {
            try {
                const response = await fetch("/api/images");
                if (!response.ok) {
                    throw new Error(`Error: HTTP ${response.status} ${response.statusText}`);
                }
                const data = await response.json();
                setImageData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }
        doFetch();
    }, []);

    return { imageData, isLoading, error };
}
