import { useState } from "react";

export function ImageNameEditor({ imageId, initialValue, onNameChanged, authToken }) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(initialValue || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    function handleEditPressed() {
        setIsEditingName(true);
        setNameInput(initialValue || "");
    }

    async function handleSubmitPressed() {
        setIsSubmitting(true);
        setError("");
        try {
            const response = await fetch(`/api/images/${imageId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                },
                body: JSON.stringify({ name: nameInput })
            });
            if (!response.ok) {
                const body = await response.json();
                throw new Error(body.message || `HTTP ${response.status}`);
            }
            onNameChanged(nameInput);
            setIsEditingName(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isEditingName) {
        return (
            <div style={{ margin: "1em 0" }}>
                <label>
                    New Name
                    <input
                        required
                        style={{ marginLeft: "0.5em" }}
                        value={nameInput}
                        disabled={isSubmitting}
                        onChange={e => setNameInput(e.target.value)}
                    />
                </label>
                <button disabled={nameInput.length === 0 || isSubmitting} onClick={handleSubmitPressed}>
                    Submit
                </button>
                <button onClick={() => setIsEditingName(false)} disabled={isSubmitting}>
                    Cancel
                </button>
                <div aria-live="polite">
                    {isSubmitting && <p>Renaming image...</p>}
                    {error && <p style={{ color: "red" }}>Error: {error}</p>}
                </div>
            </div>
        );
    } else {
        return (
            <div style={{ margin: "1em 0" }}>
                <button onClick={handleEditPressed}>Edit name</button>
            </div>
        );
    }
}
