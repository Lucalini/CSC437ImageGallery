import multer from "multer";
import { getEnvVar } from "./getEnvVar.js";

class ImageFormatError extends Error {}

const storageEngine = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, getEnvVar("IMAGE_UPLOAD_DIR"));
    },
    filename: function (req, file, cb) {
        let fileExtension;
        switch (file.mimetype) {
            case "image/png":
                fileExtension = "png";
                break;
            case "image/jpg":
            case "image/jpeg":
                fileExtension = "jpg";
                break;
            default:
                cb(new ImageFormatError("Unsupported image type"), "");
                return;
        }
        const fileName = Date.now() + "-" + Math.round(Math.random() * 1E9) + "." + fileExtension;
        cb(null, fileName);
    }
});

export const imageMiddlewareFactory = multer({
    storage: storageEngine,
    limits: {
        files: 1,
        fileSize: 5 * 1024 * 1024
    },
});

export function handleImageFileErrors(err, req, res, next) {
    if (err instanceof multer.MulterError || err instanceof ImageFormatError) {
        res.status(400).send({
            error: "Bad Request",
            message: err.message
        });
        return;
    }
    next(err);
}
