import Groq from 'groq-sdk';
import { Document } from "../models/Document.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const generateSummary = async (req, res) => {
    try {
        const docId = req.params.id;

        const document = await Document.findOne({
            _id: docId,
            uploadedBy: req.user._id,
        })

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        if (document.status !== 'ready') {
            return res.status(400).json({ message: "Document still processing" });
        }

        const allPages = [...document.extractedText]
            .sort((a, b) => a.pageNumber - b.pageNumber);

        const chunkSize = 2;
        const chunks = [];
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];

            const pdfContext = chunk
                .map(p => `[Page ${p.pageNumber}]\n${p.content}`)
                .join("\n\n");

            console.log(`Processing chunk ${i + 1}/${chunks.length}, context length: ${pdfContext.length} chars`);

            const completion = await groq.chat.completions.create({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 1024,
            });

            const raw = completion.choices[0].message.content;
            console.log(`Chunk ${i + 1} raw response:`, raw.slice(0, 200));

            const clean = raw.replace(/```json|```/g, "").trim();

            try {
                const points = JSON.parse(clean);
                console.log(`Chunk ${i + 1} parsed ${points.length} points`);
                chunkSummaries.push(...points);
            } catch (e) {
                console.log(`Chunk ${i + 1} parse FAILED:`, clean.slice(0, 200));
            }

            if (i < chunks.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
        }

        return res.status(200).json({ summary: chunkSummaries });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}