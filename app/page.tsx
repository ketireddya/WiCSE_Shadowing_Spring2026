"use client"; // This tells Next.js that this component runs in the user's browser, allowing browser features like interactivity (clicking buttons) and state.

import { useMemo, useState } from "react"; // Importing React tools. useState lets us store changing data, useMemo helps optimize performance.

// We define what our generated website files will contain: HTML and CSS text.
type WebsiteFiles = {
  html: string;
  css: string;
};

// Represents how the user chose to provide their resume: uploading a file, pasting text, or hasn't chosen yet (null).
type InputMode = "upload" | "paste" | null;

// A helper function that forces the browser to download a text file to the user's computer.
function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

// A component that displays a block of code (like HTML or CSS) on the screen.
// It also provides buttons to "Copy" the code or "Download" it as a file.
function CodeBlock({
  title,
  value,
  filename,
  mimeType,
}: {
  title: string;
  value: string;
  filename: string;
  mimeType: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      alert("Copy failed. You can still manually select and copy the text.");
    }
  };

  const download = () => {
    downloadTextFile(filename, value, mimeType);
  };

  return (
    <section className="glass-card p-6 mb-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="text-sm text-subtext mt-1">
            Save as <span className="font-mono text-blue-300">{filename}</span> or download directly.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <button
            onClick={copy}
            className="btn-secondary px-5 py-2 text-sm h-10"
          >
            {copied ? "Copied!" : "Copy"}
          </button>

          <button
            onClick={download}
            className="btn-primary px-5 py-2 text-sm h-10 w-auto"
          >
            Download
          </button>
        </div>
      </div>

      <pre className="w-full overflow-auto rounded-xl border border-slate-700/50 bg-[#020617]/80 p-5 text-sm text-blue-50 shadow-inner">
        <code>{value}</code>
      </pre>
    </section>
  );
}

// A simple Loading Screen component that shows a pulsing animation and some message text
// while we are waiting for the AI to generate the portfolio website.
function LoadingScreen() {
  return (
    <div className="bg-cinematic flex items-center justify-center absolute inset-0 z-50">
      <div className="glass-card p-12 text-center max-w-md w-full animate-fade-in flex flex-col items-center">
        <div className="relative w-20 h-20 mb-8">
          <div className="absolute inset-0 border-4 border-blue-500/20 rounded-2xl rotate-3" />
          <div className="absolute inset-0 border-4 border-blue-400 rounded-2xl animate-pulse" />
          <div className="absolute inset-0 bg-blue-500/20 blur-xl animate-pulse" />
        </div>

        <h2 className="text-2xl font-semibold text-white mb-3">
          Processing...
        </h2>
        <p className="text-subtext">
          Taking in your context and preparing your files.
        </p>
      </div>
    </div>
  );
}

/**
 * Adds a cleaner default portfolio style to the AI-generated files.
 * This keeps the output screen in your app the same,
 * but improves the actual generated website files the user downloads.
 */
