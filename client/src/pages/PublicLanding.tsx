import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bot, User, Send, Upload, Sparkles, Globe, Users, Award, 
  CheckCircle, ArrowRight, MessageCircle, Star, Shield,
  GraduationCap, FileText, Calculator, Search, MapPin,
  Clock, BookOpen, Zap, Heart, X, Minimize2
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  formatted?: boolean;
  actionButtons?: Array<{
    type: string;
    label: string;
    description: string;
  }>;
}

interface PublicChatResponse {
  response: string;
  specialist?: string;
  remainingResponses?: number;
  paywallTriggered?: boolean;
  actionButtons?: Array<{
    type: string;
    label: string;
    description: string;
  }>;
}

export default function PublicLanding() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [paywallTriggered, setPaywallTriggered] = useState(false);
  const [remainingResponses, setRemainingResponses] = useState(2);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Welcome message when chat opens
  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        content: `Hello! I'm Darpan Intelligence, your AI study abroad advisor. I help students like you navigate their international education journey.\n\nI can assist you with:\n• Finding the right universities and programs\n• Understanding costs and budgeting\n• Discovering scholarships and funding\n• Visa requirements and timelines\n• Application guidance and deadlines\n\nTo give you the best recommendations, I'd love to know more about you. What are you interested in studying?`,
        isUser: false,
        timestamp: new Date(),
        formatted: true,
        actionButtons: [
          {
            type: 'field_computer_science',
            label: 'Computer Science',
            description: 'I am interested in Computer Science and related technology fields'
          },
          {
            type: 'field_business',
            label: 'Business',
            description: 'I want to study Business, Management, or MBA programs'
          },
          {
            type: 'field_engineering',
            label: 'Engineering',
            description: 'I am interested in Engineering programs'
          },
          {
            type: 'field_other',
            label: 'Other Field',
            description: 'I want to explore other fields of study'
          }
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [isChatOpen, messages.length]);

  const sendMessageMutation = useMutation({
    mutationFn: async (request: { message: string; sessionId?: string }) => {
      // Generate session ID for tracking conversation
      const sessionId = sessionStorage.getItem('publicChatSession') || 
        `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      if (!sessionStorage.getItem('publicChatSession')) {
        sessionStorage.setItem('publicChatSession', sessionId);
      }

      const response = await fetch('/api/public/educounsel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: request.message,
          conversationId: sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json() as Promise<PublicChatResponse>;
    },
    onSuccess: (data) => {
      // Update paywall state
      if (data.paywallTriggered) {
        setPaywallTriggered(true);
      }
      
      if (typeof data.remainingResponses === 'number') {
        setRemainingResponses(data.remainingResponses);
      }

      const aiMessage: ChatMessage = {
        id: Date.now().toString() + '_ai',
        content: data.response,
        isUser: false,
        timestamp: new Date(),
        formatted: true,
        actionButtons: data.actionButtons
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '_error',
        content: 'Sorry, I encountered an issue. Please try again or create an account for full access to our platform.',
        isUser: false,
        timestamp: new Date(),
        formatted: true,
        actionButtons: [
          {
            type: 'create_account',
            label: 'Create Free Account',
            description: 'Get unlimited access to personalized guidance'
          },
          {
            type: 'retry',
            label: 'Try Again',
            description: 'Retry your message'
          }
        ]
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  });

  const handleSendMessage = () => {
    if (!message.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    sendMessageMutation.mutate({ message });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleActionButtonClick = (button: { type: string; label: string; description: string }) => {
    // Handle registration and login redirects (paywall actions)
    if (button.type === 'register') {
      window.location.href = '/register';
      return;
    }

    if (button.type === 'login') {
      window.location.href = '/login';
      return;
    }

    if (button.type === 'create_account') {
      window.location.href = '/register';
      return;
    }

    if (button.type === 'retry') {
      // Retry the last user message
      const lastUserMessage = messages.findLast(msg => msg.isUser);
      if (lastUserMessage) {
        setIsTyping(true);
        sendMessageMutation.mutate({ message: lastUserMessage.content });
      }
      return;
    }

    // For other buttons, send as chat message (only if paywall not triggered)
    if (!paywallTriggered) {
      const buttonMessage: ChatMessage = {
        id: Date.now().toString(),
        content: button.label,
        isUser: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, buttonMessage]);
      setIsTyping(true);

      sendMessageMutation.mutate({ message: button.description });
    }
  };

  const formatMessageContent = (content: string) => {
    if (!content || typeof content !== 'string') {
      return <p className="text-sm text-gray-500">No content available</p>;
    }

    const paragraphs = content.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Handle bullet lists
      if (paragraph.includes('•')) {
        const lines = paragraph.split('\n').filter(line => line.trim());
        return (
          <ul key={index} className="ml-4 space-y-1 list-none">
            {lines.map((line, lineIndex) => {
              if (line.includes('•')) {
                const cleanLine = line.replace('•', '').trim();
                return (
                  <li key={lineIndex} className="text-sm leading-relaxed flex items-start">
                    <span className="text-blue-500 mr-2 text-xs">•</span>
                    {cleanLine}
                  </li>
                );
              }
              return (
                <li key={lineIndex} className="text-sm leading-relaxed">
                  {line}
                </li>
              );
            })}
          </ul>
        );
      }

      return (
        <p key={index} className="text-sm leading-relaxed mb-2 last:mb-0">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Darpan Intelligence
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-gray-600 hover:text-blue-600 transition-colors">Services</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">How It Works</a>
              <a href="#success-stories" className="text-gray-600 hover:text-blue-600 transition-colors">Success Stories</a>
              <Button variant="outline" onClick={() => window.location.href = '/login'}>
                Sign In
              </Button>
              <Button onClick={() => window.location.href = '/register'}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="h-4 w-4" />
                Instant AI-Powered Guidance
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Your Study Abroad Journey{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Starts Here
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Get instant, personalized guidance on universities, costs, scholarships, and visa requirements. 
                Our AI advisor helps you make informed decisions every step of the way.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  size="lg" 
                  className="px-8 py-3 text-lg"
                  onClick={() => setIsChatOpen(true)}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Start Chatting Now
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-8 py-3 text-lg"
                  onClick={() => window.location.href = '/register'}
                >
                  Create Free Account
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
              <div className="flex items-center gap-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  100,000+ Students Guided
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  500+ Partner Universities
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  95% Success Rate
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Darpan Intelligence</h3>
                    <p className="text-sm text-gray-500">Your AI Study Abroad Advisor</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-2xl p-4 max-w-[80%]">
                    <p className="text-sm text-gray-800">
                      Hello! I can help you find the perfect university and guide you through your study abroad journey. 
                      What type of program are you interested in?
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => setIsChatOpen(true)}>
                      Computer Science
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsChatOpen(true)}>
                      Business
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsChatOpen(true)}>
                      Engineering
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Study Abroad Success
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From university selection to visa approval, our comprehensive platform guides you through every step
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: 'University Matching',
                description: 'Find universities that perfectly match your academic profile, career goals, and budget',
                color: 'blue'
              },
              {
                icon: Calculator,
                title: 'Cost Calculator',
                description: 'Get accurate estimates for tuition, living expenses, and all study abroad costs',
                color: 'green'
              },
              {
                icon: Award,
                title: 'Scholarship Finder',
                description: 'Discover scholarships and funding opportunities you qualify for',
                color: 'purple'
              },
              {
                icon: FileText,
                title: 'Document Analysis',
                description: 'AI-powered analysis of your academic documents and application materials',
                color: 'orange'
              },
              {
                icon: MapPin,
                title: 'Visa Guidance',
                description: 'Step-by-step visa application guidance with country-specific requirements',
                color: 'indigo'
              },
              {
                icon: BookOpen,
                title: 'Application Support',
                description: 'Complete application assistance from SOP writing to interview preparation',
                color: 'pink'
              }
            ].map((service, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardContent className="p-8">
                  <div className={`w-12 h-12 bg-${service.color}-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <service.icon className={`h-6 w-6 text-${service.color}-600`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Simple Steps to Your Dream University
            </h2>
            <p className="text-xl text-gray-600">
              Our proven process has helped thousands of students achieve their study abroad goals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Start Conversation',
                description: 'Chat with our AI advisor about your interests, goals, and preferences',
                icon: MessageCircle
              },
              {
                step: '02',
                title: 'Get Recommendations',
                description: 'Receive personalized university and program recommendations based on your profile',
                icon: GraduationCap
              },
              {
                step: '03',
                title: 'Apply & Succeed',
                description: 'Get guided support through applications, visa process, and preparation',
                icon: CheckCircle
              }
            ].map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-sm font-bold text-blue-600 mb-2">STEP {step.step}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
                
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full">
                    <ArrowRight className="h-6 w-6 text-gray-400 mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section id="success-stories" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Success Stories from Around the World
            </h2>
            <p className="text-xl text-gray-600">
              Real students, real results, real dreams achieved
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Priya Sharma',
                country: 'From India to Canada',
                program: 'Master\'s in Computer Science',
                university: 'University of Toronto',
                quote: 'The AI guidance helped me find the perfect program and secure a scholarship worth $25,000.',
                rating: 5
              },
              {
                name: 'Ahmed Hassan',
                country: 'From Egypt to Germany',
                program: 'Bachelor\'s in Engineering',
                university: 'Technical University of Munich',
                quote: 'Amazing support throughout the entire process. The cost calculator was incredibly accurate.',
                rating: 5
              },
              {
                name: 'Maria Garcia',
                country: 'From Mexico to Australia',
                program: 'MBA',
                university: 'University of Melbourne',
                quote: 'The personalized recommendations saved me months of research. Highly recommend!',
                rating: 5
              }
            ].map((story, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(story.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 italic mb-6 leading-relaxed">
                    "{story.quote}"
                  </blockquote>
                  <div className="border-t pt-6">
                    <div className="font-semibold text-gray-900">{story.name}</div>
                    <div className="text-sm text-gray-600 mb-1">{story.country}</div>
                    <div className="text-sm text-blue-600">{story.program}</div>
                    <div className="text-sm text-gray-500">{story.university}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Students Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              Your data is secure, your privacy is protected, your success is our priority
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 mb-16">
            {[
              { icon: Shield, title: 'Data Security', desc: 'Bank-level encryption' },
              { icon: Clock, title: '24/7 Support', desc: 'Always here to help' },
              { icon: CheckCircle, title: 'Verified Info', desc: 'Accurate, up-to-date data' },
              { icon: Heart, title: 'Student First', desc: 'Your success matters' }
            ].map((trust, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <trust.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{trust.title}</h3>
                <p className="text-gray-600 text-sm">{trust.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              onClick={() => setIsChatOpen(true)}
              className="px-8 py-3 text-lg"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Start Your Journey Today
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Darpan Intelligence</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Empowering students worldwide to achieve their international education dreams through AI-powered guidance.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">University Matching</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Scholarship Finder</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Visa Guidance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Document Analysis</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Study Guides</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Country Guides</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Darpan Intelligence. All rights reserved. Empowering global education since 2025.</p>
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      {!isChatOpen && (
        <Button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
          size="lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Interface */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full h-full sm:rounded-3xl sm:w-[90vw] sm:max-w-5xl sm:h-[95vh] flex flex-col shadow-2xl">
            {/* Chat Header - Enhanced */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 sm:rounded-t-3xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <Bot className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900">Darpan Intelligence</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-sm text-gray-600">AI Study Abroad Advisor • Online</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 h-10 w-10 p-0 rounded-full hover:bg-gray-100"
                >
                  <Minimize2 className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsChatOpen(false)}
                  className="text-gray-500 hover:text-gray-700 h-10 w-10 p-0 rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Chat Messages - Enhanced Full Screen */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-gradient-to-b from-gray-50 to-white">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-3 max-w-[80%] sm:max-w-[70%] ${msg.isUser ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
                      msg.isUser ? 'bg-blue-600' : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                    }`}>
                      {msg.isUser ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                    
                    <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                      msg.isUser 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-900 border border-gray-200'
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
                      
                      {!msg.isUser && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <span className="text-xs text-gray-500">
                            Guided by Darpan Intelligence
                          </span>
                        </div>
                      )}
                      
                      {msg.actionButtons && msg.actionButtons.length > 0 && !msg.isUser && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="grid gap-2">
                            {msg.actionButtons.map((button, index) => (
                              <button
                                key={index}
                                onClick={() => handleActionButtonClick(button)}
                                className="w-full text-left px-4 py-3 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all duration-200 hover:shadow-md hover:scale-[1.02] min-h-[44px] group"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-sm font-medium text-blue-700 group-hover:text-blue-800">{button.label}</div>
                                    <div className="text-xs text-blue-600 leading-tight mt-1">{button.description}</div>
                                  </div>
                                  <ArrowRight className="h-4 w-4 text-blue-500 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2 max-w-[85%]">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl px-3 py-2">
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
            
            {/* Input Area with Paywall Integration */}
            <div className="border-t bg-white p-4">
              {paywallTriggered ? (
                // Paywall UI - Chat disabled
                <div className="text-center py-6">
                  <div className="mb-4">
                    <Shield className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Free Trial Complete</h3>
                    <p className="text-gray-600 text-sm">
                      You've used your {2} free consultation messages. Create a free account to continue with unlimited AI guidance, document analysis, and personalized recommendations.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => window.location.href = '/register'}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-12 rounded-xl font-medium"
                    >
                      Create Free Account - Get Full Access
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => window.location.href = '/login'}
                      className="w-full h-12 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Already have an account? Sign In
                    </Button>
                  </div>
                </div>
              ) : (
                // Normal chat input
                <>
                  <div className="flex items-end gap-3">
                    <div className="flex-1 relative">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about studying abroad..."
                        className="pr-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 text-base rounded-xl"
                        disabled={isTyping}
                        maxLength={500}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || isTyping}
                        size="sm"
                        className="absolute right-2 top-2 h-8 w-8 p-0 rounded-lg"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <span>
                      {remainingResponses > 0 
                        ? `${remainingResponses} free responses remaining` 
                        : "Get instant guidance on universities, costs, and applications"
                      }
                    </span>
                    <span className={`${message.length > 450 ? 'text-orange-500' : ''}`}>
                      {message.length}/500
                    </span>
                  </div>
                  
                  {sendMessageMutation.error && (
                    <div className="mt-2 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                      Connection issue. Please check your internet and try again.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}