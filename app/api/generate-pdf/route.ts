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

    // READ LAYOUT
    const layout = formData.get("layout") as string || "layout1";

    if (numEntries === 0) {
      return NextResponse.json(
        { error: "No portfolio entries provided." },
        { status: 400 }
      );
    }

    // BRANCH LOGIC
    if (layout === "layout1") {
      // KEEP EXISTING CODE EXACTLY AS IS
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
    }

    if (layout === "layout2") {
      let page = pdfDoc.addPage([800, 600]);

      for (let i = 0; i < numEntries; i++) {
        // If not the first element and it's an even index, we need a fresh page
        if (i > 0 && i % 2 === 0) {
          page = pdfDoc.addPage([800, 600]);
        }

        const title = formData.get(`title_${i}`) as string || "";
        const imageFile = formData.get(`image_${i}`) as File | null;

        // Check if we are drawing on the left or the right side of the page
        const isLeft = i % 2 === 0;
        const centerX = isLeft ? 200 : 600;

        if (imageFile) {
          try {
            const arrayBuffer = await imageFile.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);

            let image;
            if (imageFile.type === 'image/png') {
              image = await pdfDoc.embedPng(bytes);
            } else if (imageFile.type === 'image/jpeg' || imageFile.type === 'image/jpg') {
              image = await pdfDoc.embedJpg(bytes);
            }

            if (image) {
              // Scale down slightly more to fit nicely side-by-side with breathing room
              const dims = image.scaleToFit(300, 400);
              page.drawImage(image, {
                x: centerX - dims.width / 2, // perfectly centered in the 400px column
                y: 350 - dims.height / 2,    // shifted slightly upwards from exact center
                width: dims.width,
                height: dims.height,
              });
            }
          } catch (e) {
            console.error("Failed to embed image for entry", i, e);
          }
        }

        // Draw title cleanly under the image bounds
        if (title) {
          page.drawText(title, {
            x: centerX - 150, // Left-aligned cleanly with the image bounding box
            y: 100,           // Fixed height so row titles align uniformly perfectly
            size: 24,
            font: fontBold,
            color: rgb(0, 0, 0),
            maxWidth: 300,
          });
        }
      }
    }

    if (layout === "layout3") {
      if (numEntries !== 8) {
        return NextResponse.json(
          { error: "Layout 3 requires exactly 8 portfolio entries." },
          { status: 400 }
        );
      }

      // Helper for embedding images explicitly safely without scoping complexity 
      const loadImg = async (index: number) => {
        const imageFile = formData.get(`image_${index}`) as File | null;
        if (!imageFile) return null;
        try {
          const arrayBuffer = await imageFile.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          if (imageFile.type === 'image/png') return await pdfDoc.embedPng(bytes);
          if (imageFile.type === 'image/jpeg' || imageFile.type === 'image/jpg') return await pdfDoc.embedJpg(bytes);
        } catch (e) {
          console.error("Failed to embed image for entry", index, e);
        }
        return null;
      };

      // Page 1: Header: "PORTFOLIO"
      let page1 = pdfDoc.addPage([800, 600]);
      page1.drawText("PORTFOLIO", { x: 260, y: 320, size: 60, font: fontBold, color: rgb(0, 0, 0) });
      page1.drawText("Selected Works", { x: 330, y: 280, size: 20, font: font, color: rgb(0.3, 0.3, 0.3) });

      // Page 2: Entry 1 (Index 0): image + text
      let page2 = pdfDoc.addPage([800, 600]);
      let img0 = await loadImg(0);
      let title0 = formData.get(`title_0`) as string || "";
      let desc0 = formData.get(`description_0`) as string || "";
      if (img0) {
        const dims = img0.scaleToFit(350, 450);
        page2.drawImage(img0, { x: 50, y: 300 - dims.height / 2, width: dims.width, height: dims.height });
      }
      if (title0) page2.drawText(title0, { x: 450, y: 500, size: 28, font: fontBold });
      if (desc0) page2.drawText(desc0, { x: 450, y: 450, size: 14, font, maxWidth: 300, lineHeight: 20 });

      // Page 3: Entries 2, 3, 4 (Indexes 1, 2, 3): three vertical images side by side
      let page3 = pdfDoc.addPage([800, 600]);
      for (let i = 1; i <= 3; i++) {
        let img = await loadImg(i);
        let title = formData.get(`title_${i}`) as string || "";
        let centerX = 133 + (i - 1) * 266;
        if (img) {
          const dims = img.scaleToFit(200, 400);
          page3.drawImage(img, { x: centerX - dims.width / 2, y: 330 - dims.height / 2, width: dims.width, height: dims.height });
        }
        if (title) page3.drawText(title, { x: centerX - 100, y: 80, size: 16, font: fontBold, maxWidth: 200 });
      }

      // Page 4: Entries 5, 6 (Indexes 4, 5): two images side by side
      let page4 = pdfDoc.addPage([800, 600]);
      for (let i = 4; i <= 5; i++) {
        let img = await loadImg(i);
        let title = formData.get(`title_${i}`) as string || "";
        let isLeft = i === 4;
        let centerX = isLeft ? 200 : 600;
        if (img) {
          const dims = img.scaleToFit(300, 400);
          page4.drawImage(img, { x: centerX - dims.width / 2, y: 350 - dims.height / 2, width: dims.width, height: dims.height });
        }
        if (title) page4.drawText(title, { x: centerX - 150, y: 100, size: 24, font: fontBold, maxWidth: 300 });
      }

      // Page 5: Entry 7 (Index 6): image + text
      let page5 = pdfDoc.addPage([800, 600]);
      let img6 = await loadImg(6);
      let title6 = formData.get(`title_6`) as string || "";
      let desc6 = formData.get(`description_6`) as string || "";
      if (img6) {
        const dims = img6.scaleToFit(350, 450);
        page5.drawImage(img6, { x: 50, y: 300 - dims.height / 2, width: dims.width, height: dims.height });
      }
      if (title6) page5.drawText(title6, { x: 450, y: 500, size: 28, font: fontBold });
      if (desc6) page5.drawText(desc6, { x: 450, y: 450, size: 14, font, maxWidth: 300, lineHeight: 20 });

      // Page 6: Entry 8 (Index 7): large full-width image
      let page6 = pdfDoc.addPage([800, 600]);
      let img7 = await loadImg(7);
      let title7 = formData.get(`title_7`) as string || "";
      if (img7) {
        const dims = img7.scaleToFit(700, 400);
        page6.drawImage(img7, { x: 400 - dims.width / 2, y: 330 - dims.height / 2, width: dims.width, height: dims.height });
      }
      if (title7) page6.drawText(title7, { x: 50, y: 80, size: 32, font: fontBold, maxWidth: 700 });
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
