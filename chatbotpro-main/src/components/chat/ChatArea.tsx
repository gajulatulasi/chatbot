import React, { useEffect, useRef } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useChat } from '../../contexts/ChatContext';

export const ChatArea: React.FC = () => {
  const { currentChat, createNewChat } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  const handlePromptSelect = (prompt: string) => {
    if (!currentChat) {
      createNewChat();
    }
  };

  if (!currentChat) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-6">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to ChatBot Pro
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Start a conversation with our built-in AI assistant. Ask questions, get help with tasks, or just chat! No API keys required - everything runs locally.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <Sparkles className="w-4 h-4" />
              <span>Powered by Local AI Technology</span>
            </div>
          </div>
        </div>
        <ChatInput onPromptSelect={handlePromptSelect} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          {currentChat.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl mb-4">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  New Conversation
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  What would you like to talk about?
                </p>
              </div>
            </div>
          ) : (
            <>
              {currentChat.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>
      <ChatInput onPromptSelect={handlePromptSelect} />
    </div>
  );
};