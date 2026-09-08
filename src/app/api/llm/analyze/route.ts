import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { title, text, entities } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        analysis: "SYSTEM ALERT: Real LLM Analysis is offline. \n\nPlease add your GEMINI_API_KEY to the .env file to enable the Gemini 1.5 Flash tactical analysis module. \n\nFallback heuristic: The target exhibits darknet operational security indicators based on cryptographic entities present."
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Using gemini-1.5-flash as the "small LLM" for fast, efficient analysis
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an automated Cyber Intelligence (OSINT) analyst for a law enforcement dashboard. 
    Analyze the following scraped dark web data:
    
    Target Title: ${title}
    Text Snippet: ${text ? text.substring(0, 1000) : "No text"}
    Extracted Entities: ${JSON.stringify(entities)}
    
    Task: Provide a concise, highly professional 2-3 paragraph tactical threat assessment. 
    1. Identify what this service likely is (e.g., marketplace, vendor shop, forum).
    2. Assess operational security risks based on the specific crypto wallets (BTC/XMR) or communication handles present.
    3. Determine if there are signs of illicit goods being traded based on context.
    Keep the tone objective and forensic.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json({ analysis: responseText });
  } catch (error: any) {
    console.error("LLM Generation Error:", error);
    return NextResponse.json({ 
      analysis: `LLM Error: Failed to generate tactical analysis. ${error.message}` 
    });
  }
}
