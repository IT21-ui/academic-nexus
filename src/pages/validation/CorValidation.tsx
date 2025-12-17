import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, School, Calendar, User, FileText } from 'lucide-react';

interface ValidationData {
  studentId: string;
  studentName: string;
  documentType: string;
  validationCode: string;
  issuedDate: string;
  status: 'ENROLLED' | 'NOT ENROLLED' | 'INVALID';
  program?: string;
  academicYear?: string;
}

const CorValidation: React.FC = () => {
  const { validationCode } = useParams<{ validationCode: string }>();
  const location = useLocation();
  const [validationData, setValidationData] = useState<ValidationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateDocument = async () => {
      try {
        setLoading(true);
        
        // Parse validation data from URL or query params
        const searchParams = new URLSearchParams(location.search);
        const encodedData = searchParams.get('data');
        
        if (encodedData) {
          try {
            const decodedData = JSON.parse(atob(encodedData));
            setValidationData(decodedData);
          } catch (decodeError) {
            setError('Invalid validation code');
          }
        } else if (validationCode) {
          // Fallback for validation code in URL params
          // In a real app, you'd fetch this from your backend API
          const mockData: ValidationData = {
            studentId: validationCode.split('-')[1] || 'Unknown',
            studentName: 'Mia P. Tagolimot', // This would come from backend
            documentType: 'Certificate of Registration',
            validationCode: validationCode,
            issuedDate: new Date().toLocaleString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric'
            }),
            status: 'ENROLLED',
            program: 'BSIT 2nd',
            academicYear: '2025-2026 1st Term'
          };
          setValidationData(mockData);
        } else {
          setError('No validation code provided');
        }
      } catch (err) {
        setError('Failed to validate document');
      } finally {
        setLoading(false);
      }
    };

    validateDocument();
  }, [validationCode, location.search]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ENROLLED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'NOT ENROLLED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'INVALID':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ENROLLED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'NOT ENROLLED':
      case 'INVALID':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating document...</p>
        </div>
      </div>
    );
  }

  if (error || !validationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Validation Failed</h2>
              <p className="text-gray-600">{error || 'Document not found'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <School className="w-8 h-8 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Tagoloan Community College</h1>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">Certificate of Registration Validation</h2>
          <p className="text-sm text-gray-500 mt-1">
            Validation page — generated {validationData.issuedDate}
          </p>
        </div>

        {/* Validation Result Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Validation Result</CardTitle>
              <div className="flex items-center space-x-2">
                {getStatusIcon(validationData.status)}
                <Badge className={getStatusColor(validationData.status)}>
                  {validationData.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Document Type</p>
                    <p className="text-base font-medium text-gray-900">{validationData.documentType}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Issued To</p>
                    <p className="text-base font-medium text-gray-900">{validationData.studentName}</p>
                    <p className="text-sm text-gray-600">ID: {validationData.studentId}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Validation Code</p>
                    <p className="text-base font-mono text-gray-900">{validationData.validationCode}</p>
                  </div>
                </div>

                {validationData.program && (
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Program</p>
                      <p className="text-base font-medium text-gray-900">{validationData.program}</p>
                      {validationData.academicYear && (
                        <p className="text-sm text-gray-600">{validationData.academicYear}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 mt-0.5">
                  {getStatusIcon(validationData.status)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Remark</p>
                  <p className="text-base font-medium text-gray-900">{validationData.status}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>This is an official validation page for Tagoloan Community College.</p>
          <p>For inquiries, please contact the Registrar's Office.</p>
        </div>
      </div>
    </div>
  );
};

export default CorValidation;
