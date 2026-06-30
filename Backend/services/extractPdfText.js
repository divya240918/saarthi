import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import axios from 'axios';
import { createWorker } from "tesseract.js";
import { pdf } from "pdf-to-img";

export const extractPdfText = async (pdfUrl) => {

    const response = await axios.get(pdfUrl, {
        responseType: "arraybuffer",
    });

    const pdfBuffer = Buffer.from(response.data);

    const pdfDoc = await pdfjsLib.getDocument({
        data: new Uint8Array(pdfBuffer),
    }).promise;

    console.log(`PDF has ${pdfDoc.numPages} pages`); // ✅ add

    const pages = [];
    const pagesNeedingOCR = [];

    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();

        const text = textContent.items
            .map((item) => item.str)
            .join(" ")
            .trim();

        console.log(`Page ${i}: extracted ${text.length} chars normally`); // ✅ add

        if (text.length < 30) {
            pagesNeedingOCR.push(i);
            pages.push({ pageNumber: i, content: "" });
        } else {
            pages.push({ pageNumber: i, content: text });
        }
    }

    console.log(`Pages needing OCR: ${pagesNeedingOCR.join(", ")}`); // ✅ add

    if (pagesNeedingOCR.length > 0) {
        const worker = await createWorker("eng");
        const imageDoc = await pdf(pdfBuffer, { scale: 2 });

        let pageIndex = 0;
        for await (const imageBuffer of imageDoc) {
            pageIndex++;
            console.log(`OCR processing page ${pageIndex}`); // ✅ add

            if (pagesNeedingOCR.includes(pageIndex)) {
                const { data: { text } } = await worker.recognize(imageBuffer);
                console.log(`OCR result for page ${pageIndex}: ${text.length} chars`); // ✅ add
                const pageObj = pages.find(p => p.pageNumber === pageIndex);
                pageObj.content = text.trim();
            }
        }

        await worker.terminate();
    }

    return pages;
};