import { localAI } from './localAI';

// Local AI service - no external APIs required
export const generateChatResponse = async (
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  onStream?: (chunk: string) => void
): Promise<string> => {
  try {
    // Get the latest user message
    const userMessages = messages.filter(m => m.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || '';
    
    if (!lastUserMessage.trim()) {
      throw new Error('No message provided');
    }

    // Generate response using local AI
    if (onStream) {
      return await localAI.generateStreamingResponse(lastUserMessage, onStream);
    } else {
      return await localAI.generateResponse(lastUserMessage);
    }
  } catch (error: any) {
    console.error('Local AI Error:', error);
    throw new Error('Sorry, I encountered an error while processing your request. Please try again.');
  }
};

// Legacy function for backward compatibility
export const isOpenAIConfigured = () => {
  return true; // Local AI is always available
};

// Initialize local AI
export const initializeLocalAI = () => {
  console.log('Local AI initialized and ready!');
};

// Auto-initialize
initializeLocalAI();