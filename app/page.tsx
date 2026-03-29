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
    <section className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h2 className="text-xl font-semibold text-black">{title}</h2>
          <p className="text-sm text-gray-600">
            Create a file named <span className="font-mono">{filename}</span> and paste
            this in - or download it directly.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={copy}
            className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-black"
          >
            {copied ? "Copied!" : "Copy"}
          </button>

          <button
            onClick={download}
            className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-black"
          >
            Download
          </button>
        </div>
      </div>

      <pre className="w-full overflow-auto rounded-lg border bg-gray-50 p-4 text-sm text-black">
        <code>{value}</code>
      </pre>
    </section>
  );
}

// A simple Loading Screen component that shows a pulsing animation and some message text
// while we are waiting for the AI to generate the portfolio website.
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="bg-white shadow-lg rounded-xl p-10 w-full max-w-xl text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 border-4 border-black rounded-md animate-pulse" />
        </div>

        <h2 className="text-2xl font-semibold text-black mb-2">
          Generating your portfolio
        </h2>
        <p className="text-gray-600">
          Taking in your resume, sending it to the AI, and preparing your website files.
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

  // Helper to update a single entry in the pdfEntries array
  const updatePdfEntry = (index: number, field: "image" | "title" | "description", value: any) => {
    const newEntries = [...pdfEntries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setPdfEntries(newEntries);
  };

  // 1. SELECTOR ROUTE
  if (appRoute === "selector") {
    return (
      <main className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-center">
        <div className="bg-white shadow-lg rounded-xl p-10 w-full max-w-3xl">
          <h1 className="text-4xl font-bold mb-4 text-center text-blue-900">
            Portfolio Generator
          </h1>
          <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
            Which type of portfolio do you want to create?
          </p>

          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 p-2 border border-gray-200">
              <button
                onClick={() => setAppRoute("website")}
                className="px-5 py-2.5 rounded-full transition font-medium bg-transparent text-gray-700 hover:bg-white"
              >
                One-Page Portfolio Website
              </button>

              <button
                onClick={() => setAppRoute("pdf")}
                className="px-5 py-2.5 rounded-full transition font-medium bg-transparent text-gray-700 hover:bg-white"
              >
                Creative PDF Portfolio
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 2. CREATIVE PDF ROUTE
  if (appRoute === "pdf") {
    return (
      <main className="min-h-screen bg-gray-100 p-6 flex flex-col items-center py-10">
        <div className="w-full max-w-4xl mb-6">
          <button 
            onClick={() => setAppRoute("selector")} 
            className="text-gray-600 hover:text-black transition flex items-center gap-2 font-medium"
          >
            &larr; Back to selection
          </button>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-10 w-full max-w-4xl">
          <h1 className="text-4xl font-bold mb-4 text-center text-blue-900">
            AI One-Page Website Generator
          </h1>
          <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
            Provide exactly 5 portfolio entries to build your creative PDF portfolio. For each entry, upload an image and add a title and description.
          </p>

          <div className="space-y-8">
            {pdfEntries.map((entry, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-6 bg-gray-50 flex flex-col md:flex-row gap-6">
                
                {/* Left side: Image Upload */}
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-3">
                    Work {index + 1} Image
                  </h3>
                  <div className="border border-gray-300 rounded-lg p-6 bg-white text-center h-full min-h-[220px] flex flex-col items-center justify-center">
                    <input 
                      type="file" 
                      accept=".jpeg, .jpg, .png"
                      onChange={(e) => {
                         const file = e.target.files?.[0] || null;
                         updatePdfEntry(index, "image", file);
                      }}
                      className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-800 hover:file:bg-gray-200"
                    />
                    {entry.image && (
                      <p className="mt-4 text-sm text-gray-600 truncate max-w-full">
                        Selected: <span className="font-medium">{entry.image.name}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right side: Title & Description */}
                <div className="flex-1 flex flex-col">
                  <div className="mb-4">
                    <label className="block font-semibold text-blue-900 mb-2">
                       Work {index + 1} Title
                    </label>
                    <input 
                      type="text" 
                      value={entry.title}
                      onChange={(e) => updatePdfEntry(index, "title", e.target.value)}
                      placeholder="e.g. Modern E-commerce Redesign"
                      className="w-full p-3 border rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black bg-white"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <label className="block font-semibold text-blue-900 mb-2">
                       Work {index + 1} Description
                    </label>
                    <textarea 
                      value={entry.description}
                      onChange={(e) => updatePdfEntry(index, "description", e.target.value)}
                      placeholder="Describe the project, your role, and the outcomes..."
                      className="w-full flex-1 p-3 border rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black bg-white min-h-[120px]"
                    />
                  </div>
                </div>
                
              </div>
            ))}
          </div>
          
          {/* A disabled button since generation backend is not yet implemented */}
          <button
            disabled
            className="w-full mt-8 bg-black text-white py-3 rounded-lg opacity-50 cursor-not-allowed"
          >
            Generate PDF (Coming Soon)
          </button>
        </div>
      </main>
    );
  }

  // 3. ONE-PAGE WEBSITE ROUTE
  // Uses the original code
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      {/* If 'loading' is true and we don't have 'files' yet, show the LoadingScreen component */}
      {loading && !files && <LoadingScreen />}

      {/* If we aren't loading and don't have files yet, show the initial input form */}
      {!loading && !files && (
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="w-full max-w-3xl mb-6">
            <button 
              onClick={() => setAppRoute("selector")} 
              className="text-gray-600 hover:text-black transition flex items-center gap-2 font-medium"
            >
              &larr; Back to selection
            </button>
          </div>

          <div className="bg-white shadow-lg rounded-xl p-10 w-full max-w-3xl">
            <h1 className="text-4xl font-bold mb-4 text-center text-blue-900">
              AI One-Page Website Generator
            </h1>

            <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
              Turn your resume into a simple personal website. Choose whether you want
              to upload your resume as a PDF or paste the content directly, and the
              program will generate your website files for you.
            </p>

            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 p-2 border border-gray-200">
                <button
                  onClick={() => {
                    setInputMode("upload");
                    setResumeText("");
                  }}
                  className={`px-5 py-2.5 rounded-full transition font-medium ${inputMode === "upload"
                      ? "bg-black text-white"
                      : "bg-transparent text-gray-700 hover:bg-white"
                    }`}
                >
                  Upload your resume
                </button>

                <button
                  onClick={() => {
                    setInputMode("paste");
                    setResumeFile(null);
                  }}
                  className={`px-5 py-2.5 rounded-full transition font-medium ${inputMode === "paste"
                      ? "bg-black text-white"
                      : "bg-transparent text-gray-700 hover:bg-white"
                    }`}
                >
                  Copy / Paste
                </button>
              </div>
            </div>

            <div
              className={`transition-all duration-500 ease-out overflow-hidden ${inputMode === "upload"
                  ? "opacity-100 translate-y-0 max-h-72 mb-6"
                  : "opacity-0 -translate-y-1 max-h-0 mb-0 pointer-events-none"
                }`}
            >
              <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                <label className="block font-semibold text-blue-900 mb-3">
                  Upload your PDF resume
                </label>

                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setResumeFile(file);
                    if (file) setResumeText("");
                  }}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white file:text-gray-800 hover:file:bg-gray-200"
                />

                {resumeFile && (
                  <p className="mt-3 text-sm text-gray-600">
                    Selected: <span className="font-medium">{resumeFile.name}</span>
                  </p>
                )}
              </div>
            </div>

            <div
              className={`transition-all duration-500 ease-out overflow-hidden ${inputMode === "paste"
                  ? "opacity-100 translate-y-0 max-h-[28rem] mb-6"
                  : "opacity-0 -translate-y-1 max-h-0 mb-0 pointer-events-none"
                }`}
            >
              <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                <label className="block font-semibold text-blue-900 mb-3">
                  Paste your resume content
                </label>

                <textarea
                  value={resumeText}
                  onChange={(e) => {
                    setResumeText(e.target.value);
                    if (e.target.value.trim().length > 0) setResumeFile(null);
                  }}
                  placeholder="Paste your resume text here..."
                  className="w-full h-56 p-4 border rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black bg-white"
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Generate Portfolio
            </button>
          </div>
        </div>
      )}

      {/* If generation is entirely finished and 'files' exist, show the result screen with the code blocks */}
      {files && (
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6 text-black">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold">Your website files are ready</h1>
                <p className="text-gray-700 mt-2">
                  You can copy/paste the code or use the Download buttons to save the
                  files directly.
                </p>
                <p className="text-gray-700 mt-3">
                  Then open <span className="font-mono">index.html</span> in your browser.
                </p>
              </div>

              <button
                onClick={() => {
                  setFiles(null);
                  setLoading(false);
                }}
                className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-black"
              >
                Back
              </button>
            </div>
          </div>

          <CodeBlock
            title="HTML"
            value={files.html}
            filename="index.html"
            mimeType="text/html;charset=utf-8"
          />

          <CodeBlock
            title="CSS"
            value={files.css}
            filename="styles.css"
            mimeType="text/css;charset=utf-8"
          />
        </div>
      )}
    </main>
  );
}