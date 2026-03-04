"use client";
import { useMemo, useState } from "react";

type WebsiteFiles = {
  html: string;
  css: string;
};

function CodeBlock({
  title,
  value,
  filename,
}: {
  title: string;
  value: string;
  filename: string;
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

  return (
    <section className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h2 className="text-xl font-semibold text-black">{title}</h2>
          <p className="text-sm text-gray-600">
            Create a file named <span className="font-mono">{filename}</span> and paste
            this in.
          </p>
        </div>

        <button
          onClick={copy}
          className="shrink-0 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-black"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <pre className="w-full overflow-auto rounded-lg border bg-gray-50 p-4 text-sm text-black">
        <code>{value}</code>
      </pre>
    </section>
  );
}

export default function Home() {
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [files, setFiles] = useState<WebsiteFiles | null>(null);
  const [loading, setLoading] = useState(false);

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

      // Expecting { html, css }
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

            <textarea
              value={resumeText}
              onChange={(e) => {
                setResumeText(e.target.value);
                if (e.target.value.trim().length > 0) setResumeFile(null);
              }}
              placeholder="Paste your resume text here..."
              className="w-full h-48 p-4 border rounded-lg mb-6 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
            />

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

      {files && (
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6 text-black">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold">Your website files are ready</h1>
                <p className="text-gray-700 mt-2">
                  In your IDE, create a folder (any name), then create two files:
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-800">
                  <li>
                    <span className="font-mono">index.html</span>
                  </li>
                  <li>
                    <span className="font-mono">styles.css</span>
                  </li>
                </ul>
                <p className="text-gray-700 mt-3">
                  Then open <span className="font-mono">index.html</span> in your browser.
                </p>
              </div>

              <button
                onClick={() => setFiles(null)}
                className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-black"
              >
                Back
              </button>
            </div>
          </div>

          <CodeBlock title="HTML" value={files.html} filename="index.html" />
          <CodeBlock title="CSS" value={files.css} filename="styles.css" />
        </div>
      )}
    </main>
  );
}