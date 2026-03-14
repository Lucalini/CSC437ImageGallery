import { ObjectId } from "mongodb";
import { imageMiddlewareFactory, handleImageFileErrors } from "../imageUploadMiddleware.js";

const MAX_NAME_LENGTH = 100;

function waitDuration(numMs) {
    return new Promise(resolve => setTimeout(resolve, numMs));
}

export function registerImageRoutes(app, imageProvider) {
    app.post(
        "/api/images",
        imageMiddlewareFactory.single("image"),
        handleImageFileErrors,
        async (req, res) => {
            if (!req.file || !req.body.name) {
                return res.status(400).send({
                    error: "Bad Request",
                    message: "Missing image file or image name"
                });
            }

            try {
                const src = `/uploads/${req.file.filename}`;
                const name = req.body.name;
                const authorUsername = req.userInfo.username;
                const id = await imageProvider.createImage(src, name, authorUsername);
                res.status(201).json({ id });
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Failed to upload image" });
            }
        }
    );

    app.get("/api/images", async (req, res) => {
        await waitDuration(1000);
        try {
            const images = await imageProvider.getAllImages();
            res.json(images);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to fetch images" });
        }
    });

    app.get("/api/images/:id", async (req, res) => {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(404).send({
                error: "Not Found",
                message: "No image with that ID"
            });
        }

        try {
            const image = await imageProvider.getOneImage(id);
            if (!image) {
                return res.status(404).send({
                    error: "Not Found",
                    message: "No image with that ID"
                });
            }
            res.json(image);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to fetch image" });
        }
    });

    app.patch("/api/images/:id", async (req, res) => {
        const { id } = req.params;
        const { name } = req.body || {};

        if (!name || typeof name !== "string") {
            return res.status(400).send({
                error: "Bad Request",
                message: "Missing or invalid 'name' field in request body"
            });
        }

        if (name.length > MAX_NAME_LENGTH) {
            return res.status(413).send({
                error: "Content Too Large",
                message: `Image name exceeds ${MAX_NAME_LENGTH} characters`
            });
        }

        if (!ObjectId.isValid(id)) {
            return res.status(404).send({
                error: "Not Found",
                message: "Image does not exist"
            });
        }

        try {
            const image = await imageProvider.getOneImage(id);
            if (!image) {
                return res.status(404).send({
                    error: "Not Found",
                    message: "Image does not exist"
                });
            }

            if (image.author.username !== req.userInfo.username) {
                return res.status(403).send({
                    error: "Forbidden",
                    message: "This user does not own this image"
                });
            }

            await imageProvider.updateImageName(id, name);
            res.status(204).send();
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to update image" });
        }
    });
}
