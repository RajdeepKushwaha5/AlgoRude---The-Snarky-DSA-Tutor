
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Disclaimer from './components/Disclaimer';
import RudeModeToggle from './components/RudeModeToggle';
import ExamplePrompts from './components/ExamplePrompts';
import Message from './components/Message';
import LoadingSpinner from './components/LoadingSpinner';
import { generateResponse } from './services/geminiService';
import { type ChatMessage, Role } from './types';

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
    </svg>
);


const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRudeMode, setIsRudeMode] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    // Add initial message from the bot
    setMessages([
        {
            role: Role.MODEL,
            content: "Welcome to AlgoRude! Ask me anything about Data Structures and Algorithms. If you ask me something else while Rude Mode is on... well, you'll see."
        }
    ])
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: Role.USER, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    const responseText = await generateResponse(input, isRudeMode);
    const modelMessage: ChatMessage = { role: Role.MODEL, content: responseText };

    if (responseText.startsWith('Error:')) {
      setError(responseText);
    }

    setMessages((prev) => [...prev, modelMessage]);
    setIsLoading(false);
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white font-sans">
      <Header />
      <div className="flex-grow overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <RudeModeToggle isRudeMode={isRudeMode} setIsRudeMode={setIsRudeMode} />
                <Disclaimer />
            </div>

            {messages.length <= 1 && <ExamplePrompts onPromptClick={handlePromptClick} />}

            <div className="mt-4">
                {messages.map((msg, index) => (
                <Message key={index} message={msg} />
                ))}
                {isLoading && <div className="flex justify-center"><LoadingSpinner /></div>}
                <div ref={messagesEndRef} />
            </div>
        </div>
      </div>
      <div className="p-4 bg-slate-900 border-t border-slate-700">
        <div className="max-w-4xl mx-auto">
          {error && <p className="text-red-500 text-center text-sm mb-2">{error}</p>}
          <form onSubmit={handleSend} className="flex items-center gap-2 bg-slate-800 rounded-lg p-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if(e.key === 'Enter' && !e.shiftKey){
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Ask a DSA question..."
              className="flex-grow bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none resize-none p-2"
              rows={1}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-cyan-600 text-white p-2 rounded-md hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              <SendIcon/>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;
