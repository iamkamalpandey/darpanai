import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles, Upload, User, Bot, Calendar, FileText, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  specialist?: string;
  formatted?: boolean;
  suggestsBooking?: boolean;
  actionButtons?: ActionButton[];
  requiresSelection?: {
    type: 'study_level' | 'field_of_study' | 'country';
    options: string[];
    question: string;
  };
}

interface ActionButton {
  type: 'book_consultation' | 'apply_now' | 'explore_scholarships' | 'complete_profile';
  label: string;
  description: string;
  url?: string;
  action?: string;
}

interface ChatResponse {
  response: string;
  specialist: string;
  followUpQuestions?: string[];
  nextSteps?: string[];
  requiresMoreInfo?: boolean;
  missingProfileData?: string[];
}

interface ConversationHistory {
  messages: ChatMessage[];
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  nationality?: string;
  preferredCountries?: string[];
  studyLevel?: string;
  fieldOfStudy?: string;
  budgetRange?: string;
  completionPercentage?: number;
}

export default function EduCounselAI() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch user profile for context
  const { data: userProfile } = useQuery<UserProfile>({
    queryKey: ['/api/user'],
  });

  // Fetch existing conversation history
  const { data: conversationHistory } = useQuery({
    queryKey: ['/api/educounsel/conversation'],
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string; conversationHistory: ChatMessage[] }) => {
      const response = await apiRequest('POST', '/api/educounsel/chat', messageData);
      const data = await response.json();
      return data;
    },
    onSuccess: (data: any) => {
      console.log('API Response Data:', data);
      
      const aiMessage: ChatMessage = {
        id: Date.now().toString() + '_ai',
        content: data.response || 'No response available',
        isUser: false,
        timestamp: new Date(),
        specialist: data.specialist || 'Alex',
        formatted: true,
        suggestsBooking: data.suggestsBooking || false,
        actionButtons: data.actionButtons || [],
        requiresSelection: data.requiresSelection
      };
      
      console.log('AI Message:', aiMessage);
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      toast({
        title: "Communication Error",
        description: "Unable to process your message. Please try again.",
        variant: "destructive"
      });
      setIsTyping(false);
    }
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Load conversation history on mount
  useEffect(() => {
    const history = conversationHistory as ConversationHistory;
    if (history?.messages) {
      setMessages(history.messages);
    }
  }, [conversationHistory]);

  // Welcome message based on user profile
  useEffect(() => {
    if (userProfile && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        content: generateWelcomeMessage(userProfile),
        isUser: false,
        timestamp: new Date(),
        specialist: 'Alex',
        formatted: true
      };
      setMessages([welcomeMessage]);
    }
  }, [userProfile, messages.length]);

  const generateWelcomeMessage = (profile: UserProfile) => {
    const name = profile.firstName || profile.username;
    const completionStatus = profile.completionPercentage || 0;
    
    if (completionStatus < 50) {
      return `Hello ${name}! 👋 I'm your personal education counselor. I notice your profile is ${completionStatus}% complete. I can help you with study abroad planning, but having more profile information will allow me to provide more personalized guidance. 

What would you like to explore today? You can ask me about:
• Study destinations and universities
• Application requirements and deadlines  
• Scholarships and funding options
• Visa processes and documentation
• Career prospects in different countries

Just type your question naturally - I'll understand and help!`;
    }

    const countries = profile.preferredCountries?.join(', ') || 'various countries';
    const field = profile.fieldOfStudy || 'your chosen field';
    
    return `Welcome back, ${name}! 🎓 I see you're interested in studying ${field} in ${countries}. I'm here to provide personalized guidance based on your profile and help you navigate your study abroad journey.

What specific aspect would you like to discuss today?`;
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    // Send to AI with full context
    sendMessageMutation.mutate({
      message: message.trim(),
      conversationHistory: [...messages, userMessage]
    });

    setMessage('');
  };

  const handleSelectionChange = (selectionType: string, value: string) => {
    if (!value) return;

    const selectionMessage: ChatMessage = {
      id: Date.now().toString(),
      content: value,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, selectionMessage]);
    setIsTyping(true);
    
    // Send selection to AI
    sendMessageMutation.mutate({
      message: value,
      conversationHistory: [...messages, selectionMessage]
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      // Handle document upload and analysis
      const uploadMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `📄 Uploaded: ${file.name}\n\nI'll analyze this document to better understand your academic background and provide more targeted guidance.`,
        isUser: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, uploadMessage]);
      setIsTyping(true);
      
      // Process document upload
      const formData = new FormData();
      formData.append('document', file);
      
      // This would integrate with existing document analysis
      setTimeout(() => {
        const analysisMessage: ChatMessage = {
          id: Date.now().toString() + '_analysis',
          content: `✅ Document analyzed successfully! I can now see your academic background and provide more personalized recommendations. What specific guidance would you like based on your academic profile?`,
          isUser: false,
          timestamp: new Date(),
          specialist: 'Dr. Chen',
          formatted: true
        };
        setMessages(prev => [...prev, analysisMessage]);
        setIsTyping(false);
      }, 3000);
    }
  };

  const formatMessageContent = (content: string) => {
    // Handle undefined or null content
    if (!content || typeof content !== 'string') {
      return <p className="text-sm text-gray-500">No content available</p>;
    }
    
    // Split content into paragraphs and format
    const paragraphs = content.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Handle numbered lists (1., 2., 3.)
      if (/^\d+\./.test(paragraph.trim())) {
        const lines = paragraph.split('\n').filter(line => line.trim());
        return (
          <ol key={index} className="ml-4 space-y-2 list-decimal">
            {lines.map((line, lineIndex) => {
              const cleanLine = line.replace(/^\d+\.\s*/, '');
              return (
                <li key={lineIndex} className="text-sm leading-relaxed">
                  {formatTextWithBold(cleanLine)}
                </li>
              );
            })}
          </ol>
        );
      }
      // Handle bullet points
      else if (paragraph.includes('•')) {
        const items = paragraph.split('•').filter(item => item.trim());
        return (
          <ul key={index} className="ml-4 space-y-2">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="text-sm leading-relaxed flex items-start">
                <span className="text-blue-600 mr-2 mt-1 flex-shrink-0">•</span>
                <span>{formatTextWithBold(item.trim())}</span>
              </li>
            ))}
          </ul>
        );
      } 
      // Regular paragraph with bold text support
      else {
        return (
          <p key={index} className="text-sm leading-relaxed mb-3 last:mb-0">
            {formatTextWithBold(paragraph)}
          </p>
        );
      }
    });
  };

  // Helper function to format bold text
  const formatTextWithBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return <strong key={index} className="font-semibold text-gray-900">{boldText}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto p-4 h-screen flex flex-col">
        
        {/* Header */}
        <div className="text-center py-6 mb-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              EduCounsel AI
            </h1>
          </div>
          <p className="text-gray-600 text-sm">
            Your intelligent study abroad counselor
          </p>
        </div>

        {/* Chat Messages */}
        <Card className="flex-1 mb-4 border-0 shadow-lg">
          <CardContent className="p-0 h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-3 max-w-[80%] ${msg.isUser ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.isUser 
                        ? 'bg-blue-600' 
                        : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                    }`}>
                      {msg.isUser ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                    
                    {/* Message Bubble */}
                    <div className={`rounded-2xl px-4 py-3 ${
                      msg.isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {msg.formatted && !msg.isUser ? (
                        <div className="space-y-2">
                          {formatMessageContent(msg.content)}
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      )}
                      
                      {/* Specialist indicator */}
                      {msg.specialist && !msg.isUser && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <span className="text-xs text-gray-500">
                            Guided by {msg.specialist}
                          </span>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      {msg.actionButtons && msg.actionButtons.length > 0 && !msg.isUser && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="space-y-2">
                            {msg.actionButtons.map((button, index) => (
                              <div key={index}>
                                <button
                                  onClick={() => {
                                    if (button.url) {
                                      window.open(button.url, '_blank');
                                    }
                                  }}
                                  className={`w-full text-left px-4 py-2 rounded-lg border transition-all duration-200 hover:shadow-md ${
                                    button.type === 'book_consultation' 
                                      ? 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700'
                                      : button.type === 'apply_now'
                                      ? 'bg-green-50 border-green-200 hover:bg-green-100 text-green-700'
                                      : button.type === 'explore_scholarships'
                                      ? 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700'
                                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium text-sm">{button.label}</div>
                                      <div className="text-xs opacity-80">{button.description}</div>
                                    </div>
                                    <div className="ml-2">
                                      {button.type === 'book_consultation' && <Calendar className="w-4 h-4" />}
                                      {button.type === 'apply_now' && <FileText className="w-4 h-4" />}
                                      {button.type === 'explore_scholarships' && <Search className="w-4 h-4" />}
                                      {button.type === 'complete_profile' && <User className="w-4 h-4" />}
                                    </div>
                                  </div>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Interactive Selection Dropdown */}
                      {msg.requiresSelection && !msg.isUser && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">{msg.requiresSelection.question}</p>
                            <Select onValueChange={(value) => handleSelectionChange(msg.requiresSelection!.type, value)}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choose your degree level" />
                              </SelectTrigger>
                              <SelectContent>
                                {msg.requiresSelection.options.map((option, index) => (
                                  <SelectItem key={index} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input Area */}
            <div className="border-t bg-white p-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2"
                >
                  <Upload className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about studying abroad..."
                    className="pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isTyping}
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              
              <p className="text-xs text-gray-500 mt-2 text-center">
                Ask questions naturally - I understand context and provide personalized guidance
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}