function enhanceGeneratedFiles(html: string, css: string): WebsiteFiles {
  const enhancedCss = `
/* ===== Enhanced portfolio styling added by app ===== */
* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  padding: 0;
  font-family: Arial, Helvetica, sans-serif;
  background: linear-gradient(to bottom, #eef4ff 0%, #f8fbff 35%, #ffffff 100%);
  color: #16324f;
  text-align: center;
  line-height: 1.6;
}

body > * {
  width: min(960px, calc(100% - 32px));
  margin-left: auto;
  margin-right: auto;
}

header,
.hero,
.banner {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  padding: 56px 24px;
  border-radius: 24px;
  margin-top: 32px;
  margin-bottom: 28px;
  box-shadow: 0 18px 40px rgba(37, 99, 235, 0.22);
}

header h1,
.hero h1,
.banner h1 {
  margin: 0 0 12px 0;
  font-size: clamp(2rem, 4vw, 3.4rem);
  line-height: 1.15;
}

header p,
.hero p,
.banner p,
header a,
.hero a,
.banner a {
  color: white;
}

main,
.container,
.content,
.wrapper {
  width: min(960px, calc(100% - 32px));
  margin: 0 auto 40px auto;
}

section {
  background: white;
  border-radius: 22px;
  padding: 28px 24px;
  margin: 22px auto;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.08);
}

section h2 {
  margin-top: 0;
  margin-bottom: 14px;
  color: #1d4ed8;
  font-size: 1.55rem;
}

h1,
h2,
h3,
h4,
p,
li,
a,
span {
  text-align: center;
}

p {
  margin: 10px auto;
  max-width: 720px;
}

ul,
ol {
  list-style-position: inside;
  padding-left: 0;
  margin: 0 auto;
  max-width: 760px;
}

li {
  margin: 8px 0;
}

a {
  color: #1d4ed8;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

img {
  max-width: 100%;
  height: auto;
  border-radius: 14px;
}

footer {
  margin: 30px auto 50px auto;
  padding: 20px;
  color: #5b6b7f;
}

/* Helps common AI-generated wrappers look centered */
.resume-container,
.page-container,
.portfolio-container,
.content-container {
  width: min(960px, calc(100% - 32px));
  margin: 0 auto;
}

/* Turns common section-like wrappers into cards too */
.resume-section,
.portfolio-section,
.card,
.section-card {
  background: white;
  border-radius: 22px;
  padding: 28px 24px;
  margin: 22px auto;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.08);
}
`;

  let enhancedHtml = html;

  // If the HTML does not already include a viewport meta tag, add one.
  if (!/name=["']viewport["']/i.test(enhancedHtml)) {
    enhancedHtml = enhancedHtml.replace(
      /<head>/i,
      `<head>\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />`
    );
  }

  // If the HTML contains <main> without section tags,
  // wrap direct children divs in a common container class when possible.
  // This keeps the change lightweight and avoids breaking structure.
  if (!/class=["'][^"']*(portfolio-container|resume-container|content-container)[^"']*["']/i.test(enhancedHtml)) {
    enhancedHtml = enhancedHtml.replace(
      /<main>/i,
      `<main class="portfolio-container">`
    );
  }

  return {
    html: enhancedHtml,
    css: `${css}\n\n${enhancedCss}`,
  };
}

// This is the main "Home" page component. It contains all the logic for our website generator interface.
export default function Home() {
  // --- Route State ---
  // The new top-level state for route selection
  // 'selector': Initial screen asking the user which route to take
  // 'website': The original resume-to-website generator flow
  // 'pdf': The new creative PDF portfolio flow
  const [appRoute, setAppRoute] = useState<"selector" | "website" | "pdf">("selector");

  // --- Website Generator State ---
  // useState stores variables that, when changed, tell the page to update what's shown on screen.
  const [resumeText, setResumeText] = useState(""); // Stores whatever text the user pasted in the text box.
  const [resumeFile, setResumeFile] = useState<File | null>(null); // Stores the PDF file if the user chose to upload one.
  const [files, setFiles] = useState<WebsiteFiles | null>(null); // Stores the fully generated HTML and CSS code, if generation is complete.
  const [loading, setLoading] = useState(false); // A simple true/false state to know if we are currently waiting for the AI.
  const [inputMode, setInputMode] = useState<InputMode>(null); // Tracks whether they clicked "Upload" or "Paste".

  // --- Creative PDF Generator State ---
  // Array of 5 default empty entries to store inputs for the creative PDF portfolio.
  // Each entry has an image file, a title, and a description.
  const [pdfEntries, setPdfEntries] = useState(
    Array.from({ length: 5 }, () => ({
      image: null as File | null,
      title: "",
      description: "",
    }))
  );

  // States for frontend validation and loading
  const [pdfError, setPdfError] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  // Store the successfully generated file from our backend here
  const [pdfResult, setPdfResult] = useState<Blob | null>(null);

  const [selectedLayout, setSelectedLayout] = useState<"layout1" | "layout2" | "layout3">("layout1");

  // Control for number of works
  const numWorks = pdfEntries.length;
  const updateNumWorks = (newNum: number) => {
    if (newNum < 1 || newNum > 20) return;
    if (newNum > numWorks) {
      // Add more placeholder entries to the end
      const adds = Array.from({ length: newNum - numWorks }, () => ({
        image: null as File | null,
        title: "",
        description: "",
      }));
      setPdfEntries([...pdfEntries, ...adds]);
    } else {
      // Remove trailing entries from the end
      setPdfEntries(pdfEntries.slice(0, newNum));
    }
  };

  const handleLayoutChange = (layout: "layout1" | "layout2" | "layout3") => {
    setSelectedLayout(layout);
    setPdfError("");
    if (layout === "layout3") {
      updateNumWorks(8);
    }
  };

  // useMemo remembers ('memoizes') this true/false calculation so we don't recalculate it unnecessarily.
  // It returns 'true' if we either have a file uploaded OR if there's some text pasted. 
  // We use this to decide whether to enable or disable the "Generate Portfolio" button.
  const canGenerate = useMemo(() => {
    return Boolean(resumeFile) || resumeText.trim().length > 0;
  }, [resumeFile, resumeText]);

  // The function that runs when the user clicks the "Generate Portfolio" button for the website track.
  const handleGenerate = async () => {
    try {
      if (!canGenerate) {
        alert("Please upload a PDF or paste your resume text before generating.");
        return;
      }

      setLoading(true);

      let response: Response;

      if (resumeFile) {
        const formData = new FormData();
        formData.append("resume", resumeFile);

        response = await fetch("/api/generate", {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeText }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        alert(data?.error || "Something went wrong.");
        return;
      }

      const improvedFiles = enhanceGeneratedFiles(
        String(data?.html ?? ""),
        String(data?.css ?? "")
      );

      setFiles(improvedFiles);
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // The frontend function that runs when the user clicks the "Generate Portfolio" button for the PDF track.
  const handleGeneratePdf = async () => {
    // 1) Validate: check if every entry has a valid image, title, and description
    const isValid = pdfEntries.every((entry) => {
      if (!entry.image || entry.title.trim() === "") return false;
      if (selectedLayout !== "layout2" && entry.description.trim() === "") return false;
      return true;
    });

    if (!isValid) {
      setPdfError(
        selectedLayout === "layout2"
          ? "Please ensure every portfolio entry has an image and a title."
          : "Please check your entries. Make sure required images, titles, and descriptions are filled out before generating."
      );
      return; // Stop here if validation fails
    }

    // Clear any previous error and show our loading state
    setPdfError("");
    setPdfLoading(true);

    try {
      // 2) Build FormData structure to send specifically to our creative PDF backend
      const formData = new FormData();

      // We pass along the count of dynamically selected entries so the backend knows how many to loop through
      formData.append("numEntries", pdfEntries.length.toString());
      formData.append("layout", selectedLayout);

      console.log("Generating PDF with layout:", selectedLayout);

      // Loop across each submitted work and attach it natively to the multipart request
      pdfEntries.forEach((entry, i) => {
        // We know image exists because our frontend validation above caught it if it didn't!
        formData.append(`image_${i}`, entry.image!);
        formData.append(`title_${i}`, entry.title);
        formData.append(`description_${i}`, entry.description);
      });

      // 3) Send POST payload to our generated PDF API route securely without interrupting page flow
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF from server");
      }

      // 4) Convert the incoming API response directly into a standard Javascript Blob file
      const blob = await response.blob();
      setPdfResult(blob); // Render matching success screens mapped against existence of this Blob
    } catch (error) {
      console.error(error);
      setPdfError("An error occurred while generating the PDF. Please try again.");
    } finally {
      // Turn off the loading state regardless of if we succeed or error out safely
      setPdfLoading(false);
    }
  };

  // Helper action for downloading the generated PDF blob directly to the user's computer securely over DOM links
  const handleDownloadPdf = () => {
    if (!pdfResult) return;

    // We instantiate a URL tracking the isolated Blob within memory securely
    const url = URL.createObjectURL(pdfResult);
    const a = document.createElement("a");
    a.href = url;
    a.download = "creative-portfolio.pdf"; // This decides the name users save it natively as

    // Trigger phantom click, securely executing across standard browser restrictions cleanly
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url); // Clean up the URL object immediately after to free memory overhead smoothly
  };

  // Helper to update a single entry in the pdfEntries array
  const updatePdfEntry = (index: number, field: "image" | "title" | "description", value: any) => {
    const newEntries = [...pdfEntries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setPdfEntries(newEntries);
  };

  // 1. SELECTOR ROUTE
  if (appRoute === "selector") {
    return (
      <main className="bg-cinematic flex items-center justify-center">
        <div className="w-full max-w-[1200px] grid md:grid-cols-2 gap-12 lg:gap-20 items-center animate-fade-in py-10">

          {/* Left Side: Dramatic Typography Header */}
          <div className="text-center md:text-left">
            <h1 className="text-6xl lg:text-7xl font-bold tracking-[0.2em] uppercase leading-[1.1] mb-6 text-white drop-shadow-lg">
              Portfolio<br />Builder
            </h1>
            <p className="text-subtext text-lg max-w-md mx-auto md:mx-0 leading-relaxed">
              Create a simple on-demand personal website within minutes. Choose whether you want to upload your resume as a PDF or build a visual portfolio.
            </p>
          </div>

          {/* Right Side: Glass Selection Cards */}
          <div className="flex flex-col gap-6">
            <button
              onClick={() => setAppRoute("website")}
              className="glass-card glass-card-hover p-8 md:p-10 text-left relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start gap-5 relative z-10 w-full">
                <div className="shrink-0 w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">
                  <svg className="w-7 h-7 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">One-Page Website Generator</h3>
                  <p className="text-subtext text-sm leading-relaxed">Upload your resume PDF or paste text to automatically generate a coded modular landing page.</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setAppRoute("pdf")}
              className="glass-card glass-card-hover p-8 md:p-10 text-left relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start gap-5 relative z-10 w-full">
                <div className="shrink-0 w-14 h-14 rounded-xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center">
                  <svg className="w-7 h-7 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Creative PDF Portfolio</h3>
                  <p className="text-subtext text-sm leading-relaxed">Upload vibrant screenshots and project descriptions to generate a custom multi-page PDF.</p>
                </div>
              </div>
            </button>
          </div>

        </div>
      </main>
    );
  }

  // 2. CREATIVE PDF ROUTE
  if (appRoute === "pdf") {
    // Temporary Loading Screen: shown during API call
    if (pdfLoading && !pdfResult) {
      return (
        <main className="bg-cinematic flex items-center justify-center absolute inset-0 z-50">
          <div className="glass-card p-12 text-center max-w-md w-full animate-fade-in flex flex-col items-center">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-2xl rotate-3" />
              <div className="absolute inset-0 border-4 border-indigo-400 rounded-2xl animate-pulse" />
              <div className="absolute inset-0 bg-indigo-500/20 blur-xl animate-pulse" />
              {/* inner icon stub */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-indigo-300 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-3">
              Generating your PDF
            </h2>
            <p className="text-subtext">
              Laying out pages, embedding full-resolution images, and rendering typography.
            </p>
          </div>
        </main>
      );
    }

    // Success Screen: shown after the loading is complete securely processing API Blobs into DOM clicks natively
    if (!pdfLoading && pdfResult) {
      return (
        <main className="bg-cinematic flex items-center justify-center">
          <div className="glass-card p-12 w-full max-w-lg text-center animate-fade-in flex flex-col items-center">
            <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center justify-center mb-8">
              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>

            <h1 className="text-3xl font-bold mb-10 text-white">
              Your portfolio is ready!
            </h1>

            <button
              onClick={handleDownloadPdf}
              className="btn-primary py-4 text-lg mb-6 w-full"
            >
              Download PDF
            </button>

            <button
              onClick={() => {
                setPdfResult(null); // Reset to go back to editing seamlessly
              }}
              className="mt-2 text-indigo-300 hover:text-white transition font-medium"
            >
              Go Back and Edit
            </button>
          </div>
        </main>
      );
    }

    return (
      <main className="bg-cinematic flex flex-col items-center py-10 animate-fade-in relative">
        <div className="w-full max-w-5xl mb-6 px-4">
          <button
            onClick={() => setAppRoute("selector")}
            className="flex items-center gap-2 text-indigo-300 hover:text-white transition font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to selection
          </button>
        </div>

        <div className="glass-card p-6 md:p-10 w-full max-w-5xl mx-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center text-white tracking-wide uppercase">
            Creative PDF
          </h1>
          <p className="text-subtext mb-10 text-center max-w-2xl mx-auto text-lg leading-relaxed">
            Provide portfolio entries to build your creative PDF portfolio. For each entry, upload an image and add a title and description.
          </p>

          <div className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4">Choose your layout</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleLayoutChange("layout1")}
                className={`p-5 rounded-2xl border text-left transition-all ${selectedLayout === "layout1" ? "bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.2)]" : "bg-slate-900/40 border-slate-700/50 hover:bg-slate-800"}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-semibold text-white">Layout 1 (Default)</h3>
                  {selectedLayout === "layout1" && <span className="text-blue-400 text-sm font-medium">Selected</span>}
                </div>
                <p className="text-sm text-subtext leading-relaxed mt-2">Image + title + description. One project per page.</p>
              </button>

              <button
                onClick={() => handleLayoutChange("layout2")}
                className={`p-5 rounded-2xl border text-left transition-all ${selectedLayout === "layout2" ? "bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.2)]" : "bg-slate-900/40 border-slate-700/50 hover:bg-slate-800"}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-semibold text-white">Layout 2</h3>
                  {selectedLayout === "layout2" && <span className="text-blue-400 text-sm font-medium">Selected</span>}
                </div>
                <p className="text-sm text-subtext leading-relaxed mt-2">Image-focused gallery. Titles only, no descriptions.</p>
              </button>

              <button
                onClick={() => handleLayoutChange("layout3")}
                className={`p-5 rounded-2xl border text-left transition-all ${selectedLayout === "layout3" ? "bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.2)]" : "bg-slate-900/40 border-slate-700/50 hover:bg-slate-800"}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-semibold text-white">Layout 3</h3>
                  {selectedLayout === "layout3" && <span className="text-blue-400 text-sm font-medium">Selected</span>}
                </div>
                <p className="text-sm text-subtext leading-relaxed mt-2">Editorial layout with fixed structure and page count.</p>
              </button>
            </div>

            {selectedLayout === "layout3" && (
              <div className="mt-4 p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl animate-fade-in">
                <p className="text-indigo-200 text-sm font-medium flex items-center gap-2">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  This layout uses a fixed number of pages and cannot be customized.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900/40 p-6 rounded-2xl mb-10 border border-slate-700/50 shadow-inner">
            <span className="font-semibold text-white text-lg">Number of portfolio works:</span>
            {selectedLayout === "layout3" ? (
              <span className="text-indigo-300 font-medium bg-slate-800/80 px-5 py-2.5 rounded-lg border border-indigo-500/20 mt-4 sm:mt-0 shadow-sm inline-flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Number of works is fixed for this layout.
              </span>
            ) : (
              <div className="flex items-center gap-6 mt-4 sm:mt-0 bg-slate-800/80 rounded-full p-2 border border-slate-700/50">
                <button
                  onClick={() => updateNumWorks(numWorks - 1)}
                  disabled={numWorks <= 1}
                  className="w-10 h-10 rounded-full bg-slate-700/50 text-white flex items-center justify-center hover:bg-slate-600 disabled:opacity-30 transition cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                </button>
                <span className="font-bold text-xl w-6 text-center text-white">{numWorks}</span>
                <button
                  onClick={() => updateNumWorks(numWorks + 1)}
                  disabled={numWorks >= 20}
                  className="w-10 h-10 rounded-full bg-blue-600/80 text-white flex items-center justify-center hover:bg-blue-500 disabled:opacity-30 transition shadow-lg cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            )}
          </div>

          <div className="space-y-8">
            {pdfEntries.map((entry, index) => {
              const showDescription = selectedLayout !== "layout2";

              return (
                <div key={index} className="bg-slate-900/30 border border-slate-700/50 rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row gap-8 shadow-sm">

                  {/* Left side: Image Upload */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-medium text-indigo-300 mb-3 text-sm uppercase tracking-wider">
                      Work {index + 1} Image
                    </h3>
                    <div className="input-glass h-full min-h-[240px] flex flex-col items-center justify-center relative overflow-hidden group border-dashed hover:border-blue-500/50 transition-colors">
                      <input
                        type="file"
                        accept=".jpeg, .jpg, .png"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          updatePdfEntry(index, "image", file);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center justify-center pointer-events-none text-center">
                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <span className="text-white font-medium mb-1">Click to upload image</span>
                        <span className="text-slate-500 text-xs uppercase tracking-wider">JPEG, PNG</span>
                      </div>

                      {entry.image && (
                        <div className="absolute inset-0 bg-[#020617] flex items-center justify-center p-4 border-2 border-blue-500/50 rounded-xl z-20 pointer-events-none">
                          <div className="text-center w-full">
                            <svg className="w-8 h-8 text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p className="text-sm text-blue-100 truncate w-full px-4 text-center">
                              {entry.image.name}
                            </p>
                            <span className="inline-block mt-3 px-3 py-1 bg-blue-500/10 text-blue-300 text-xs font-medium rounded-full border border-blue-500/20">
                              Click to replace image
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side: Title & Description */}
                  <div className="flex-1 flex flex-col gap-6">
                    <div>
                      <label className="block font-medium text-indigo-300 mb-2 text-sm uppercase tracking-wider">
                        Work {index + 1} Title
                      </label>
                      <input
                        type="text"
                        value={entry.title}
                        onChange={(e) => updatePdfEntry(index, "title", e.target.value)}
                        placeholder="e.g. Modern E-commerce Redesign"
                        className="input-glass"
                      />
                    </div>
                    {showDescription ? (
                      <div className="flex-1 flex flex-col">
                        <label className="block font-medium text-indigo-300 mb-2 text-sm uppercase tracking-wider">
                          Work {index + 1} Description
                        </label>
                        <textarea
                          value={entry.description}
                          onChange={(e) => updatePdfEntry(index, "description", e.target.value)}
                          placeholder="Describe the project overview, your personal role, and the key outcomes..."
                          className="input-glass flex-1 min-h-[140px] resize-y"
                        />
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-700/40 rounded-xl bg-slate-800/10 opacity-60 pointer-events-none p-4 text-center pb-8 pt-8">
                        <svg className="w-6 h-6 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        <span className="text-sm text-slate-400">Description hidden for this layout</span>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

          {/* Validation Error Banner */}
          {pdfError && (
            <div className="mt-8 p-5 bg-red-900/30 border border-red-500/50 text-red-200 rounded-xl flex items-center gap-4 animate-fade-in font-medium">
              <svg className="w-6 h-6 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {pdfError}
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-slate-700/50 lg:w-1/2 mx-auto">
            <button
              onClick={handleGeneratePdf}
              className="btn-primary py-4 text-lg w-full"
            >
              Generate Portfolio
            </button>
          </div>
        </div>
      </main>
    );
  }

  // 3. ONE-PAGE WEBSITE ROUTE
  // Uses the original logic mapping to the new visual style
  return (
    <main className="bg-cinematic flex flex-col items-center py-10 animate-fade-in relative min-h-screen z-0">
      {/* If 'loading' is true and we don't have 'files' yet, show the LoadingScreen component */}
      {loading && !files && <LoadingScreen />}

      {/* If we aren't loading and don't have files yet, show the initial input form */}
      {!loading && !files && (
        <div className="flex flex-col items-center w-full max-w-4xl px-4 relative z-10">
          <div className="w-full mb-6">
            <button
              onClick={() => setAppRoute("selector")}
              className="flex items-center gap-2 text-indigo-300 hover:text-white transition font-medium w-max"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to selection
            </button>
          </div>

          <div className="glass-card p-6 md:p-12 w-full text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white uppercase tracking-wide">
              Website Generator
            </h1>

            <p className="text-subtext mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
              Upload your resume as a PDF or paste the content directly, and our engine will code a responsive portfolio for you instantly.
            </p>

            <div className="flex justify-center mb-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/60 p-2 border border-slate-700/50 shadow-inner">
                <button
                  onClick={() => {
                    setInputMode("upload");
                    setResumeText("");
                  }}
                  className={`px-6 py-3 rounded-full transition-all font-medium duration-300 ${inputMode === "upload"
                    ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                    : "bg-transparent text-indigo-200 hover:text-white hover:bg-slate-800"
                    }`}
                >
                  Upload PDF
                </button>

                <button
                  onClick={() => {
                    setInputMode("paste");
                    setResumeFile(null);
                  }}
                  className={`px-6 py-3 rounded-full transition-all font-medium duration-300 ${inputMode === "paste"
                    ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                    : "bg-transparent text-indigo-200 hover:text-white hover:bg-slate-800"
                    }`}
                >
                  Copy / Paste
                </button>
              </div>
            </div>

            <div
              className={`transition-all duration-500 ease-out overflow-hidden text-left mx-auto max-w-2xl ${inputMode === "upload"
                ? "opacity-100 translate-y-0 max-h-72 mb-8"
                : "opacity-0 -translate-y-4 max-h-0 mb-0 pointer-events-none"
                }`}
            >
              <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-8">
                <label className="block font-medium text-indigo-300 mb-4 uppercase tracking-wider text-sm">
                  Select your PDF resume
                </label>

                <div className="input-glass h-[140px] flex flex-col items-center justify-center relative overflow-hidden group border-dashed hover:border-blue-500/50 transition-colors">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setResumeFile(file);
                      if (file) setResumeText("");
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center pointer-events-none transition-transform group-hover:scale-105">
                    <svg className="w-8 h-8 text-indigo-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    <span className="text-white font-medium">Click to upload PDF</span>
                  </div>

                  {resumeFile && (
                    <div className="absolute inset-0 bg-[#020617] flex items-center justify-center p-4 border-2 border-blue-500/50 rounded-xl z-20 pointer-events-none">
                      <div className="text-center w-full">
                        <svg className="w-8 h-8 text-green-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="text-sm font-medium text-blue-100 truncate w-full px-4">
                          {resumeFile.name}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div
              className={`transition-all duration-500 ease-out overflow-hidden text-left mx-auto max-w-2xl ${inputMode === "paste"
                ? "opacity-100 translate-y-0 max-h-[32rem] mb-8"
                : "opacity-0 -translate-y-4 max-h-0 mb-0 pointer-events-none"
                }`}
            >
              <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-8">
                <label className="block font-medium text-indigo-300 mb-4 uppercase tracking-wider text-sm">
                  Paste your resume text
                </label>

                <textarea
                  value={resumeText}
                  onChange={(e) => {
                    setResumeText(e.target.value);
                    if (e.target.value.trim().length > 0) setResumeFile(null);
                  }}
                  placeholder="Paste all text from your resume here..."
                  className="input-glass h-[200px] resize-y"
                />
              </div>
            </div>

            <div className="max-w-2xl mx-auto mt-6 pt-6 border-t border-slate-700/50">
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="btn-primary py-4 text-lg"
              >
                Generate Website
              </button>
            </div>
          </div>
        </div>
      )}

      {/* If generation is entirely finished and 'files' exist, show the result screen with the code blocks */}
      {files && (
        <div className="w-full max-w-5xl mx-auto relative z-10 animate-fade-in flex flex-col gap-6 px-4">
          <div className="glass-card p-8 text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">Website Ready</h1>
              <p className="text-subtext">
                Copy the code below or save the raw files.
              </p>
            </div>

            <button
              onClick={() => {
                setFiles(null);
                setLoading(false);
              }}
              className="btn-secondary px-6 py-3 w-full md:w-auto text-lg"
            >
              Start Over
            </button>
          </div>

          <CodeBlock
            title="HTML Document"
            value={files.html}
            filename="index.html"
            mimeType="text/html;charset=utf-8"
          />

          <CodeBlock
            title="CSS Stylesheet"
            value={files.css}
            filename="styles.css"
            mimeType="text/css;charset=utf-8"
          />
        </div>
      )}
    </main>
  );
}