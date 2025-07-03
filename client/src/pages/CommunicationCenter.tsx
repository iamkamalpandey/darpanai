import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Video, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Users,
  Search,
  Plus,
  FileText,
  Paperclip
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderType: 'student' | 'admin' | 'expert';
  content: string;
  timestamp: string;
  isRead: boolean;
  attachments?: Array<{
    id: number;
    fileName: string;
    fileSize: number;
    fileType: string;
  }>;
}

interface Conversation {
  id: number;
  title: string;
  participants: Array<{
    id: number;
    name: string;
    type: 'student' | 'admin' | 'expert';
    avatar?: string;
    isOnline: boolean;
  }>;
  lastMessage: Message;
  unreadCount: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'closed' | 'waiting_response';
  applicationId?: number;
  createdAt: string;
}

export default function CommunicationCenter() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);

  // Fetch conversations
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['/api/conversations'],
    retry: false,
  });

  // Fetch messages for selected conversation
  const { data: messages = [] } = useQuery({
    queryKey: ['/api/conversations', selectedConversation, 'messages'],
    enabled: !!selectedConversation,
    retry: false,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { conversationId: number; content: string }) => {
      return apiRequest('POST', `/api/conversations/${data.conversationId}/messages`, {
        content: data.content
      });
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', selectedConversation, 'messages'] });
    },
  });

  // Mark messages as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: number) => {
      return apiRequest('POST', `/api/conversations/${conversationId}/mark-read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content: newMessage.trim()
    });
  };

  const handleSelectConversation = (conversationId: number) => {
    setSelectedConversation(conversationId);
    markAsReadMutation.mutate(conversationId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'waiting_response': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const filteredConversations = conversations.filter((conv: Conversation) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedConversationData = conversations.find((conv: Conversation) => conv.id === selectedConversation);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex bg-gray-50">
      {/* Conversations Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Messages
            </h2>
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowNewConversation(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredConversations.map((conversation: Conversation) => (
              <Card
                key={conversation.id}
                className={`mb-2 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedConversation === conversation.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => handleSelectConversation(conversation.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex -space-x-2">
                      {conversation.participants.slice(0, 2).map((participant, index) => (
                        <Avatar key={participant.id} className="h-8 w-8 border-2 border-white">
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback className="text-xs">
                            {participant.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-sm text-gray-900 truncate">
                          {conversation.title}
                        </h3>
                        <div className="flex items-center gap-1">
                          {conversation.unreadCount > 0 && (
                            <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                          <Badge className={`text-xs ${getPriorityColor(conversation.priority)}`}>
                            {conversation.priority}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 truncate mb-2">
                        {conversation.lastMessage.content}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <Badge className={`text-xs ${getStatusColor(conversation.status)}`}>
                          {conversation.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {conversation.lastMessage?.timestamp ? 
                            formatDistanceToNow(new Date(conversation.lastMessage.timestamp), { addSuffix: true }) : 
                            'No recent activity'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversationData ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {selectedConversationData.participants.map((participant) => (
                      <Avatar key={participant.id} className="h-10 w-10 border-2 border-white">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback>
                          {participant.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedConversationData.title}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedConversationData.participants.map(p => p.name).join(', ')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message: Message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.senderId === user?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.senderId !== user?.id && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {message.senderName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-xs lg:max-w-md ${
                      message.senderId === user?.id ? 'order-1' : 'order-2'
                    }`}>
                      <div
                        className={`p-3 rounded-lg ${
                          message.senderId === user?.id
                            ? 'bg-blue-600 text-white ml-auto'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.senderId !== user?.id && (
                          <p className="text-xs font-medium mb-1">{message.senderName}</p>
                        )}
                        <p className="text-sm">{message.content}</p>
                        
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.attachments.map((attachment) => (
                              <div key={attachment.id} className="flex items-center gap-2 text-xs">
                                <Paperclip className="h-3 w-3" />
                                <span>{attachment.fileName}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
                        message.senderId === user?.id ? 'justify-end' : 'justify-start'
                      }`}>
                        <Clock className="h-3 w-3" />
                        <span>{message.timestamp ? formatDistanceToNow(new Date(message.timestamp), { addSuffix: true }) : 'Just now'}</span>
                        {message.senderId === user?.id && (
                          <CheckCircle className={`h-3 w-3 ${message.isRead ? 'text-blue-600' : 'text-gray-400'}`} />
                        )}
                      </div>
                    </div>
                    
                    {message.senderId === user?.id && (
                      <Avatar className="h-8 w-8 order-2">
                        <AvatarFallback className="text-xs">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-end gap-2">
                <Button variant="outline" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[44px] max-h-32 resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                </div>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}