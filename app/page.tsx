"use client";
import { useMemo, useState } from "react";

type WebsiteFiles = {
  html: string;
  css: string;
};

type InputMode = "upload" | "paste" | null;

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

export default function Home() {
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [files, setFiles] = useState<WebsiteFiles | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>(null);

  const canGenerate = useMemo(() => {
    return Boolean(resumeFile) || resumeText.trim().length > 0;
  }, [resumeFile, resumeText]);

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

      setFiles({
        html: String(data?.html ?? ""),
        css: String(data?.css ?? ""),
      });
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      {loading && !files && <LoadingScreen />}

      {!loading && !files && (
        <div className="min-h-screen flex items-center justify-center">
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