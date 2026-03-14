"use client";
import { useMemo, useState } from "react";

// Defines the structure of the data we expect back from the API
type WebsiteFiles = {
  html: string;
  css: string;
};

// Helper function to trigger a browser download for a given string of text
function downloadTextFile(filename: string, content: string, mimeType: string) {
  // Create a Blob object representing the data as a file
  const blob = new Blob([content], { type: mimeType });
  // Create a temporary URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create an invisible <a> element, set its href to the Blob URL, and click it
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove(); // Remove the element after clicking

  // Clean up the URL to free memory
  URL.revokeObjectURL(url);
}

// A reusable UI component to display a block of code with "Copy" and "Download" buttons
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
  // Tracks whether the text was just copied to show a "Copied!" message
  const [copied, setCopied] = useState(false);

  // Writes the code block text to the user's clipboard
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      // Reset the "Copied!" text back to "Copy" after 1.2 seconds
      setTimeout(() => setCopied(false), 1200);
    } catch {
      alert("Copy failed. You can still manually select and copy the text.");
    }
  };

  // Triggers the download of this specific code block
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
            this in — or download it directly.
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

// The main page component
export default function Home() {
  // --- State Variables ---
  // Stores the manually pasted resume text
  const [resumeText, setResumeText] = useState("");
  // Stores the uploaded PDF file
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  // Stores the final generated HTML and CSS
  const [files, setFiles] = useState<WebsiteFiles | null>(null);
  // Tracks whether an API request is currently in progress
  const [loading, setLoading] = useState(false);

  // Prevents generation if both inputs are empty
  const canGenerate = useMemo(() => {
    return Boolean(resumeFile) || resumeText.trim().length > 0;
  }, [resumeFile, resumeText]);

  // Handles the submission to the backend API
  const handleGenerate = async () => {
    try {
      if (!canGenerate) {
        alert("Please upload a PDF or paste your resume text before generating.");
        return;
      }

      setLoading(true); // Start loading spinner/text

      let response: Response;

      // If a file was uploaded, send it as FormData
      if (resumeFile) {
        const formData = new FormData();
        formData.append("resume", resumeFile);

        response = await fetch("/api/generate", {
          method: "POST",
          body: formData,
        });
      } else {
        // Otherwise, send the pasted text as a JSON block
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

      // If successful, save the returned HTML and CSS directly into state
      setFiles({
        html: String(data?.html ?? ""),
        css: String(data?.css ?? ""),
      });
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false); // Stop loading spinner/text
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      {/* View 1: The Input Form (shown initially when there are no generated files) */}
      {!files && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white shadow-lg rounded-xl p-10 w-full max-w-3xl">
            <h1 className="text-4xl font-bold mb-4 text-center text-blue-900">
              AI One-Page Website Generator
            </h1>

            <p className="text-gray-600 mb-6 text-center">
              Upload a PDF or paste your resume text. You’ll get back two files:{" "}
              <span className="font-mono">index.html</span> and{" "}
              <span className="font-mono">styles.css</span>.
            </p>

            {/* File Upload Section */}
            <div className="mb-4">
              <label className="block font-semibold text-blue-900 mb-2">
                Upload PDF (optional)
              </label>

              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setResumeFile(file);
                  // Clear the text input if a file is uploaded
                  if (file) setResumeText("");
                }}
                className="block w-full text-sm text-gray-700
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-lg file:border-0
                          file:bg-gray-100 file:text-gray-800
                          hover:file:bg-gray-200"
              />

              {resumeFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: <span className="font-medium">{resumeFile.name}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 my-4">
              <div className="h-px bg-gray-200 flex-1" />
              <span className="text-sm text-gray-500">OR</span>
              <div className="h-px bg-gray-200 flex-1" />
            </div>

            {/* Text Input Section */}
            <textarea
              value={resumeText}
              onChange={(e) => {
                setResumeText(e.target.value);
                // Clear the file upload if text is typed
                if (e.target.value.trim().length > 0) setResumeFile(null);
              }}
              placeholder="Paste your resume text here..."
              className="w-full h-48 p-4 border rounded-lg mb-6 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
            />

            {/* Submit Button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-60"
            >
              {loading ? "Generating..." : "Generate Website Files"}
            </button>
          </div>
        </div>
      )}

      {/* View 2: The Generated Code (shown after the API successfully returns HTML/CSS) */}
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

              {/* Button to clear results and go back to the input form */}
              <button
                onClick={() => setFiles(null)}
                className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-black"
              >
                Back
              </button>
            </div>
          </div>

          {/* Render the HTML code block */}
          <CodeBlock
            title="HTML"
            value={files.html}
            filename="index.html"
            mimeType="text/html;charset=utf-8"
          />
          {/* Render the CSS code block */}
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