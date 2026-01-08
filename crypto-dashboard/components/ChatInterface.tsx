'use client';

import { useState, useRef, useEffect } from 'react';
import { Message } from '@/types/chat';
import { CryptoData } from '@/types/crypto';

interface ChatInterfaceProps {
  cryptoData: CryptoData[];
}

const SUGGESTED_QUESTIONS = [
  "Should I buy Bitcoin right now?",
  "Why is ETH down today?",
  "Compare SOL vs ADA",
];

export default function ChatInterface({ cryptoData }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          cryptoData,
        }),
        signal: abortControllerRef.current.signal,
      });

      // Handle error responses
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          let errorMessage = '';

          switch (errorData.error) {
            case 'API_KEY_MISSING':
              errorMessage = `🔑 Groq API Key Not Configured\n\nTo use the AI chat feature (100% FREE!):\n1. Get your FREE API key from https://console.groq.com/keys\n2. Add it to .env.local as GROQ_API_KEY\n3. Restart the dev server\n\nFree tier: Fast inference with Llama 3 - No credit card needed!`;
              break;
            case 'INVALID_API_KEY':
              errorMessage = `🔑 Invalid API Key\n\n${errorData.message}\n\n${errorData.details}`;
              break;
            case 'NO_CREDITS':
              errorMessage = `💳 Out of API Credits\n\n${errorData.message}\n\nTo continue using the AI chat:\n1. Visit ${errorData.details}\n2. Add credits or upgrade your plan\n\nCosts are minimal: ~$0.002-0.01 per message`;
              break;
            case 'RATE_LIMIT':
              errorMessage = `⏱️ Rate Limit Reached\n\nYou're sending requests too quickly. Please wait a moment and try again.`;
              break;
            case 'OVERLOADED':
              errorMessage = `🌐 Service Temporarily Overloaded\n\nOpenAI API is experiencing high traffic. Please try again in a moment.`;
              break;
            default:
              errorMessage = `❌ ${errorData.message || 'An error occurred'}\n\n${errorData.details || 'Please try again.'}`;
          }

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: errorMessage }
                : msg
            )
          );
          setIsLoading(false);
          abortControllerRef.current = null;
          return;
        }

        throw new Error('Failed to get response');
      }

      // Stream successful response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: msg.content + text }
                : msg
            )
          );
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request aborted');
      } else {
        console.error('Error sending message:', error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: '❌ Network Error\n\nFailed to connect to the server. Please check your internet connection and try again.' }
              : msg
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border/50 backdrop-blur-xl bg-card-bg/30">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-accent animate-pulse"></div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">
            AI Crypto Analyst
          </h2>
        </div>
        <p className="text-sm text-foreground/60 mt-2">
          Powered by Llama 3.3 (via Groq)
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mb-4">
              <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Ask me anything about crypto
            </h3>
            <p className="text-sm text-foreground/60 mb-6">
              I have access to live price data and market insights
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
              {SUGGESTED_QUESTIONS.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="px-4 py-2 rounded-full text-sm bg-card-bg/50 border border-border hover:border-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/20'
                  : 'backdrop-blur-xl bg-card-bg/50 border border-border/50 shadow-lg'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
              <p className="text-xs opacity-60 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.content === '' && (
          <div className="flex justify-start">
            <div className="backdrop-blur-xl bg-card-bg/50 border border-border/50 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-foreground/60">AI analyzing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-border/50 backdrop-blur-xl bg-card-bg/30">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about crypto markets..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl bg-card-bg/50 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-foreground placeholder:text-foreground/40 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
