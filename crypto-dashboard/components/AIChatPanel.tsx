'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Message } from '@/types/chat';
import { CryptoData } from '@/types/crypto';

interface AIChatPanelProps {
  isOpen: boolean;
  selectedCoin: CryptoData | null;
  onClose: () => void;
  cryptoData: CryptoData[];
}

export default function AIChatPanel({ isOpen, selectedCoin, onClose, cryptoData }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && selectedCoin) {
      const autoMessage = `Tell me about ${selectedCoin.name}. Should I consider buying it now?`;
      sendMessage(autoMessage, true);
    }
  }, [isOpen, selectedCoin?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText: string, isAuto = false) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    if (!isAuto) {
      setMessages((prev) => [...prev, userMessage]);
    }
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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          cryptoData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: `Error: ${errorData.message || 'Failed to get response'}` }
              : msg
          )
        );
        setIsLoading(false);
        return;
      }

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
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: 'Network error. Please try again.' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 pointer-events-none"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-full md:w-[40%] lg:w-[35%] z-50 bg-black/80 backdrop-blur-xl border-l-2 border-cyan-500/40 flex flex-col shadow-2xl shadow-cyan-500/10"
            style={{
              backdropFilter: 'blur(20px) saturate(150%)',
              boxShadow: '0 0 80px rgba(0, 255, 255, 0.15), inset 0 0 40px rgba(0, 255, 255, 0.05)'
            }}
          >
          {/* Header */}
          <div className="p-8 border-b border-cyan-500/30 bg-black/30">
            {/* Back Button */}
            <button
              onClick={onClose}
              className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-500 hover:bg-cyan-500/20 transition-all group"
            >
              <svg className="w-4 h-4 text-cyan-400 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-cyan-400 font-semibold text-sm">Back to View</span>
            </button>

            {/* Coin Info */}
            <div className="mb-6">
              <h2 className="text-4xl font-bold text-cyan-400 mb-2" style={{ textShadow: '0 0 20px rgba(0, 255, 255, 0.3)' }}>
                {selectedCoin?.name || 'Cryptocurrency'}
              </h2>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                {selectedCoin?.symbol} • AI-Powered Analysis
              </p>
            </div>

            {/* Stats Grid */}
            {selectedCoin && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Price</div>
                  <div className="text-lg font-bold text-gray-200">
                    ${selectedCoin.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">24h Change</div>
                  <div className={`text-lg font-bold ${selectedCoin.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedCoin.change24h >= 0 ? '↑' : '↓'} {Math.abs(selectedCoin.change24h).toFixed(2)}%
                  </div>
                </div>
                <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Volume</div>
                  <div className="text-lg font-bold text-gray-200">
                    ${(selectedCoin.volume24h / 1000000000).toFixed(2)}B
                  </div>
                </div>
              </div>
            )}

            {/* AI Badge */}
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
              <span className="text-xs text-cyan-400 font-semibold">Powered by Llama 3.3 via Groq</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-8 space-y-4">
            {messages.length === 0 && isLoading && (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-cyan-500/10 rounded-full animate-ping"></div>
                </div>
                <p className="text-cyan-400 font-semibold text-lg animate-pulse">
                  Analyzing {selectedCoin?.name}...
                </p>
                <p className="text-gray-500 text-sm">AI is processing market data</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 backdrop-blur-sm ${
                    message.role === 'user'
                      ? 'bg-cyan-500/20 border border-cyan-500/40 text-gray-100 shadow-lg shadow-cyan-500/10'
                      : 'bg-black/60 border border-cyan-500/20 text-gray-300'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && messages.length > 0 && messages[messages.length - 1]?.content === '' && (
              <div className="flex justify-start">
                <div className="bg-black/60 border border-cyan-500/20 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-xs text-gray-400">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-8 border-t-2 border-cyan-500/30 bg-black/40 backdrop-blur-md">
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about this cryptocurrency..."
                disabled={isLoading}
                className="w-full px-5 pr-24 py-4 rounded-xl bg-black/60 border-2 border-cyan-500/30 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all text-gray-100 placeholder:text-gray-600 disabled:opacity-50 font-medium backdrop-blur-sm"
                style={{ boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.3)' }}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-lg bg-cyan-500/20 border-2 border-cyan-500/40 text-cyan-400 font-semibold hover:bg-cyan-500/30 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:hover:bg-cyan-500/20 flex items-center gap-2"
              >
                <span>Send</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
            <p className="mt-3 text-xs text-gray-600 flex items-center gap-2">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              AI-powered insights • Not financial advice
            </p>
          </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
