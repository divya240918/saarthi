import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true,
    },
    fileName: {
        type: String,
        required: true,
    },
    fileUrl: {
        type: String,
        required: true,
        unique: true,
    },
    cloudinaryId:{
        type: String,
        required: true,
    },
    extractedText: {
        type: [String],
        default: [],
    }
}, { timestamps: true })

export const Document = mongoose.model("Document", documentSchema);