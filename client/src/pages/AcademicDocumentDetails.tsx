import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Calendar, Clock, CheckCircle, AlertCircle, User, GraduationCap, MapPin, Building, Award, BookOpen, TrendingUp } from 'lucide-react';
import { AcademicDocumentAnalysisResults } from '@shared/academicDocumentSchema';

interface AcademicDocumentAnalysis {
  id: number;
  fileName: string;
  fileSize: number;
  analysisResults: AcademicDocumentAnalysisResults;
  processingTime: number;
  tokensUsed: number;
  confidence?: number;
  extractedText: string;
  createdAt: string;
  isAppliedToProfile: boolean;
}

export default function AcademicDocumentDetails() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const { data: analysis, isLoading, error } = useQuery<AcademicDocumentAnalysis>({
    queryKey: ['/api/academic-document-analyses', id],
    queryFn: async () => {
      const response = await fetch(`/api/academic-document-analyses/${id}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch academic document analysis');
      }
      return response.json();
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded-md w-1/3"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-red-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-900">Document Not Found</CardTitle>
            </div>
            <CardDescription>
              The academic document analysis you're looking for could not be found or you don't have permission to view it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/enhanced-academic-document-analysis')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Academic Documents
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { analysisResults } = analysis;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const InfoItem = ({ icon: Icon, label, value }: { icon: any, label: string, value?: string }) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
        <Icon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600 break-words">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation('/enhanced-academic-document-analysis')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Academic Document Details</h1>
            <p className="text-gray-600">{analysis.fileName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {analysis.isAppliedToProfile && (
            <Badge variant="default" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Applied to Profile
            </Badge>
          )}
          <Badge variant="outline">
            {analysis.confidence && analysis.confidence > 0.8 ? 'High Confidence' : 
             analysis.confidence && analysis.confidence > 0.5 ? 'Medium Confidence' : 'Low Confidence'}
          </Badge>
        </div>
      </div>

      {/* Document Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p><span className="font-medium">File Name:</span> {analysis.fileName}</p>
            <p><span className="font-medium">File Size:</span> {formatFileSize(analysis.fileSize)}</p>
            <p><span className="font-medium">Processing Time:</span> {Math.round(analysis.processingTime / 1000)}s</p>
          </div>
          <div className="space-y-2">
            <p><span className="font-medium">Analyzed:</span> {formatDate(analysis.createdAt)}</p>
            <p><span className="font-medium">Confidence:</span> {analysis.confidence ? `${Math.round(analysis.confidence * 100)}%` : 'N/A'}</p>
            <p><span className="font-medium">Characters Extracted:</span> {analysis.extractedText?.length || 0}</p>
          </div>
        </CardContent>
      </Card>

      {/* Institution Information */}
      {(analysisResults.institutionName || analysisResults.institutionCountry || analysisResults.institutionCity) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Institution Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem icon={Building} label="Institution Name" value={analysisResults.institutionName} />
            <InfoItem icon={MapPin} label="Country" value={analysisResults.institutionCountry} />
            <InfoItem icon={MapPin} label="City" value={analysisResults.institutionCity} />
            <InfoItem icon={Building} label="Institution Type" value={analysisResults.institutionType} />
          </CardContent>
        </Card>
      )}

      {/* Qualification Details */}
      {(analysisResults.qualificationLevel || analysisResults.qualificationTitle || analysisResults.fieldOfStudy) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Qualification Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem icon={Award} label="Qualification Level" value={analysisResults.qualificationLevel} />
            <InfoItem icon={BookOpen} label="Qualification Title" value={analysisResults.qualificationTitle} />
            <InfoItem icon={BookOpen} label="Field of Study" value={analysisResults.fieldOfStudy} />
            <InfoItem icon={BookOpen} label="Major" value={analysisResults.major} />
            <InfoItem icon={BookOpen} label="Minor" value={analysisResults.minor} />
            <InfoItem icon={BookOpen} label="Specialization" value={analysisResults.specialization} />
          </CardContent>
        </Card>
      )}

      {/* Academic Performance */}
      {(analysisResults.gpa || analysisResults.overallGrade || analysisResults.honors || analysisResults.percentage || analysisResults.totalMarks) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Academic Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem icon={TrendingUp} label="GPA" value={analysisResults.gpa} />
            <InfoItem icon={TrendingUp} label="Grade Scale" value={analysisResults.gradeScale} />
            <InfoItem icon={TrendingUp} label="Overall Grade" value={analysisResults.overallGrade} />
            <InfoItem icon={Award} label="Honors" value={analysisResults.honors} />
            <InfoItem icon={TrendingUp} label="Total Marks" value={analysisResults.totalMarks} />
            <InfoItem icon={TrendingUp} label="Marks Obtained" value={analysisResults.marksObtained} />
            <InfoItem icon={TrendingUp} label="Percentage" value={analysisResults.percentage} />
            <InfoItem icon={Award} label="Division" value={analysisResults.passedDivision} />
          </CardContent>
        </Card>
      )}

      {/* Nepalese Academic System Information */}
      {(analysisResults.symbolNumber || analysisResults.hsebRegistrationNo || analysisResults.academicYear || analysisResults.gradeLevel) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Academic System Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem icon={User} label="Symbol Number" value={analysisResults.symbolNumber} />
            <InfoItem icon={User} label="HSEB Registration" value={analysisResults.hsebRegistrationNo} />
            <InfoItem icon={Calendar} label="Academic Year" value={analysisResults.academicYear} />
            <InfoItem icon={BookOpen} label="Grade Level" value={analysisResults.gradeLevel} />
            <InfoItem icon={BookOpen} label="Faculty" value={analysisResults.faculty} />
            <InfoItem icon={Calendar} label="Passed Year" value={analysisResults.passedYear} />
            <InfoItem icon={Building} label="Campus" value={analysisResults.campus} />
            <InfoItem icon={Building} label="School" value={analysisResults.school} />
          </CardContent>
        </Card>
      )}

      {/* Subject-wise Performance */}
      {analysisResults.subjectMarks && analysisResults.subjectMarks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Subject-wise Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2 text-left">Subject</th>
                    <th className="border border-gray-300 p-2 text-center">Full Marks</th>
                    <th className="border border-gray-300 p-2 text-center">Pass Marks</th>
                    <th className="border border-gray-300 p-2 text-center">Marks Obtained</th>
                    <th className="border border-gray-300 p-2 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {analysisResults.subjectMarks.map((subject, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-2 font-medium">{subject.subject}</td>
                      <td className="border border-gray-300 p-2 text-center">{subject.fullMarks || '-'}</td>
                      <td className="border border-gray-300 p-2 text-center">{subject.passMarks || '-'}</td>
                      <td className="border border-gray-300 p-2 text-center">{subject.marksObtained || '-'}</td>
                      <td className="border border-gray-300 p-2 text-center">{subject.grade || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      {(analysisResults.startDate || analysisResults.endDate || analysisResults.graduationDate) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem icon={Calendar} label="Start Date" value={analysisResults.startDate} />
            <InfoItem icon={Calendar} label="End Date" value={analysisResults.endDate} />
            <InfoItem icon={Calendar} label="Graduation Date" value={analysisResults.graduationDate} />
            <InfoItem icon={Clock} label="Duration" value={analysisResults.duration} />
          </CardContent>
        </Card>
      )}

      {/* Program Details */}
      {(analysisResults.programType || analysisResults.credits || analysisResults.thesis) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Program Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem icon={BookOpen} label="Program Type" value={analysisResults.programType} />
            <InfoItem icon={BookOpen} label="Credits" value={analysisResults.credits} />
            <InfoItem icon={BookOpen} label="Thesis" value={analysisResults.thesis} />
            <InfoItem icon={BookOpen} label="Language of Instruction" value={analysisResults.languageOfInstruction} />
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      {(analysisResults.accreditation || analysisResults.studentId) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem icon={Award} label="Accreditation" value={analysisResults.accreditation} />
            <InfoItem icon={User} label="Student ID" value={analysisResults.studentId} />
          </CardContent>
        </Card>
      )}

      {/* Extracted Text Preview */}
      {analysis.extractedText && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Extracted Text Preview
            </CardTitle>
            <CardDescription>
              First 500 characters of extracted text from the document
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 leading-relaxed">
                {analysis.extractedText.substring(0, 500)}
                {analysis.extractedText.length > 500 && '...'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}