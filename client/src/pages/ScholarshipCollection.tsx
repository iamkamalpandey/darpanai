import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Heart, 
  Eye, 
  Star,
  Search,
  Filter,
  Globe,
  Calendar,
  DollarSign,
  GraduationCap,
  Trash2,
  ExternalLink,
  ArrowLeft,
  BookmarkPlus,
  Target,
  SortAsc,
  Grid,
  List
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SavedScholarship {
  id: number;
  scholarshipId: number;
  savedAt: Date;
  scholarship: {
    id: number;
    name: string;
    provider: {
      name: string;
      country: string;
      website: string;
    };
    amount: string;
    deadline: string;
    difficulty: string;
    studyLevels: string[];
    countries: string[];
    matchScore?: number;
    description: string;
  };
}

interface WatchlistItem {
  id: number;
  scholarshipId: number;
  addedAt: Date;
  scholarship: {
    id: number;
    name: string;
    provider: {
      name: string;
      country: string;
      website: string;
    };
    amount: string;
    deadline: string;
    difficulty: string;
    studyLevels: string[];
    countries: string[];
    description: string;
  };
}

export default function ScholarshipCollection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCountry, setFilterCountry] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch saved scholarships
  const { data: savedData, isLoading: isLoadingSaved } = useQuery({
    queryKey: ['/api/user-scholarships/saved'],
  });

  // Fetch watchlist
  const { data: watchlistData, isLoading: isLoadingWatchlist } = useQuery({
    queryKey: ['/api/user-scholarships/watchlist'],
  });

  // Remove from saved scholarships
  const removeSavedMutation = useMutation({
    mutationFn: (scholarshipId: number) => 
      apiRequest('POST', '/api/user-scholarships/remove-saved', { scholarshipId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-scholarships/saved'] });
      toast({
        title: "Removed from collection",
        description: "Scholarship has been removed from your saved collection.",
      });
    },
  });

  // Remove from watchlist
  const removeWatchlistMutation = useMutation({
    mutationFn: (scholarshipId: number) => 
      apiRequest('POST', '/api/user-scholarships/remove-watchlist', { scholarshipId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-scholarships/watchlist'] });
      toast({
        title: "Removed from watchlist",
        description: "Scholarship has been removed from your watchlist.",
      });
    },
  });

  // Move from watchlist to saved
  const moveToSavedMutation = useMutation({
    mutationFn: (scholarshipId: number) => 
      apiRequest('POST', '/api/user-scholarships/move-to-saved', { scholarshipId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-scholarships/saved'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user-scholarships/watchlist'] });
      toast({
        title: "Moved to collection",
        description: "Scholarship has been moved to your saved collection.",
      });
    },
  });

  const savedScholarships: SavedScholarship[] = savedData?.scholarships || [];
  const watchlistItems: WatchlistItem[] = watchlistData?.items || [];

  // Filter and sort function
  const filterAndSort = (items: (SavedScholarship | WatchlistItem)[]) => {
    let filtered = items.filter(item => {
      const scholarship = item.scholarship;
      const matchesSearch = scholarship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           scholarship.provider.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCountry = filterCountry === "all" || scholarship.countries.some(c => c === filterCountry);
      const matchesDifficulty = filterDifficulty === "all" || scholarship.difficulty === filterDifficulty;
      
      return matchesSearch && matchesCountry && matchesDifficulty;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.scholarship.name.localeCompare(b.scholarship.name);
        case "deadline":
          return new Date(a.scholarship.deadline).getTime() - new Date(b.scholarship.deadline).getTime();
        case "amount":
          return a.scholarship.amount.localeCompare(b.scholarship.amount);
        case "saved":
          return new Date(b.savedAt || b.addedAt).getTime() - new Date(a.savedAt || a.addedAt).getTime();
        default:
          return 0;
      }
    });
  };

  const ScholarshipCard = ({ item, type }: { item: SavedScholarship | WatchlistItem, type: 'saved' | 'watchlist' }) => {
    const scholarship = item.scholarship;
    const isDeadlineSoon = new Date(scholarship.deadline).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000; // 30 days

    return (
      <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                {scholarship.name}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">{scholarship.provider.name}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {scholarship.provider.country}
                </Badge>
                <Badge 
                  variant={scholarship.difficulty === 'High' ? 'destructive' : 
                          scholarship.difficulty === 'Medium' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {scholarship.difficulty}
                </Badge>
                {isDeadlineSoon && (
                  <Badge variant="destructive" className="text-xs animate-pulse">
                    Deadline Soon
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              {'matchScore' in item.scholarship && item.scholarship.matchScore && (
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{item.scholarship.matchScore}%</div>
                  <div className="text-xs text-gray-500">Match</div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {scholarship.description}
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span>{scholarship.amount}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span>{new Date(scholarship.deadline).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <div className="flex flex-wrap gap-1">
              {scholarship.studyLevels.slice(0, 2).map((level, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {level}
                </Badge>
              ))}
              {scholarship.studyLevels.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{scholarship.studyLevels.length - 2}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href={`/scholarship-details/${scholarship.id}`}>
              <Button size="sm" variant="outline" className="flex-1">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </Link>
            
            {type === 'saved' ? (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => removeSavedMutation.mutate(scholarship.id)}
                disabled={removeSavedMutation.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => moveToSavedMutation.mutate(scholarship.id)}
                  disabled={moveToSavedMutation.isPending}
                >
                  <Heart className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => removeWatchlistMutation.mutate(scholarship.id)}
                  disabled={removeWatchlistMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            <Button size="sm" asChild>
              <a href={scholarship.provider.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ScholarshipListItem = ({ item, type }: { item: SavedScholarship | WatchlistItem, type: 'saved' | 'watchlist' }) => {
    const scholarship = item.scholarship;
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg line-clamp-1">{scholarship.name}</h3>
                  <p className="text-sm text-gray-600">{scholarship.provider.name} • {scholarship.provider.country}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>{scholarship.amount}</span>
                    <span>Due: {new Date(scholarship.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {'matchScore' in item.scholarship && item.scholarship.matchScore && (
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">{item.scholarship.matchScore}%</div>
                    <div className="text-xs text-gray-500">Match</div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Link href={`/scholarship-details/${scholarship.id}`}>
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Details
                </Button>
              </Link>
              
              {type === 'saved' ? (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => removeSavedMutation.mutate(scholarship.id)}
                  disabled={removeSavedMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => moveToSavedMutation.mutate(scholarship.id)}
                    disabled={moveToSavedMutation.isPending}
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => removeWatchlistMutation.mutate(scholarship.id)}
                    disabled={removeWatchlistMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/scholarship-hub" className="text-gray-600 hover:text-gray-900">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Hub
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Scholarship Hub</span>
              <span>/</span>
              <span className="text-gray-900">My Collection</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            My Scholarship Collection
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage your saved scholarships and watchlist. Keep track of deadlines and application progress.
          </p>
        </div>

        {/* Filter and Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search scholarships..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filterCountry} onValueChange={setFilterCountry}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    <SelectItem value="United States">USA</SelectItem>
                    <SelectItem value="United Kingdom">UK</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SortAsc className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="saved">Date Added</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="saved" className="space-y-6">
          <div className="flex items-center justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2 rounded-xl">
              <TabsTrigger 
                value="saved" 
                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
              >
                <Heart className="w-4 h-4" />
                <span>Saved Collection</span>
                <Badge variant="secondary" className="ml-1 bg-red-100 text-red-700">
                  {savedScholarships.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="watchlist" 
                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
              >
                <Star className="w-4 h-4" />
                <span>Watchlist</span>
                <Badge variant="secondary" className="ml-1 bg-yellow-100 text-yellow-700">
                  {watchlistItems.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Saved Scholarships */}
          <TabsContent value="saved" className="space-y-6">
            {isLoadingSaved ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filterAndSort(savedScholarships).length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterAndSort(savedScholarships).map((item) => (
                    <ScholarshipCard key={item.id} item={item} type="saved" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filterAndSort(savedScholarships).map((item) => (
                    <ScholarshipListItem key={item.id} item={item} type="saved" />
                  ))}
                </div>
              )
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved scholarships yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start saving scholarships from the hub to build your collection.
                  </p>
                  <Link href="/scholarship-hub">
                    <Button>
                      <Target className="w-4 h-4 mr-2" />
                      Explore Scholarships
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Watchlist */}
          <TabsContent value="watchlist" className="space-y-6">
            {isLoadingWatchlist ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filterAndSort(watchlistItems).length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterAndSort(watchlistItems).map((item) => (
                    <ScholarshipCard key={item.id} item={item} type="watchlist" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filterAndSort(watchlistItems).map((item) => (
                    <ScholarshipListItem key={item.id} item={item} type="watchlist" />
                  ))}
                </div>
              )
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <BookmarkPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No items in watchlist</h3>
                  <p className="text-gray-600 mb-4">
                    Add scholarships to your watchlist to keep track of opportunities you're considering.
                  </p>
                  <Link href="/scholarship-hub">
                    <Button>
                      <Target className="w-4 h-4 mr-2" />
                      Explore Scholarships
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}