import cloudinary from "../config/cloudinary.js";
import Document from "../models/Document.js";

export const uploadDocument = async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "File Not Found" });
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: "raw",
                folder: "documind",
            },
            async (error, result) => {
                if (error) {
                    return res.status(500).json({ message: error.message });
                }

                const document = await Document.create({
                    fileName: file.originalname,
                    uploadedBy: req.user._id,
                    fileUrl: result.secure_url,
                    cloudinaryId: result.public_id,
                });

                return res.status(201).json({
                    message: "Uploaded successfully",
                    document,
                });
            }
        );

        uploadStream.end(file.buffer);

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};