import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function POST(request: NextRequest) {
  try {
    // 1. Read multipart form data from the incoming request
    const formData = await request.formData();

    // Create a new empty PDFDocument using pdf-lib
    const pdfDoc = await PDFDocument.create();

    // Embed standard fonts for rendering text
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Parse the number of entries the frontend sent
    const numEntriesStr = formData.get("numEntries") as string;
    const numEntries = parseInt(numEntriesStr || "0");

    if (numEntries === 0) {
      return NextResponse.json(
        { error: "No portfolio entries provided." },
        { status: 400 }
      );
    }

    // 2. Loop through each entry, creating exactly one PDF page per work
    for (let i = 0; i < numEntries; i++) {
      const title = formData.get(`title_${i}`) as string || "";
      const desc = formData.get(`description_${i}`) as string || "";
      const imageFile = formData.get(`image_${i}`) as File | null;

      // We will add a landscape-oriented page: 800 width, 600 height
      const page = pdfDoc.addPage([800, 600]);

      // -- DRAW IMAGE (Left Side) --
      if (imageFile) {
        try {
          const arrayBuffer = await imageFile.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);

          let image;
          // Detect and embed the appropriate image type
          if (imageFile.type === 'image/png') {
            image = await pdfDoc.embedPng(bytes);
          } else if (imageFile.type === 'image/jpeg' || imageFile.type === 'image/jpg') {
            image = await pdfDoc.embedJpg(bytes);
          }

          if (image) {
            // Scale the image down so it fits neatly into a 350x450 bounding box
            const dims = image.scaleToFit(350, 450);

            // Draw it centered vertically on the left side of the page
            page.drawImage(image, {
              x: 25 + (350 - dims.width) / 2, // Centered horizontally in the left box
              y: 300 - dims.height / 2,       // Centered vertically on the page
              width: dims.width,
              height: dims.height,
            });
          }
        } catch (e) {
          console.error("Failed to embed image for entry", i, e);
        }
      }

      // -- DRAW TEXT (Right Side) --
      const rightX = 400; // Text margin starts exactly in the middle of the 800px page
      let currentY = 500; // Start near the top of the right half, leaving a nice top margin

      // Draw Title text
      if (title) {
        page.drawText(title, {
          x: rightX,
          y: currentY,
          size: 28,
          font: fontBold,
          color: rgb(0, 0, 0),
          maxWidth: 350, // Ensures long text doesn't overflow off the right edge
        });
        currentY -= 45; // Move cursor down below the title for the description
      }

      // Draw Description text
      if (desc) {
        page.drawText(desc, {
          x: rightX,
          y: currentY,
          size: 14,
          font,
          color: rgb(0.2, 0.2, 0.2),
          maxWidth: 350, // Word-wraps long descriptions naturally within the bounds
          lineHeight: 20, // Clean readable spacing between lines
        });
      }
    }

    // 3. Serialize the completed PDF document to a raw byte array (Uint8Array)
    const pdfBytes = await pdfDoc.save();

    // 4. Return the generated PDF bytes directly as a downloadable file response.
    // We use `as any` because Next.js handles Uint8Array perfectly well here, 
    // even though TypeScript's strictly typed DOM BodyInit might complain.
    return new NextResponse(pdfBytes as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="creative-portfolio.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
