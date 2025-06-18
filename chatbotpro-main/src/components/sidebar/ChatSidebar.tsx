import React, { useState } from 'react';
import { Plus, MessageSquare, Search, MoreVertical, Download, Trash2, Sun, Moon, LogOut } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export const ChatSidebar: React.FC = () => {
  const { chats, currentChat, createNewChat, selectChat, deleteChat, exportChat } = useChat();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.messages.some(msg => msg.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleNewChat = () => {
    createNewChat();
  };

  const handleChatSelect = (chatId: string) => {
    selectChat(chatId);
    setOpenMenuId(null);
  };

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      deleteChat(chatId);
    }
    setOpenMenuId(null);
  };

  const handleExportChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    exportChat(chatId);
    setOpenMenuId(null);
  };

  const toggleMenu = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === chatId ? null : chatId);
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-colors duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">ChatBot Pro</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={logout}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
          <span className="font-medium">New Chat</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="space-y-2">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleChatSelect(chat.id)}
              className={`relative group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                currentChat?.id === chat.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                currentChat?.id === chat.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
              }`}>
                <MessageSquare className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className={`font-medium truncate ${
                  currentChat?.id === chat.id
                    ? 'text-blue-900 dark:text-blue-100'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {chat.title}
                </h3>
                <p className={`text-sm truncate ${
                  currentChat?.id === chat.id
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {chat.messages.length > 0 
                    ? chat.messages[chat.messages.length - 1].content
                    : 'No messages yet'
                  }
                </p>
              </div>

              <div className="relative">
                <button
                  onClick={(e) => toggleMenu(chat.id, e)}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {openMenuId === chat.id && (
                  <div className="absolute right-0 top-8 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-[120px]">
                    <button
                      onClick={(e) => handleExportChat(chat.id, e)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                    <button
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredChats.length === 0 && searchTerm && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No chats found</p>
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-white truncate">
              {user?.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};