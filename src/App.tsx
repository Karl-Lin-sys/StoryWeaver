import React, { useState } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { StoryDisplay } from './components/StoryDisplay';
import { Chatbot } from './components/Chatbot';
import { generateStoryOpening } from './lib/gemini';
import { Loader2, Sparkles, BookOpen } from 'lucide-react';

export default function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [storyText, setStoryText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = async (file: File) => {
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setIsGenerating(true);
    setStoryText(null);
    setError(null);

    try {
      const text = await generateStoryOpening(file);
      setStoryText(text);
    } catch (err) {
      console.error('Failed to generate story:', err);
      setError('Failed to generate the story opening. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] font-sans text-black selection:bg-black/10">
      {/* Header */}
      <header className="px-8 py-6 border-b border-black/5 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-sm">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-serif font-medium tracking-tight">StoryWeaver</h1>
        </div>
        <div className="text-sm text-black/60 font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Powered by Gemini
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Image Upload */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-serif font-medium leading-tight">Set the Scene</h2>
              <p className="text-black/60 text-lg leading-relaxed">
                Upload an image to inspire your next story. Our AI will analyze the mood and ghostwrite a captivating opening paragraph.
              </p>
            </div>
            <div className="bg-white p-2 rounded-3xl shadow-sm border border-black/5">
              <ImageUploader
                onImageSelected={handleImageSelected}
                imageUrl={imageUrl}
                isLoading={isGenerating}
              />
            </div>
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}
          </div>

          {/* Right Column: Story Display */}
          <div className="lg:col-span-7 h-full min-h-[500px]">
            {isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center bg-white/50 rounded-3xl border border-black/5 p-12 text-center">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6 shadow-lg animate-pulse">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-serif font-medium mb-2">Weaving your story...</h3>
                <p className="text-black/60 max-w-sm mx-auto">
                  Analyzing the mood, setting the scene, and crafting the perfect opening lines.
                </p>
              </div>
            ) : storyText ? (
              <div className="h-full">
                <StoryDisplay storyText={storyText} />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-white/50 rounded-3xl border border-black/5 border-dashed p-12 text-center opacity-50">
                <BookOpen className="w-12 h-12 text-black/20 mb-4" />
                <p className="text-black/60 font-medium">Your story will appear here</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Chatbot */}
      <Chatbot storyContext={storyText} />
    </div>
  );
}
