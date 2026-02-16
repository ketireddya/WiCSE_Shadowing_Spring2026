"use client";
import { useState } from "react";

export default function Home() {
  const [resumeText, setResumeText] = useState("");

const handleGenerate = async () => {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ resumeText }),
  });

  const data = await response.json();
  console.log("Backend response:", data);

  alert("Portfolio data generated! Check console.");
};


  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-xl p-10 w-full max-w-3xl">
        <h1 className="text-4xl font-bold mb-4 text-center text-blue-900">
          AI Resume Portfolio Builder
        </h1>

        <p className="text-gray-600 mb-6 text-center">
          Paste your resume below and generate a visually improved one-page portfolio.
        </p>

        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your resume text here..."
          className="w-full h-48 p-4 border rounded-lg mb-6 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
        />

        <button
          onClick={handleGenerate}
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
        >
          Generate Portfolio
        </button>
      </div>
    </main>
  );
}
