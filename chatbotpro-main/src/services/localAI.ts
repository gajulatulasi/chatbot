// Local AI service that provides intelligent responses without external APIs
export class LocalAI {
  private knowledgeBase: { [key: string]: string[] } = {
    greeting: [
      "Hello! I'm your AI assistant. How can I help you today?",
      "Hi there! What would you like to know or discuss?",
      "Greetings! I'm here to assist you with any questions you might have.",
      "Hello! Feel free to ask me anything - I'm here to help!"
    ],
    programming: [
      "Programming is the art of creating instructions for computers to follow. It involves writing code in various languages like JavaScript, Python, Java, and many others.",
      "When learning to program, start with understanding basic concepts like variables, functions, loops, and conditionals. Practice is key to becoming proficient.",
      "Modern programming emphasizes clean code, version control with Git, testing, and collaborative development practices.",
      "Popular programming languages include JavaScript for web development, Python for data science and AI, Java for enterprise applications, and C++ for system programming."
    ],
    technology: [
      "Technology is rapidly evolving with artificial intelligence, machine learning, and automation transforming industries.",
      "Cloud computing has revolutionized how we store and process data, with platforms like AWS, Google Cloud, and Azure leading the way.",
      "Mobile technology continues to advance with 5G networks, improved processors, and innovative applications.",
      "Emerging technologies like blockchain, quantum computing, and IoT are shaping the future of digital innovation."
    ],
    science: [
      "Science is the systematic study of the natural world through observation, experimentation, and analysis.",
      "Recent scientific breakthroughs include CRISPR gene editing, gravitational wave detection, and advances in renewable energy.",
      "The scientific method involves forming hypotheses, conducting experiments, analyzing data, and drawing conclusions.",
      "Interdisciplinary fields like bioinformatics, computational biology, and data science are driving modern research."
    ],
    business: [
      "Successful businesses focus on understanding customer needs, delivering value, and adapting to market changes.",
      "Digital transformation is essential for modern businesses, involving automation, data analytics, and online presence.",
      "Entrepreneurship requires creativity, persistence, risk management, and the ability to learn from failures.",
      "Key business metrics include revenue growth, customer acquisition cost, lifetime value, and market share."
    ],
    education: [
      "Effective learning involves active engagement, spaced repetition, and connecting new information to existing knowledge.",
      "Online education platforms have democratized access to learning, offering courses from top universities and experts worldwide.",
      "Critical thinking skills are essential in today's information age - learning to evaluate sources and think analytically.",
      "Continuous learning is crucial in rapidly changing fields, requiring adaptability and curiosity."
    ],
    health: [
      "Maintaining good health involves regular exercise, balanced nutrition, adequate sleep, and stress management.",
      "Preventive healthcare is more effective and cost-efficient than treating diseases after they develop.",
      "Mental health is equally important as physical health - practices like meditation and therapy can be beneficial.",
      "Recent medical advances include personalized medicine, immunotherapy, and telemedicine."
    ],
    creativity: [
      "Creativity involves combining existing ideas in new ways, thinking outside conventional boundaries, and embracing experimentation.",
      "Creative processes often involve brainstorming, iteration, feedback, and refinement of ideas.",
      "Many creative breakthroughs come from interdisciplinary thinking - combining insights from different fields.",
      "Tools like design thinking, mind mapping, and collaborative workshops can enhance creative problem-solving."
    ],
    philosophy: [
      "Philosophy explores fundamental questions about existence, knowledge, values, reason, mind, and language.",
      "Critical thinking and logical reasoning are core philosophical skills applicable to many areas of life.",
      "Ethics examines what is right and wrong, helping us make moral decisions in complex situations.",
      "Philosophy of mind explores consciousness, free will, and the relationship between mind and body."
    ],
    general: [
      "That's an interesting question! Let me think about that from different perspectives.",
      "I'd be happy to help you explore that topic further. What specific aspect interests you most?",
      "That's a complex subject with many facets. Here's what I can share about it:",
      "Great question! This touches on several important concepts that are worth discussing."
    ]
  };

