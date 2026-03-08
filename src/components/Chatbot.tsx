import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, MessageSquare, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { createStoryChat } from '../lib/gemini';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface ChatbotProps {
  storyContext: string | null;
}

export function Chatbot({ storyContext }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<any>(null);

  useEffect(() => {
    // Reset chat session when storyContext changes
    chatSessionRef.current = null;
    setMessages([]);
  }, [storyContext]);

  useEffect(() => {
    if (isOpen && !chatSessionRef.current) {
      chatSessionRef.current = createStoryChat(storyContext);
      if (storyContext) {
        setMessages([
          {
            id: 'system',
            role: 'model',
            text: "I've analyzed the scene and written the opening paragraph. What would you like to explore next? We can brainstorm characters, plot points, or dive deeper into the world.",
          },
        ]);
      }
    }
  }, [isOpen, storyContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatSessionRef.current.sendMessage({ message: userMessage.text });
      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || 'I am not sure how to respond to that.',
      };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'model', text: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-black text-white rounded-full shadow-lg hover:bg-black/90 transition-transform ${
          isOpen ? 'scale-0' : 'scale-100'
        }`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-white border border-black/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-black/5 bg-black/5">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-black" />
            <span className="font-medium text-black">Story Assistant</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-full hover:bg-black/10 transition-colors text-black/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-black text-white' : 'bg-black/5 text-black'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`max-w-[75%] rounded-2xl p-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-black text-white rounded-tr-sm'
                    : 'bg-black/5 text-black rounded-tl-sm'
                }`}
              >
                {msg.role === 'user' ? (
                  msg.text
                ) : (
                  <div className="prose prose-sm prose-slate max-w-none prose-p:leading-relaxed">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-black/5 text-black flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="max-w-[75%] rounded-2xl p-3 bg-black/5 text-black rounded-tl-sm flex items-center">
                <Loader2 className="w-4 h-4 animate-spin text-black/40" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-black/5 bg-white">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about the story..."
              className="w-full pl-4 pr-12 py-3 bg-black/5 border-transparent rounded-full focus:bg-white focus:border-black/20 focus:ring-2 focus:ring-black/5 outline-none transition-all text-sm"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 text-black/40 hover:text-black disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
