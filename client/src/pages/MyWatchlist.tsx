import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Calendar, MapPin, DollarSign, Clock, BookOpen, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface WatchlistItem {
  id: number;
  scholarshipId: number;
  scholarshipName: string;
  providerName: string;
  hostCountries: string[];
  fundingType: string;
  totalValueMax: string;
  applicationDeadline: string;
  tags: string[];
  notes: string;
  status: string;
  priority: string;
  savedAt: string;
}

export default function MyWatchlist() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's watchlist
  const { data: watchlistData, isLoading } = useQuery({
    queryKey: ['/api/watchlist'],
    enabled: true
  });

  const watchlist: WatchlistItem[] = watchlistData?.data?.watchlist || watchlistData?.watchlist || [];

  // Remove from watchlist mutation
  const removeFromWatchlist = useMutation({
    mutationFn: (scholarshipId: number) => 
      apiRequest('DELETE', `/api/watchlist/remove/${scholarshipId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      toast({
        title: "Success",
        description: "Scholarship removed from watchlist",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove scholarship",
        variant: "destructive",
      });
    }
  });

  // Filter watchlist items
  const filteredWatchlist = watchlist.filter(item => {
    const matchesSearch = item.scholarshipName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.providerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleRemove = (scholarshipId: number) => {
    removeFromWatchlist.mutate(scholarshipId);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'saved': return 'bg-blue-100 text-blue-800';
      case 'applied': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'awarded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDeadline = (deadline: string) => {
    if (!deadline) return 'No deadline specified';
    
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysUntil = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) {
      return `Deadline passed (${Math.abs(daysUntil)} days ago)`;
    } else if (daysUntil === 0) {
      return 'Deadline today!';
    } else if (daysUntil <= 30) {
      return `${daysUntil} days remaining`;
    } else {
      return deadlineDate.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your watchlist...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Scholarship Watchlist</h1>
        <p className="text-gray-600">
          Track and manage your saved scholarships. Stay organized with deadlines and application status.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Total Saved</p>
                <p className="text-xl font-semibold">{watchlist.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-orange-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Pending Applications</p>
                <p className="text-xl font-semibold">
                  {watchlist.filter(item => item.status === 'saved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Applied</p>
                <p className="text-xl font-semibold">
                  {watchlist.filter(item => item.status === 'applied').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-purple-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-xl font-semibold">
                  {watchlist.filter(item => item.priority === 'high').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="h-5 w-5 mr-2" />
            Filter & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search scholarships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="saved">Saved</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="awarded">Awarded</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="normal">Normal Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Watchlist Items */}
      {filteredWatchlist.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No scholarships in watchlist</h3>
            <p className="text-gray-600 mb-4">
              {watchlist.length === 0 
                ? "Start exploring scholarships and save the ones you're interested in."
                : "No scholarships match your current filters."
              }
            </p>
            <Button 
              onClick={() => window.location.href = '/scholarship-research'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Browse Scholarships
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredWatchlist.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {item.scholarshipName}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityBadgeColor(item.priority)}>
                          {item.priority} priority
                        </Badge>
                        <Badge className={getStatusBadgeColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{item.providerName}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{(item.hostCountries || []).join(', ') || 'Not specified'}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span>
                          {item.fundingType || 'Funding type not specified'}
                          {item.totalValueMax && ` - Up to ${item.totalValueMax}`}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{formatDeadline(item.applicationDeadline)}</span>
                      </div>
                    </div>
                    
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {item.notes && (
                      <div className="bg-gray-50 p-3 rounded-lg mb-4">
                        <p className="text-sm text-gray-700">
                          <strong>Notes:</strong> {item.notes}
                        </p>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      Saved on {new Date(item.savedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemove(item.scholarshipId)}
                      disabled={removeFromWatchlist.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}