import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type WebsiteFiles = {
  html: string;
  css: string;
};

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const pdfjs: any = await import("pdfjs-dist/legacy/build/pdf.mjs");

  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.mjs",
    import.meta.url
  ).toString();

  const uint8 = new Uint8Array(buffer);
  const loadingTask = pdfjs.getDocument({ data: uint8 });
  const pdf = await loadingTask.promise;

  let fullText = "";
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    const pageText = content.items
      .map((it: any) => (typeof it?.str === "string" ? it.str : ""))
      .join(" ");

    fullText += pageText + "\n";
  }

  return fullText.trim();
}

/**
 * Ensures links remain visible in dark sections (header/footer),
 * even if the model generates a global `a { color: ... }` that conflicts.
 *
 * We append these rules at the end so they win in CSS specificity & order.
 */
function enforceLinkVisibility(css: string): string {
  const guard = `
/* --- Added by API: ensure links remain visible in dark sections --- */
header a, header a:visited {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 3px;
}
header a:hover { opacity: 0.9; }

footer a, footer a:visited {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 3px;
}
footer a:hover { opacity: 0.9; }
/* --- End API guard --- */
`.trim();

  // avoid duplicating if the API is called multiple times during dev hot reloads
  if (css.includes("Added by API: ensure links remain visible")) return css;

  return `${css.trim()}\n\n${guard}\n`;
}

/**
 * Fixes empty anchors like: <a href="..."></a>
 * by using the href as visible link text.
 */
function fixEmptyAnchors(html: string): string {
  return html.replace(
    /<a\s+([^>]*href="([^"]+)"[^>]*)>\s*<\/a>/g,
    (_match, attrs, href) => `<a ${attrs}>${href}</a>`
  );
}

async function generateWebsiteFiles(resumeText: string): Promise<WebsiteFiles> {
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You generate clean, beginner-friendly static websites. Return ONLY valid JSON. No markdown. No extra text.",
      },
      {
        role: "user",
        content: `
Create a fully working, single-page personal portfolio website based on this resume text.

Return ONLY valid JSON in this exact structure:
{
  "html": "string",
  "css": "string"
}

STRICT REQUIREMENTS:
- HTML must be a complete document starting with <!doctype html>.
- HTML must link CSS like: <link rel="stylesheet" href="styles.css">
- Use only HTML + CSS (no frameworks).
- Make it modern, clean, and responsive.
- If hyperlinks exist, ALWAYS include visible link text inside <a>...</a>. Never output empty <a href="..."></a>.
- IMPORTANT: If you use a dark header/footer background, ensure links in those areas are a contrasting color (or inherit the header/footer text color). Do NOT set links to the same color as the background.

Resume text:
${resumeText}
        `.trim(),
      },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as Partial<WebsiteFiles>;

  let html = typeof parsed.html === "string" ? parsed.html : "";
  let css = typeof parsed.css === "string" ? parsed.css : "";

  if (!html.trim() || !css.trim()) {
    throw new Error("Model did not return both html and css.");
  }

  // 1) Fix invisible/clickable links caused by empty anchor tags
  html = fixEmptyAnchors(html);

  // 2) Prevent “links match dark background” in header/footer
  css = enforceLinkVisibility(css);

  return { html, css };
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let resumeText = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const fileLike = formData.get("resume");

      if (!fileLike || !(fileLike instanceof Blob)) {
        return NextResponse.json(
          { error: "No file uploaded. Field name must be 'resume'." },
          { status: 400 }
        );
      }

      const mime = (fileLike as Blob).type || "";
      if (mime !== "application/pdf") {
        return NextResponse.json(
          { error: "File must be a PDF (application/pdf)." },
          { status: 400 }
        );
      }

      const arrayBuffer = await fileLike.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      resumeText = await extractTextFromPdf(buffer);

      if (!resumeText) {
        return NextResponse.json(
          {
            error:
              "Could not extract text from PDF. If it’s scanned/image-based, you’ll need OCR.",
          },
          { status: 400 }
        );
      }
    } else {
      const body = await request.json().catch(() => ({}));
      resumeText = String((body as any)?.resumeText ?? "").trim();

      if (!resumeText) {
        return NextResponse.json({ error: "Resume text is empty." }, { status: 400 });
      }
    }

    const files = await generateWebsiteFiles(resumeText);
    return NextResponse.json(files);
  } catch (err: unknown) {
    console.error("SERVER ERROR:", err);
    return NextResponse.json(
      {
        error: "Failed to generate website files.",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}