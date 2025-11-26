// components/student/APCertificateGenerator.tsx
import React from 'react';

interface CertificateData {
  studentName: string;
  studentEmail: string;
  college: string;
  courseTitle: string;
  stream: string;
  providerName: string;
  instructorName: string;
  internshipTitle: string;
  companyName: string;
  internshipDuration: string;
  enrollmentDate: string;
  completionDate: string;
  enrollmentType: string;
  completionPercentage: string;
  certificateId: string;
}

interface APCertificateGeneratorProps {
  certificateData: CertificateData;
}

const APCertificateGenerator: React.FC<APCertificateGeneratorProps> = ({ certificateData }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="certificate-container bg-white relative" style={{ width: '794px', height: '1123px' }}> {/* A4 size */}
      {/* Certificate Background Design */}
      <div className="absolute inset-0 border-8 border-yellow-400 m-4 rounded-lg"></div>
      <div className="absolute inset-0 border-4 border-green-600 m-8 rounded"></div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-4 gap-8 h-full">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="border-l border-gray-300"></div>
          ))}
        </div>
      </div>

      {/* Certificate Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-16 text-center">
        
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">TRIARIGHT</h1>
              <div className="w-32 h-1 bg-green-600 mx-auto mb-2"></div>
              <p className="text-lg text-gray-600 italic">THE NEW ERA OF LEARNING</p>
            </div>
          </div>
        </div>

        {/* Certificate Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 uppercase tracking-wider">
            Certificate of Completion
          </h2>
          <div className="w-48 h-1 bg-blue-600 mx-auto"></div>
        </div>

        {/* Present To Section */}
        <div className="mb-8">
          <p className="text-lg text-gray-600 mb-4">This certificate is proudly presented to</p>
          <h3 className="text-4xl font-bold text-gray-900 mb-4 border-b-4 border-green-600 pb-4 px-12">
            {certificateData.studentName}
          </h3>
        </div>

        {/* Completion Details */}
        <div className="mb-8 max-w-2xl">
          <p className="text-xl text-gray-700 leading-relaxed">
            for successfully completing the{" "}
            <span className="font-semibold text-blue-700">{certificateData.courseTitle}</span>{" "}
            in <span className="font-semibold text-green-700">{certificateData.stream}</span>{" "}
            offered by <span className="font-semibold text-purple-700">{certificateData.providerName}</span>
          </p>
        </div>

        {/* Internship Details */}
        <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <p className="text-lg text-gray-700 mb-2">
            <span className="font-semibold">Internship:</span> {certificateData.internshipTitle}
          </p>
          <p className="text-lg text-gray-700">
            <span className="font-semibold">Company:</span> {certificateData.companyName}
          </p>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-8 mb-8 text-sm text-gray-600">
          <div className="text-center">
            <p className="font-semibold">Completion Percentage</p>
            <p className="text-2xl font-bold text-green-600">{certificateData.completionPercentage}%</p>
          </div>
          <div className="text-center">
            <p className="font-semibold">Duration</p>
            <p className="text-lg font-bold text-blue-600">{certificateData.internshipDuration}</p>
          </div>
        </div>

        {/* Dates Section */}
        <div className="grid grid-cols-2 gap-12 mb-12 text-sm text-gray-600">
          <div className="text-center">
            <p className="font-semibold">Enrollment Date</p>
            <p className="text-lg">
              {new Date(certificateData.enrollmentDate).toLocaleDateString()}
            </p>
          </div>
          <div className="text-center">
            <p className="font-semibold">Completion Date</p>
            <p className="text-lg">
              {new Date(certificateData.completionDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Signatures Section */}
        <div className="grid grid-cols-2 gap-16 mt-8">
          <div className="text-center">
            <div className="border-t-2 border-gray-400 pt-2 w-32 mx-auto mb-2"></div>
            <p className="font-semibold text-gray-700">Instructor</p>
            <p className="text-gray-600">{certificateData.instructorName}</p>
          </div>
          <div className="text-center">
            <div className="border-t-2 border-gray-400 pt-2 w-32 mx-auto mb-2"></div>
            <p className="font-semibold text-gray-700">Director</p>
            <p className="text-gray-600">Kisshore Kumaar</p>
            <p className="text-xs text-gray-500">Founder & Director - Triaright</p>
          </div>
        </div>

        {/* Footer Information */}
        <div className="mt-16 text-xs text-gray-500">
          <div className="grid grid-cols-3 gap-8 mb-4">
            <div className="text-center">
              <p className="font-semibold">Date of issue:</p>
              <p>{currentDate}</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">Certificate no:</p>
              <p className="font-mono">{certificateData.certificateId}</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">Verification</p>
              <p>Valid and Verified</p>
            </div>
          </div>
          
          <div className="border-t border-gray-300 pt-4">
            <p className="mb-1">Mail id: info@triaright.com | Contact: 9059373300</p>
            <p className="text-xs">
              7-1-58, 404B, 4th Floor, Surekha Chambers, Ameerpet, Hyderabad, Telangana - 500016
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 w-16 h-16 border-4 border-yellow-400 rounded-full opacity-20"></div>
        <div className="absolute bottom-4 left-4 w-12 h-12 border-4 border-green-400 rounded-full opacity-20"></div>
        <div className="absolute top-4 left-4 w-8 h-8 border-4 border-blue-400 rounded-full opacity-20"></div>
        <div className="absolute bottom-4 right-4 w-10 h-10 border-4 border-purple-400 rounded-full opacity-20"></div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .certificate-container {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default APCertificateGenerator;
