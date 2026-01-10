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

  // Reset messages when selecting a new coin
  useEffect(() => {
    if (selectedCoin) {
      setMessages([]);
      setInput('');
    }
  }, [selectedCoin?.id]);

  // Auto-send initial question when panel opens
  useEffect(() => {
    if (isOpen && selectedCoin && messages.length === 0) {
      const autoMessage = `Tell me about ${selectedCoin.name}. Should I consider buying it now?`;
      sendMessage(autoMessage, true);
    }
  }, [isOpen, selectedCoin?.id, messages.length]);

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

  const isPositive = selectedCoin ? selectedCoin.change24h >= 0 : true;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-screen w-full md:w-[420px] z-50 flex flex-col bg-[#0a0a0a] border-l border-white/5"
          >
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-white/5">
              {/* Close button */}
              <button
                onClick={onClose}
                className="mb-3 sm:mb-4 text-white/40 hover:text-white transition-colors text-sm flex items-center gap-2 min-h-[44px] -ml-2 pl-2 pr-3 -mt-2"
              >
                <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-xs sm:text-xs">Close</span>
              </button>

              {/* Coin info */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-white">
                    {selectedCoin?.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-white/40 mt-0.5">
                    {selectedCoin?.symbol}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg sm:text-xl font-semibold text-white">
                    ${selectedCoin?.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={`text-xs sm:text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{selectedCoin?.change24h.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-3 sm:space-y-4">
              {messages.length === 0 && isLoading && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm text-white/40">Analyzing...</p>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-[90%] rounded-lg px-4 py-3"
                    style={{
                      background: message.role === 'user'
                        ? 'rgba(255,237,78,0.1)'
                        : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${message.role === 'user' ? 'rgba(255,237,78,0.15)' : 'rgba(255,255,255,0.05)'}`,
                    }}
                  >
                    <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                      message.role === 'user' ? 'text-[#FFED4E]/90' : 'text-white/70'
                    }`}>
                      {message.content}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isLoading && messages.length > 0 && messages[messages.length - 1]?.content === '' && (
                <div className="flex justify-start">
                  <div className="rounded-lg px-4 py-3 bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 rounded-full bg-white/40 animate-pulse"></div>
                        <div className="w-1 h-1 rounded-full bg-white/40 animate-pulse" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1 h-1 rounded-full bg-white/40 animate-pulse" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 sm:p-6 border-t border-white/5 safe-area-bottom">
              <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  disabled={isLoading}
                  className="flex-1 px-3 sm:px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5 text-white text-sm placeholder:text-white/20 disabled:opacity-50 focus:outline-none focus:border-white/10 transition-colors min-h-[44px]"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-4 sm:px-5 py-3 rounded-lg bg-[#FFED4E] text-black font-medium text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#ffe033] transition-colors min-h-[44px] min-w-[60px] sm:min-w-[70px]"
                >
                  Send
                </button>
              </form>
              <p className="mt-2 sm:mt-3 text-[9px] sm:text-[10px] text-white/20 text-center">
                Not financial advice
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
