import { useState, useEffect } from "react";

export function useImageFetch(authToken) {
    const [imageData, setImageData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function doFetch() {
            try {
                const response = await fetch("/api/images", {
                    headers: {
                        "Authorization": `Bearer ${authToken}`
                    }
                });
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
    }, [authToken]);

    return { imageData, isLoading, error };
}
