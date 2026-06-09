import cloudinary from "../config/cloudinary.js";
import Document from "../models/Document.js";

export const uploadDocument = async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "file Not found" });
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: "raw",
                folder: "saarthi",
            },
            async (error, result) => {
                if (error) {
                    return res.status(500).json({ message: error.message });
                }

                const document = await Document.create({
                    fileName: file.fileName,
                    fileUrl: result.secure_url,
                    cloudinaryId: result.public_id,
                    uploadedBy: req.user._id,

                })

                return res.status(201).json({ message: "Document Uploaded Successfully" });
            }
        )
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}