import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Zap } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';

interface ChatInputProps {
  onPromptSelect: (prompt: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onPromptSelect }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const { sendMessage, currentChat } = useChat();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const promptTemplates = [
    { id: '1', title: 'Explain like I\'m 5', content: 'Explain this concept in simple terms that a 5-year-old would understand:', category: 'education' },
    { id: '2', title: 'Code Review', content: 'Please review this code and suggest improvements:', category: 'development' },
    { id: '3', title: 'Creative Writing', content: 'Write a creative story about:', category: 'creative' },
    { id: '4', title: 'Problem Solving', content: 'Help me brainstorm solutions for:', category: 'productivity' },
    { id: '5', title: 'Learning Plan', content: 'Create a learning plan for:', category: 'education' },
    { id: '6', title: 'Email Draft', content: 'Help me write a professional email about:', category: 'productivity' },
  ];

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');

        setInput(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    await sendMessage(input.trim());
    setInput('');
    setShowPrompts(false);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handlePromptSelect = (prompt: string) => {
    setInput(prompt);
    onPromptSelect(prompt);
    setShowPrompts(false);
    textareaRef.current?.focus();
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      {showPrompts && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Prompt Templates</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {promptTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handlePromptSelect(template.content)}
                className="text-left p-3 bg-white dark:bg-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-500 transition-colors border border-gray-200 dark:border-gray-500 group"
              >
                <div className="font-medium text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {template.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">
                  {template.category}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentChat ? "Type your message..." : "Start a new conversation..."}
            className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none min-h-[52px] max-h-[150px]"
            rows={1}
          />
          <button
            type="button"
            onClick={() => setShowPrompts(!showPrompts)}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors ${
              showPrompts 
                ? 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Zap className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2">
          {recognitionRef.current && (
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-3 rounded-xl transition-all duration-200 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}

          <button
            type="submit"
            disabled={!input.trim()}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white p-3 rounded-xl transition-all duration-200 disabled:cursor-not-allowed group"
          >
            <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  );
};