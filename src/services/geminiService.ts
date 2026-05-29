import { GoogleGenAI, Type } from "@google/genai";
import { NewsItem, PostTone } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const geminiService = {
  generateSocialPosts: async (newsId: string, newsTitle: string, newsSummary: string, newsSource: string, tone: PostTone) => {
    const prompt = `
      You are an expert social media manager. Generate high-quality social media posts for the following tech news:
      
      ID: ${newsId}
      Title: ${newsTitle}
      Summary: ${newsSummary}
      Source: ${newsSource}
      Tone: ${tone}
      
      Please generate:
      1. A LinkedIn post (professional, engaging, uses relevant hashtags, MUST include the exact Source URL).
      2. A Twitter/X post (catchy, short, under 280 characters, uses hashtags, MUST include the exact Source URL).
      3. A Twitter/X thread (3-5 parts, breaking down the news, the final part MUST include the exact Source URL).
      4. An imagePrompt for an AI image generator to create a compelling visual for this post.
      
      Return the result in JSON format.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            linkedin: { type: Type.STRING },
            twitter: { type: Type.STRING },
            thread: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            imagePrompt: { type: Type.STRING }
          },
          required: ["linkedin", "twitter", "thread", "imagePrompt"]
        }
      }
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      console.error("Failed to parse Gemini response", e);
      throw new Error("Failed to generate posts");
    }
  },

  chat: async (message: string, history: { role: 'user' | 'assistant', content: string }[]) => {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "You are TechBuddy, a smart friend who helps users stay updated with tech news and generate social media content. You are helpful, knowledgeable, and have a friendly tech-savvy personality."
      }
    });

    // Note: The SDK might handle history differently, but for simplicity we can just send the message
    // or use the chat session if we want to maintain state.
    // For now, let's just use generateContent for simplicity or chat session if available.
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: "You are TechBuddy, a smart friend who helps users stay updated with tech news and generate social media content. You are helpful, knowledgeable, and have a friendly tech-savvy personality."
      }
    });

    return response.text;
  },

  enhanceLinkedInPost: async (postContent: string) => {
    const prompt = `
      Please modify the following LinkedIn post to include a thought-provoking question to encourage engagement and add highly relevant hashtags related to the tech news topic. If applicable, suggest what image or visual should accompany the post.
      
      Original Post:
      ${postContent}
      
      Return ONLY the revised post content. Do not wrap in JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text;
  }
};
