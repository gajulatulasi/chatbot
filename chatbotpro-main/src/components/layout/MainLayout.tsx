import React from 'react';
import { ChatSidebar } from '../sidebar/ChatSidebar';
import { ChatArea } from '../chat/ChatArea';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <ChatSidebar />
      <ChatArea />
    </div>
  );
};