import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { resumeText } = body;

  console.log("Received resume text:", resumeText);

  // For now, return mock structured data
  const mockResponse = {
    name: "Generated Name",
    summary: "This is a generated professional summary.",
    sections: [
      {
        title: "Experience",
        items: ["Improved system performance by 30%", "Led team of 5 developers"]
      },
      {
        title: "Education",
        items: ["B.S. in Computer Science"]
      }
    ]
  };

  return NextResponse.json(mockResponse);
}
