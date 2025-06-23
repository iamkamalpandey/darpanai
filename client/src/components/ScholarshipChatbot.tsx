import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Loader2, Send, Bot, User, Heart, Star, DollarSign, Calendar, MapPin } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  scholarships?: ScholarshipMatch[];
  metadata?: {
    emotion?: 'supportive' | 'encouraging' | 'empathetic' | 'excited';
    intent?: 'greeting' | 'matching' | 'guidance' | 'encouragement';
  };
}

interface ScholarshipMatch {
  id: number;
  name: string;
  providerName: string;
  providerCountry: string;
  fundingType: string;
  totalValueMax: string;
  applicationDeadline: string;
  matchScore: number;
  matchReasons: string[];
}

interface UserProfile {
  academicLevel?: string;
  fieldOfStudy?: string;
  gpa?: number;
  preferredCountries?: string[];
  budgetRange?: string;
  nationality?: string;
}

export function ScholarshipChatbot() {
  // Generate unique ID for messages
  const generateUniqueId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: generateUniqueId(),
      type: 'bot',
      content: "Hello! I'm Darpan AI, your scholarship guidance assistant. I'm here to help you discover scholarship opportunities from our comprehensive database. What field of study are you interested in?",
      timestamp: new Date(),
      metadata: { emotion: 'supportive', intent: 'greeting' }
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user profile for context
  const { data: userProfile } = useQuery({
    queryKey: ['/api/user'],
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    // Scroll to bottom when new messages are added
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  // Intelligent browser-side message handling
  const handleIntelligentResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase().trim();
    
    // Handle different query types on the browser side
    let responseContent = "";
    let shouldSearchScholarships = false;
    
    // Simple greetings
    if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/) || 
        lowerMessage.includes('how are you')) {
      responseContent = "Hello! I'm Darpan AI, your scholarship guidance assistant. I help you find scholarship opportunities from our comprehensive database using only your personal information. What would you like to know about scholarships or study abroad opportunities?";
    }
    
    // Help requests
    else if (lowerMessage.includes('help') || lowerMessage.includes('what can you do') || lowerMessage.includes('how do you work')) {
      responseContent = "I can help you with:\n\n• Finding scholarships from our database\n• Academic guidance for study abroad\n• Country recommendations\n• Personalized suggestions based on your profile\n\nJust ask me about any of these topics! For example, try 'Show me scholarships for engineering' or 'Which countries are good for computer science?'";
    }
    
    // Scholarship searches - trigger backend
    else if (lowerMessage.includes('scholarship') || lowerMessage.includes('funding') || lowerMessage.includes('grant') || lowerMessage.includes('financial aid')) {
      shouldSearchScholarships = true;
    }
    
    // Study/academic queries
    else if (lowerMessage.includes('study') || lowerMessage.includes('degree') || lowerMessage.includes('course') || lowerMessage.includes('program')) {
      if (lowerMessage.includes('scholarship') || lowerMessage.includes('funding')) {
        shouldSearchScholarships = true;
      } else {
        responseContent = "I can help you with study abroad guidance! Are you looking for information about specific programs, countries, or scholarship opportunities? Let me know your field of interest and I can provide targeted assistance.";
      }
    }
    
    // Country/destination queries
    else if (lowerMessage.includes('country') || lowerMessage.includes('destination') || lowerMessage.includes('where to study')) {
      shouldSearchScholarships = true;
    }
    
    // Support/guidance
    else if (lowerMessage.includes('confused') || lowerMessage.includes('overwhelmed') || lowerMessage.includes('lost') || lowerMessage.includes('stressed')) {
      responseContent = "I understand that searching for scholarships and planning study abroad can feel overwhelming. You're taking the right step by seeking guidance. Let's break this down into manageable steps:\n\n1. First, tell me your field of study\n2. Share your preferred countries or regions\n3. Let me know your academic level\n\nWith this information, I can search our database for suitable opportunities and guide you through the process step by step.";
    }
    
    // Default response
    else {
      responseContent = "I'm Darpan AI, and I specialize in helping you find scholarships and study abroad opportunities. To provide you with the most relevant information, could you tell me what specific aspect you'd like help with? I can search scholarships, provide academic guidance, or offer country recommendations.";
    }
    
    if (shouldSearchScholarships) {
      // Use backend for scholarship searches
      return chatMutation.mutate(userMessage);
    } else {
      // Handle simple responses directly in browser
      const botMessage: ChatMessage = {
        id: generateUniqueId(),
        type: 'bot',
        content: responseContent,
        timestamp: new Date(),
        metadata: { emotion: 'supportive', intent: 'guidance' }
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }
  };

  // Chat mutation for scholarship searches only
  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await apiRequest('POST', '/api/chatbot/scholarship-match', {
        message: userMessage,
        conversationHistory: messages.slice(-5),
        userProfile: userProfile || {}
      });
      return response;
    },
    onSuccess: (response: any) => {
      console.log('Scholarship search response:', response);
      
      const botMessage: ChatMessage = {
        id: generateUniqueId(),
        type: 'bot',
        content: response.message || "I searched our scholarship database for your query. Could you provide more specific details about your field of study or preferred countries?",
        timestamp: new Date(),
        scholarships: response.scholarships || [],
        metadata: response.metadata || { emotion: 'supportive', intent: 'guidance' }
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    },
    onError: (error: any) => {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment. I'm still here to help you find amazing scholarship opportunities! 💙",
        timestamp: new Date(),
        metadata: { emotion: 'empathetic', intent: 'guidance' }
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
      
      toast({
        title: "Connection Issue",
        description: "Please try your message again",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message with unique ID
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToProcess = inputMessage;
    setInputMessage('');
    setIsTyping(true);
    
    // Use intelligent browser-side handling
    handleIntelligentResponse(messageToProcess);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getEmotionColor = (emotion?: string) => {
    switch (emotion) {
      case 'encouraging': return 'text-green-600';
      case 'empathetic': return 'text-purple-600';
      case 'excited': return 'text-orange-600';
      default: return 'text-blue-600';
    }
  };

  const formatCurrency = (amount: string, country: string) => {
    const currencyMap: { [key: string]: string } = {
      'US': '$',
      'AU': 'A$',
      'GB': '£',
      'CA': 'C$',
      'EU': '€'
    };
    const symbol = currencyMap[country] || '$';
    return `${symbol}${amount}`;
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-6 w-6" />
          Scholarship Matching Assistant
          <Heart className="h-4 w-4 text-pink-200" />
        </CardTitle>
        <p className="text-blue-100 text-sm">AI-powered guidance with empathetic support</p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white ml-auto'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.type === 'bot' && (
                        <Bot className={`h-4 w-4 mt-0.5 ${getEmotionColor(message.metadata?.emotion)}`} />
                      )}
                      {message.type === 'user' && (
                        <User className="h-4 w-4 mt-0.5 text-blue-100" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm">{message.content}</p>
                        
                        {/* Display matched scholarships */}
                        {message.scholarships && message.scholarships.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs font-medium text-gray-600">
                              🎯 Found {message.scholarships.length} matching scholarships:
                            </p>
                            {message.scholarships.map((scholarship) => (
                              <div
                                key={scholarship.id}
                                className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-gray-900 text-sm">
                                    {scholarship.name}
                                  </h4>
                                  <Badge variant="secondary" className="text-xs">
                                    {scholarship.matchScore}% match
                                  </Badge>
                                </div>
                                
                                <div className="space-y-1 text-xs text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {scholarship.providerName} • {scholarship.providerCountry}
                                  </div>
                                  
                                  {scholarship.totalValueMax && (
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="h-3 w-3" />
                                      Up to {formatCurrency(scholarship.totalValueMax, scholarship.providerCountry)}
                                    </div>
                                  )}
                                  
                                  {scholarship.applicationDeadline && (
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      Deadline: {new Date(scholarship.applicationDeadline).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                                
                                {scholarship.matchReasons.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium text-gray-700 mb-1">Why this matches:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {scholarship.matchReasons.slice(0, 3).map((reason, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                          {reason}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-blue-600" />
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-600">Finding perfect matches for you...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tell me about your study goals, interests, or ask about scholarships..."
              className="flex-1"
              disabled={chatMutation.isPending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || chatMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {chatMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <div className="mt-2 flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs cursor-pointer hover:bg-gray-50">
              💡 Quick: "I'm studying computer science"
            </Badge>
            <Badge variant="outline" className="text-xs cursor-pointer hover:bg-gray-50">
              🎓 "Show me PhD scholarships"
            </Badge>
            <Badge variant="outline" className="text-xs cursor-pointer hover:bg-gray-50">
              🌍 "Study abroad options"
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}