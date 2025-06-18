import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Chat, Message } from '../types';
import { generateChatResponse } from '../services/openai';
import jsPDF from 'jspdf';

interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  createNewChat: () => string;
  selectChat: (chatId: string) => void;
  sendMessage: (content: string) => Promise<void>;
  deleteChat: (chatId: string) => void;
  exportChat: (chatId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

type ChatAction =
  | { type: 'CREATE_CHAT'; payload: Chat }
  | { type: 'SELECT_CHAT'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: { chatId: string; message: Message } }
  | { type: 'UPDATE_MESSAGE'; payload: { chatId: string; messageId: string; content: string } }
  | { type: 'DELETE_CHAT'; payload: string }
  | { type: 'LOAD_CHATS'; payload: Chat[] };

interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
}

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'CREATE_CHAT':
      return {
        ...state,
        chats: [action.payload, ...state.chats],
        currentChatId: action.payload.id,
      };
    case 'SELECT_CHAT':
      return {
        ...state,
        currentChatId: action.payload,
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        chats: state.chats.map(chat =>
          chat.id === action.payload.chatId
            ? {
                ...chat,
                messages: [...chat.messages, action.payload.message],
                updatedAt: new Date().toISOString(),
              }
            : chat
        ),
      };
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        chats: state.chats.map(chat =>
          chat.id === action.payload.chatId
            ? {
                ...chat,
                messages: chat.messages.map(msg =>
                  msg.id === action.payload.messageId
                    ? { ...msg, content: action.payload.content, typing: false }
                    : msg
                ),
                updatedAt: new Date().toISOString(),
              }
            : chat
        ),
      };
    case 'DELETE_CHAT':
      const newChats = state.chats.filter(chat => chat.id !== action.payload);
      return {
        ...state,
        chats: newChats,
        currentChatId: state.currentChatId === action.payload 
          ? (newChats.length > 0 ? newChats[0].id : null)
          : state.currentChatId,
      };
    case 'LOAD_CHATS':
      return {
        ...state,
        chats: action.payload,
      };
    default:
      return state;
  }
};

const initialState: ChatState = {
  chats: [],
  currentChatId: null,
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Load chats from localStorage on mount
  React.useEffect(() => {
    const savedChats = localStorage.getItem('chatbot_chats');
    if (savedChats) {
      try {
        const chats = JSON.parse(savedChats);
        dispatch({ type: 'LOAD_CHATS', payload: chats });
      } catch (error) {
        console.error('Failed to load chats:', error);
      }
    }
  }, []);

  // Save chats to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('chatbot_chats', JSON.stringify(state.chats));
  }, [state.chats]);

  const createNewChat = useCallback((): string => {
    const newChat: Chat = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'CREATE_CHAT', payload: newChat });
    return newChat.id;
  }, []);

  const selectChat = useCallback((chatId: string) => {
    dispatch({ type: 'SELECT_CHAT', payload: chatId });
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    let chatId = state.currentChatId;
    
    // If no current chat, create one automatically
    if (!chatId) {
      chatId = createNewChat();
    }

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      content,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    dispatch({
      type: 'ADD_MESSAGE',
      payload: { chatId, message: userMessage },
    });

    // Update chat title based on first message
    const currentChat = state.chats.find(chat => chat.id === chatId);
    if (currentChat && currentChat.messages.length === 0) {
      const title = content.length > 30 ? content.substring(0, 30) + '...' : content;
      const updatedChats = state.chats.map(chat =>
        chat.id === chatId ? { ...chat, title } : chat
      );
      dispatch({ type: 'LOAD_CHATS', payload: updatedChats });
    }

    // Add typing indicator
    const typingMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      content: '',
      sender: 'bot',
      timestamp: new Date().toISOString(),
      typing: true,
    };

    dispatch({
      type: 'ADD_MESSAGE',
      payload: { chatId, message: typingMessage },
    });

    try {
      // Prepare conversation history for context
      const conversationHistory = currentChat?.messages
        .filter(msg => !msg.typing && msg.sender !== 'bot' || msg.content.trim() !== '')
        .slice(-10) // Keep last 10 messages for context
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        })) || [];

      // Add current user message
      conversationHistory.push({
        role: 'user',
        content: content
      });

      let accumulatedResponse = '';

      // Generate AI response with streaming
      await generateChatResponse(
        conversationHistory,
        (chunk: string) => {
          accumulatedResponse += chunk;
          dispatch({
            type: 'UPDATE_MESSAGE',
            payload: {
              chatId: chatId!,
              messageId: typingMessage.id,
              content: accumulatedResponse,
            },
          });
        }
      );

    } catch (error: any) {
      console.error('Error generating AI response:', error);
      
      // Show error message to user
      const errorMessage = error.message || 'Sorry, I encountered an error while processing your request. Please try again.';
      
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          chatId: chatId!,
          messageId: typingMessage.id,
          content: `❌ ${errorMessage}`,
        },
      });
    }
  }, [state.currentChatId, state.chats, createNewChat]);

  const deleteChat = useCallback((chatId: string) => {
    dispatch({ type: 'DELETE_CHAT', payload: chatId });
  }, []);

  const exportChat = useCallback((chatId: string) => {
    const chat = state.chats.find(c => c.id === chatId);
    if (!chat) return;

    // Create new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yOffset = 20;
    const lineHeight = 7;
    const margin = 20;

    // Add title
    doc.setFontSize(16);
    doc.text(chat.title, margin, yOffset);
    yOffset += lineHeight * 2;

    // Add creation date
    doc.setFontSize(10);
    doc.text(`Created: ${new Date(chat.createdAt).toLocaleString()}`, margin, yOffset);
    yOffset += lineHeight * 2;

    // Add messages
    doc.setFontSize(12);
    chat.messages.forEach((message) => {
      const isUser = message.sender === 'user';
      const sender = isUser ? 'You' : 'AI Assistant';
      const timestamp = new Date(message.timestamp).toLocaleTimeString();

      // Check if we need a new page
      if (yOffset > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        yOffset = margin;
      }

      // Add sender and timestamp
      doc.setFont('helvetica', 'bold');
      doc.text(`${sender} (${timestamp})`, margin, yOffset);
      yOffset += lineHeight;

      // Add message content
      doc.setFont('helvetica', 'normal');
      const splitText = doc.splitTextToSize(message.content, pageWidth - (margin * 2));
      doc.text(splitText, margin, yOffset);
      yOffset += lineHeight * (splitText.length + 1);
    });

    // Save the PDF
    doc.save(`chat-${chat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
  }, [state.chats]);

  const currentChat = state.chats.find(chat => chat.id === state.currentChatId) || null;

  return (
    <ChatContext.Provider value={{
      chats: state.chats,
      currentChat,
      createNewChat,
      selectChat,
      sendMessage,
      deleteChat,
      exportChat,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};