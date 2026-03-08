import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
}

export async function generateStoryOpening(file: File): Promise<string> {
  const base64Data = await fileToBase64(file);
  const mimeType = file.type;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        {
          text: "Analyze the mood and scene of this image. Then, ghostwrite a captivating opening paragraph to a story set in that world. Make it evocative and immersive.",
        },
      ],
    },
  });

  return response.text || "";
}

export async function generateSpeech(text: string): Promise<string | undefined> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Zephyr' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio;
}

export function createStoryChat(storyContext: string | null) {
  const contextPrompt = storyContext 
    ? `\n\nHere is the opening paragraph of the story we are working on:\n"${storyContext}"` 
    : "";

  return ai.chats.create({
    model: "gemini-3.1-pro-preview",
    config: {
      systemInstruction: "You are a creative writing assistant. Help the user brainstorm ideas, expand on the story, or answer questions about the world established in the opening paragraph." + contextPrompt,
    },
  });
}