  private conversationContext: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  private categorizeQuery(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    if (this.matchesKeywords(lowerQuery, ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon'])) {
      return 'greeting';
    }
    if (this.matchesKeywords(lowerQuery, ['code', 'programming', 'javascript', 'python', 'java', 'development', 'software', 'algorithm'])) {
      return 'programming';
    }
    if (this.matchesKeywords(lowerQuery, ['technology', 'tech', 'computer', 'ai', 'artificial intelligence', 'machine learning', 'cloud'])) {
      return 'technology';
    }
    if (this.matchesKeywords(lowerQuery, ['science', 'research', 'experiment', 'biology', 'physics', 'chemistry', 'scientific'])) {
      return 'science';
    }
    if (this.matchesKeywords(lowerQuery, ['business', 'marketing', 'sales', 'entrepreneur', 'startup', 'company', 'management'])) {
      return 'business';
    }
    if (this.matchesKeywords(lowerQuery, ['learn', 'education', 'study', 'school', 'university', 'course', 'teaching'])) {
      return 'education';
    }
    if (this.matchesKeywords(lowerQuery, ['health', 'fitness', 'exercise', 'nutrition', 'medical', 'wellness', 'mental health'])) {
      return 'health';
    }
    if (this.matchesKeywords(lowerQuery, ['creative', 'creativity', 'art', 'design', 'innovation', 'brainstorm', 'idea'])) {
      return 'creativity';
    }
    if (this.matchesKeywords(lowerQuery, ['philosophy', 'ethics', 'moral', 'meaning', 'existence', 'consciousness'])) {
      return 'philosophy';
    }
    
    return 'general';
  }

  private matchesKeywords(query: string, keywords: string[]): boolean {
    return keywords.some(keyword => query.includes(keyword));
  }

  private getRandomResponse(category: string): string {
    const responses = this.knowledgeBase[category] || this.knowledgeBase.general;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private generateContextualResponse(query: string, category: string): string {
    const baseResponse = this.getRandomResponse(category);
    
    // Add contextual elements based on conversation history
    if (this.conversationContext.length > 0) {
      const lastUserMessage = this.conversationContext
        .filter(msg => msg.role === 'user')
        .slice(-1)[0];
      
      if (lastUserMessage && this.isFollowUpQuestion(query)) {
        return `Building on our previous discussion, ${baseResponse.toLowerCase()}`;
      }
    }

    // Add specific contextual responses for certain patterns
    if (query.includes('how') && query.includes('?')) {
      return `${baseResponse} Here's how you can approach this: break it down into smaller steps, research best practices, and start with simple examples before moving to complex scenarios.`;
    }
    
    if (query.includes('why') && query.includes('?')) {
      return `${baseResponse} The reasoning behind this involves multiple factors including historical context, practical benefits, and underlying principles that make it effective.`;
    }
    
    if (query.includes('what') && query.includes('?')) {
      return `${baseResponse} To elaborate further, this concept encompasses various aspects that are interconnected and build upon fundamental principles.`;
    }

    return baseResponse;
  }

  private isFollowUpQuestion(query: string): boolean {
    const followUpIndicators = ['also', 'additionally', 'furthermore', 'moreover', 'besides', 'what about', 'how about'];
    return followUpIndicators.some(indicator => query.toLowerCase().includes(indicator));
  }

  private addPersonalizedTouch(response: string, query: string): string {
    // Add encouraging elements
    const encouragements = [
      "I hope this helps clarify things for you!",
      "Feel free to ask if you'd like me to elaborate on any part.",
      "Let me know if you have any follow-up questions!",
      "I'm here if you need more information on this topic.",
      "Would you like to explore any specific aspect in more detail?"
    ];

    // Add relevant follow-up suggestions
    if (query.toLowerCase().includes('learn')) {
      response += " Remember, learning is a journey - take it one step at a time and celebrate small victories along the way.";
    }
    
    if (query.toLowerCase().includes('problem') || query.toLowerCase().includes('issue')) {
      response += " When facing challenges, try breaking them down into smaller, manageable parts and tackle them systematically.";
    }

    // Add a random encouragement
    if (Math.random() > 0.7) {
      response += ` ${encouragements[Math.floor(Math.random() * encouragements.length)]}`;
    }

    return response;
  }

  public async generateResponse(query: string): Promise<string> {
    // Add user message to context
    this.conversationContext.push({ role: 'user', content: query });
    
    // Keep context manageable (last 10 messages)
    if (this.conversationContext.length > 10) {
      this.conversationContext = this.conversationContext.slice(-10);
    }

    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const category = this.categorizeQuery(query);
    let response = this.generateContextualResponse(query, category);
    response = this.addPersonalizedTouch(response, query);

    // Add assistant response to context
    this.conversationContext.push({ role: 'assistant', content: response });

    return response;
  }

  public async generateStreamingResponse(
    query: string,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    const fullResponse = await this.generateResponse(query);
    const words = fullResponse.split(' ');
    
    let accumulatedResponse = '';
    
    for (let i = 0; i < words.length; i++) {
      const chunk = (i === 0 ? '' : ' ') + words[i];
      accumulatedResponse += chunk;
      onChunk(chunk);
      
      // Simulate natural typing speed
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    }
    
    return fullResponse;
  }

  public clearContext(): void {
    this.conversationContext = [];
  }
}

// Export singleton instance
export const localAI = new LocalAI();