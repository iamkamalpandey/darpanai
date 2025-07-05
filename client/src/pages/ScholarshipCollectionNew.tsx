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
  List,
  Award,
  Users,
  Clock,
  FilterX
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";

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
  const [countryFilter, setCountryFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch saved scholarships
  const { data: savedData = { scholarships: [], total: 0 }, isLoading: savedLoading } = useQuery({
    queryKey: ['/api/user-scholarships/saved'],
  });

  // Fetch watchlist items
  const { data: watchlistData = { items: [], total: 0 }, isLoading: watchlistLoading } = useQuery({
    queryKey: ['/api/user-scholarships/watchlist'],
  });

  // Remove from saved scholarships
  const removeSavedMutation = useMutation({
    mutationFn: (scholarshipId: number) => 
      apiRequest('DELETE', `/api/user-scholarships/saved/${scholarshipId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-scholarships/saved'] });
      toast({
        title: "Removed from saved",
        description: "Scholarship removed from your saved collection.",
      });
    },
  });

  // Remove from watchlist
  const removeWatchlistMutation = useMutation({
    mutationFn: (scholarshipId: number) => 
      apiRequest('DELETE', `/api/user-scholarships/watchlist/${scholarshipId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-scholarships/watchlist'] });
      toast({
        title: "Removed from watchlist",
        description: "Scholarship removed from your watchlist.",
      });
    },
  });

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setCountryFilter("");
    setLevelFilter("");
    setSortBy("date");
  };

  // Filter function
  const filterItems = (items: (SavedScholarship | WatchlistItem)[]) => {
    return items.filter(item => {
      const scholarship = item.scholarship;
      const matchesSearch = scholarship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           scholarship.provider.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCountry = !countryFilter || scholarship.countries.includes(countryFilter);
      const matchesLevel = !levelFilter || scholarship.studyLevels.includes(levelFilter);
      
      return matchesSearch && matchesCountry && matchesLevel;
    });
  };

  // Sort function
  const sortItems = (items: (SavedScholarship | WatchlistItem)[]) => {
    return [...items].sort((a, b) => {
      const dateA = new Date('savedAt' in a ? a.savedAt : a.addedAt);
      const dateB = new Date('savedAt' in b ? b.savedAt : b.addedAt);
      
      switch (sortBy) {
        case "date":
          return dateB.getTime() - dateA.getTime();
        case "name":
          return a.scholarship.name.localeCompare(b.scholarship.name);
        case "deadline":
          return new Date(a.scholarship.deadline).getTime() - new Date(b.scholarship.deadline).getTime();
        default:
          return 0;
      }
    });
  };

  const renderScholarshipCard = (item: SavedScholarship | WatchlistItem, type: "saved" | "watchlist") => {
    const scholarship = item.scholarship;
    const isSaved = type === "saved";
    
    return (
      <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                {scholarship.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <Globe className="w-4 h-4" />
                <span>{scholarship.provider.name}</span>
                <span className="text-gray-400">•</span>
                <span>{scholarship.provider.country}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (isSaved) {
                  removeSavedMutation.mutate(scholarship.id);
                } else {
                  removeWatchlistMutation.mutate(scholarship.id);
                }
              }}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 line-clamp-2">{scholarship.description}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-green-600">{scholarship.amount}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span className="text-gray-700">{scholarship.deadline}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {scholarship.studyLevels?.slice(0, 2).map((level, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {level}
              </Badge>
            ))}
            {scholarship.studyLevels?.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{scholarship.studyLevels.length - 2} more
              </Badge>
            )}
          </div>
          
          <div className="flex gap-2 pt-2">
            <Link href={`/scholarship-details/${scholarship.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(scholarship.provider.website, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const filteredSaved = sortItems(filterItems(savedData.scholarships || []));
  const filteredWatchlist = sortItems(filterItems(watchlistData.items || []));

  return (
    <DashboardLayout>
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">My Scholarships</h1>
              <p className="text-sm text-gray-600">Manage your saved scholarships and watchlist</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <div>
                    <p className="text-xs text-gray-600">Saved</p>
                    <p className="text-lg font-bold text-gray-900">{savedData.scholarships?.length || 0}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <div>
                    <p className="text-xs text-gray-600">Watchlist</p>
                    <p className="text-lg font-bold text-gray-900">{watchlistData.items?.length || 0}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Filter className="w-4 h-4" />
                Filters & Search
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search scholarships..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Country Filter */}
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Countries</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                </SelectContent>
              </Select>

              {/* Study Level Filter */}
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by study level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Levels</SelectItem>
                  <SelectItem value="Bachelor's">Bachelor's</SelectItem>
                  <SelectItem value="Master's">Master's</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                  <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date Added</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {(searchTerm || countryFilter || levelFilter || sortBy !== "date") && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearFilters}
                  className="w-full"
                >
                  <FilterX className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>

            {/* View Mode */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">View:</span>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Quick Actions</p>
              <Link href="/scholarship-hub">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Search className="w-4 h-4 mr-2" />
                  Find More Scholarships
                </Button>
              </Link>
              <Link href="/scholarship-recommendations">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Target className="w-4 h-4 mr-2" />
                  Get Recommendations
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <Tabs defaultValue="saved" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="saved" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Saved Scholarships ({filteredSaved.length})
              </TabsTrigger>
              <TabsTrigger value="watchlist" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Watchlist ({filteredWatchlist.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="saved" className="space-y-6">
              {savedLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="h-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredSaved.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved scholarships</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || countryFilter || levelFilter 
                      ? "No scholarships match your current filters."
                      : "Start saving scholarships to build your collection."
                    }
                  </p>
                  <Link href="/scholarship-hub">
                    <Button>
                      <Search className="w-4 h-4 mr-2" />
                      Explore Scholarships
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className={viewMode === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                  : "space-y-4"
                }>
                  {filteredSaved.map((item) => renderScholarshipCard(item, "saved"))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="watchlist" className="space-y-6">
              {watchlistLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="h-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredWatchlist.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No watchlist items</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || countryFilter || levelFilter 
                      ? "No scholarships match your current filters."
                      : "Add scholarships to your watchlist to track them."
                    }
                  </p>
                  <Link href="/scholarship-hub">
                    <Button>
                      <Search className="w-4 h-4 mr-2" />
                      Explore Scholarships
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className={viewMode === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                  : "space-y-4"
                }>
                  {filteredWatchlist.map((item) => renderScholarshipCard(item, "watchlist"))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}