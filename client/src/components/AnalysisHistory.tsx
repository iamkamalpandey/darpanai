import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Analysis } from '@shared/schema';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarIcon, FileText, Search } from 'lucide-react';
import { format } from 'date-fns';

type RejectionReason = {
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
};

type Recommendation = {
  title: string;
  description: string;
};

type NextStep = {
  title: string;
  description: string;
};

export default function AnalysisHistory() {
  const { toast } = useToast();
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);

  const { data: analyses, isLoading, error } = useQuery<Analysis[]>({
    queryKey: ['/api/analyses'],
    refetchOnWindowFocus: false,
    refetchInterval: 5000
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  const truncateText = (text: string, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const viewAnalysis = (id: number) => {
    fetch(`/api/analyses/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch analysis');
        return res.json();
      })
      .then(data => {
        setSelectedAnalysis(data);
      })
      .catch(err => {
        toast({
          title: "Error fetching analysis",
          description: (err as Error).message,
          variant: "destructive"
        });
      });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analysis History</CardTitle>
          <CardDescription>Loading your past analyses...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analysis History</CardTitle>
          <CardDescription>There was an error loading your analysis history.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error: {(error as Error).message}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Log data for debugging
  console.log("Analysis data:", analyses);
  
  return (
    <div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Analysis History</CardTitle>
          <CardDescription>View your past visa rejection letter analyses</CardDescription>
        </CardHeader>
        <CardContent>
          {analyses && analyses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyses.map((analysis: Analysis) => (
                  <TableRow key={analysis.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                        {truncateText(analysis.filename, 20)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                        {formatDate(analysis.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>{truncateText(analysis.summary, 40)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => viewAnalysis(analysis.id)}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No analysis history found. Upload a document to start analyzing.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedAnalysis && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{selectedAnalysis.filename}</CardTitle>
                <CardDescription>Analyzed on {formatDate(selectedAnalysis.createdAt)}</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedAnalysis(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="max-w-full min-w-0 overflow-hidden">
            <div className="space-y-6 min-w-0">
              <div className="min-w-0">
                <h3 className="text-lg font-medium mb-2">Summary</h3>
                <p className="text-gray-700 dark:text-gray-300 break-words whitespace-pre-wrap">{selectedAnalysis.summary}</p>
              </div>

              <div className="min-w-0">
                <h3 className="text-lg font-medium mb-2">Rejection Reasons</h3>
                <div className="space-y-4 min-w-0">
                  {(selectedAnalysis.rejectionReasons as RejectionReason[]).map((reason, index) => (
                    <div 
                      key={index} 
                      className={`border-l-4 ${
                        reason.severity === 'high' ? 'border-red-500' :
                        reason.severity === 'medium' ? 'border-orange-500' :
                        'border-yellow-500'
                      } pl-4 py-2 min-w-0 overflow-hidden`}
                    >
                      <h4 className="font-medium break-words">{reason.title}</h4>
                      <p className="text-gray-600 dark:text-gray-400 break-words whitespace-pre-wrap">{reason.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="min-w-0">
                <h3 className="text-lg font-medium mb-2">Recommendations</h3>
                <div className="space-y-3 min-w-0">
                  {(selectedAnalysis.recommendations as Recommendation[]).map((rec, index) => (
                    <div key={index} className="bg-blue-50 dark:bg-gray-700 p-3 rounded min-w-0 overflow-hidden">
                      <h4 className="font-medium break-words">{rec.title}</h4>
                      <p className="text-gray-600 dark:text-gray-400 break-words whitespace-pre-wrap">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="min-w-0">
                <h3 className="text-lg font-medium mb-2">Next Steps</h3>
                <div className="space-y-3 min-w-0">
                  {(selectedAnalysis.nextSteps as NextStep[]).map((step, index) => (
                    <div key={index} className="flex flex-col space-y-2 p-3 bg-gray-50 rounded min-w-0">
                      <div className="flex items-start space-x-3">
                        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium break-words">{step.title}</h4>
                          <p className="text-gray-600 dark:text-gray-400 break-words whitespace-pre-wrap mt-1">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}