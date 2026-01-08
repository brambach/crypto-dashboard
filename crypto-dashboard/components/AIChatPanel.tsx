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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-screen w-full md:w-[420px] z-50 bg-[#13131a] border-l border-[#1f1f28] flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-6 border-b border-[#1f1f28]">
              <button
                onClick={onClose}
                className="mb-4 text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close
              </button>

              <h2 className="text-2xl font-semibold text-white mb-1">
                {selectedCoin?.name}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                {selectedCoin?.symbol} • AI Analysis
              </p>

              {/* Stats */}
              {selectedCoin && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#0a0a0f] rounded-lg p-3 border border-[#1f1f28]">
                    <div className="text-xs text-gray-500 mb-1">Price</div>
                    <div className="text-sm font-semibold text-white">
                      ${selectedCoin.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="bg-[#0a0a0f] rounded-lg p-3 border border-[#1f1f28]">
                    <div className="text-xs text-gray-500 mb-1">24h</div>
                    <div className={`text-sm font-semibold ${selectedCoin.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {selectedCoin.change24h >= 0 ? '+' : ''}{selectedCoin.change24h.toFixed(2)}%
                    </div>
                  </div>
                  <div className="bg-[#0a0a0f] rounded-lg p-3 border border-[#1f1f28]">
                    <div className="text-xs text-gray-500 mb-1">Volume</div>
                    <div className="text-sm font-semibold text-white">
                      ${(selectedCoin.volume24h / 1000000000).toFixed(1)}B
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {messages.length === 0 && isLoading && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1f1f28] border-t-indigo-500 mx-auto mb-3"></div>
                    <p className="text-sm text-gray-500">Analyzing...</p>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-[#0a0a0f] text-gray-300 border border-[#1f1f28]'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && messages.length > 0 && messages[messages.length - 1]?.content === '' && (
                <div className="flex justify-start">
                  <div className="bg-[#0a0a0f] border border-[#1f1f28] rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-xs text-gray-500">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-[#1f1f28]">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about this cryptocurrency..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[#0a0a0f] border border-[#1f1f28] focus:border-indigo-500 focus:outline-none transition-colors text-white text-sm placeholder:text-gray-600 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Send
                </button>
              </form>
              <p className="mt-2 text-xs text-gray-600">
                AI-powered insights • Not financial advice
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
