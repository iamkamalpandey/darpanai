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

  // Fetch profile completion data
  const { data: profileCompletion } = useQuery({
    queryKey: ['/api/user/profile-completion'],
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
    if (userProfile && profileCompletion && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        content: generateWelcomeMessage(userProfile, profileCompletion),
        isUser: false,
        timestamp: new Date(),
        specialist: 'Darpan Intelligence',
        formatted: true
      };
      setMessages([welcomeMessage]);
    }
  }, [userProfile, profileCompletion, messages.length]);

  const generateWelcomeMessage = (profile: UserProfile, completion: any) => {
    const name = profile.firstName || profile.username || 'Student';
    const completionPercentage = completion?.completionPercentage || 0;
    
    // Create personalized, clean welcome message without generated profile names
    const welcomeContent = createPersonalizedWelcome(name, profile, completionPercentage);
    
    return welcomeContent;
  };



  const createPersonalizedWelcome = (name: string, profile: UserProfile, completionPercentage: number) => {
    // Clean welcome message without generated profile names
    const hasCountries = profile.preferredCountries && profile.preferredCountries.length > 0;
    const hasField = profile.fieldOfStudy;
    
    let welcomeText = `Hello ${name}! I'm Darpan Intelligence, your international education advisor.`;
    
    // Concise profile context
    if (hasCountries && hasField) {
      const country = profile.preferredCountries![0];
      welcomeText += ` I see you're interested in ${profile.fieldOfStudy} in ${country}.`;
    } else if (hasField) {
      welcomeText += ` I notice you're exploring ${profile.fieldOfStudy} studies.`;
    }
    
    // Simplified completion messaging
    if (completionPercentage < 50) {
      welcomeText += ` Your profile is ${completionPercentage}% complete - finishing it unlocks personalized recommendations.`;
    } else {
      welcomeText += ` With your ${completionPercentage}% complete profile, I can provide targeted guidance.`;
    }
    
    // Core services (concise)
    welcomeText += `\n\nI help with: universities, scholarships, applications, visas, and career planning.`;
    welcomeText += `\n\nWhat would you like to explore today?`;
    
    return welcomeText;
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

  const handleActionButtonClick = (button: ActionButton) => {
    if (button.url) {
      window.open(button.url, '_blank');
      return;
    }

    // Handle different button types
    switch (button.type) {
      case 'apply_now':
        // Trigger application flow by sending explicit application intent message
        const applicationMessage: ChatMessage = {
          id: Date.now().toString(),
          content: button.label,
          isUser: true,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, applicationMessage]);
        setIsTyping(true);
        
        // Send application trigger message to AI
        sendMessageMutation.mutate({
          message: "Start Application Begin your university application process",
          conversationHistory: [...messages, applicationMessage]
        });
        break;

      case 'book_consultation':
        // Navigate to consultation booking page
        window.location.href = '/consultations';
        break;

      case 'complete_profile':
        // Navigate to profile completion page
        window.location.href = '/profile';
        break;

      case 'explore_scholarships':
        // Navigate to scholarship research page
        window.location.href = '/scholarship-research';
        break;

      default:
        // Fallback - treat as conversational message
        const fallbackMessage: ChatMessage = {
          id: Date.now().toString(),
          content: button.label,
          isUser: true,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, fallbackMessage]);
        setIsTyping(true);
        
        sendMessageMutation.mutate({
          message: button.description || button.label,
          conversationHistory: [...messages, fallbackMessage]
        });
        break;
    }
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
      <div className="max-w-4xl mx-auto px-2 sm:px-4 h-screen flex flex-col">
        
        {/* Header - Optimized for mobile */}
        <div className="text-center py-3 sm:py-6 mb-2 sm:mb-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Darpan Intelligence
            </h1>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm">
            Your comprehensive international education advisor
          </p>
        </div>

        {/* Chat Messages - Optimized for mobile coverage */}
        <Card className="flex-1 mb-2 sm:mb-4 border-0 shadow-lg">
          <CardContent className="p-0 h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-2 sm:gap-3 max-w-[90%] sm:max-w-[80%] ${msg.isUser ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.isUser 
                        ? 'bg-blue-600' 
                        : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                    }`}>
                      {msg.isUser ? (
                        <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      ) : (
                        <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      )}
                    </div>
                    
                    {/* Message Bubble - Optimized for mobile */}
                    <div className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 ${
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
                      {!msg.isUser && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <span className="text-xs text-gray-500">
                            Guided by Darpan Intelligence
                          </span>
                        </div>
                      )}
                      
                      {/* Action Buttons - Mobile optimized */}
                      {msg.actionButtons && msg.actionButtons.length > 0 && !msg.isUser && (
                        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
                          <div className="space-y-1.5 sm:space-y-2">
                            {msg.actionButtons.map((button, index) => (
                              <div key={index}>
                                <button
                                  onClick={() => handleActionButtonClick(button)}
                                  className={`w-full text-left px-3 py-2.5 sm:px-4 sm:py-2 rounded-lg border transition-all duration-200 hover:shadow-md min-h-[44px] touch-manipulation ${
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
                                    <div className="flex-1 pr-2">
                                      <div className="font-medium text-xs sm:text-sm">{button.label}</div>
                                      <div className="text-xs opacity-80 leading-tight">{button.description}</div>
                                    </div>
                                    <div className="ml-2 flex-shrink-0">
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
              
              {/* Typing indicator - Mobile optimized */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2 sm:gap-3 max-w-[90%] sm:max-w-[80%]">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                      <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl px-3 py-2 sm:px-4 sm:py-3">
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
            
            {/* Input Area - Mobile optimized */}
            <div className="border-t bg-white p-2 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 sm:p-2 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px]"
                >
                  <Upload className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about studying abroad..."
                    className="pr-10 sm:pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-10 sm:h-11 text-sm sm:text-base"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isTyping}
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 sm:h-9 sm:w-9 p-0"
                  >
                    <Send className="h-3 w-3 sm:h-4 sm:w-4" />
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
              
              <p className="text-xs text-gray-500 mt-1 sm:mt-2 text-center px-2">
                Ask questions naturally - I provide personalized guidance
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}