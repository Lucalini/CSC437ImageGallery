import React, { useState, useActionState } from "react";
import { useNavigate } from "react-router";

function readAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
    });
}

export function UploadPage({ authToken }) {
    const navigate = useNavigate();
    const fileInputId = React.useId();
    const [previewUrl, setPreviewUrl] = useState(null);

    async function handleFileChange(e) {
        const file = e.target.files[0];
        if (file) {
            const dataUrl = await readAsDataURL(file);
            setPreviewUrl(dataUrl);
        } else {
            setPreviewUrl(null);
        }
    }

    async function handleSubmit(_prevResult, formData) {
        try {
            const response = await fetch("/api/images", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${authToken}`
                },
                body: formData
            });
            if (!response.ok) {
                const body = await response.json().catch(() => null);
                throw new Error(body?.message || `Upload failed (HTTP ${response.status})`);
            }
            const data = await response.json();
            navigate(`/images/${data.id}`);
            return null;
        } catch (err) {
            setPreviewUrl(null);
            return err.message;
        }
    }

    const [result, submitAction, isPending] = useActionState(handleSubmit, null);

    return (
        <>
            <h2>Upload</h2>
            <form action={submitAction}>
                <div>
                    <label htmlFor={fileInputId}>Choose image to upload: </label>
                    <input
                        id={fileInputId}
                        name="image"
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        required
                        disabled={isPending}
                        onChange={handleFileChange}
                    />
                </div>
                <div>
                    <label>
                        <span>Image title: </span>
                        <input name="name" required disabled={isPending} />
                    </label>
                </div>

                {previewUrl && (
                    <div>
                        <img style={{ width: "20em", maxWidth: "100%" }} src={previewUrl} alt="" />
                    </div>
                )}

                <input type="submit" value={isPending ? "Uploading..." : "Confirm upload"} disabled={isPending} />
            </form>
            <div aria-live="assertive">
                {result && <p style={{ color: "red" }}>{result}</p>}
            </div>
        </>
    );
}
