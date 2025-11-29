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
    <div 
      className="certificate-container bg-white relative" 
      style={{ 
        width: '794px', 
        height: '1123px',
        backgroundImage: 'url(/lovable-uploads/certificate-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Certificate Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-16 text-center">
        
        {/* Certificate Title - Removed as it's in background image */}
        
        {/* Present To Section */}
        <div className="mb-8 mt-32">
          <p className="text-lg text-gray-600 mb-4">This certificate is proudly presented to</p>
          <h3 className="text-4xl font-bold text-gray-900 mb-4 border-b-4 border-green-600 pb-4 px-12">
            {certificateData.studentName}
          </h3>
        </div>

        {/* Completion Details - Updated to match reference */}
        <div className="mb-8 max-w-2xl">
          <p className="text-xl text-gray-700 leading-relaxed text-justify">
            This is to certify that <strong>{certificateData.studentName}</strong> has actively participated and successfully completed the live training course titled "<strong>{certificateData.courseTitle}</strong>" conducted by <strong>{certificateData.providerName}</strong>.
          </p>
          <p className="text-xl text-gray-700 leading-relaxed text-justify mt-4">
            The course was conducted from <strong>{new Date(certificateData.enrollmentDate).toLocaleDateString()}</strong> to <strong>{new Date(certificateData.completionDate).toLocaleDateString()}</strong> and involved hands-on sessions, live projects, group discussions, and practical coding challenges that enhanced the participant's skillset and real-world development capabilities.
          </p>
          <p className="text-xl text-gray-700 leading-relaxed text-justify mt-4">
            We congratulate the learner on their achievement and wish them continued success in their career journey.
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

        {/* Footer Information - Updated to match reference */}
        <div className="mt-auto mb-8 text-xs text-gray-500 w-full">
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
          
          <div className="border-t border-gray-300 pt-4 text-center">
            <p className="mb-1">Mail id: info@triaright.com | Contact: 9059373300</p>
            <p className="text-xs">
              7-1-58, 404B, 4th Floor, Surekha Chambers, Ameerpet, Hyderabad, Telangana - 500016
            </p>
          </div>
        </div>
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
            background-image: url(/lovable-uploads/certificate-bg.jpg) !important;
            background-size: cover !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};

export default APCertificateGenerator;
