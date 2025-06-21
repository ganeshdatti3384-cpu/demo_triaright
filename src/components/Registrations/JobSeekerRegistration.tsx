import React, { useState } from 'react';
import { Upload, Plus, ArrowLeft } from 'lucide-react';

const JobSeekerRegistration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    profilePicture: null,
    fullName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    alternatePhone: '',
    address: '',
    fatherName: '',
    maritalStatus: '',
    nationality: '',
    languagesKnown: '',
    hobbies: '',
    jobCategory: [],
    qualifications: [{ instituteName: '', course: '', yearOfPassing: '' }],
    experiences: [{ companyName: '', role: '', duration: '', responsibilities: '' }],
    projects: [{ projectName: '', technologies: '', description: '' }],
    certifications: [''],
    internships: [{ companyName: '', role: '', responsibilities: '' }],
    resume: null,
    username: '',
    password: '',
    confirmPassword: ''
  });

  const totalSteps = 10;

  const jobCategories = [
    'IT', 'Non-IT', 'Finance', 'Marketing', 'HR', 'Management', 'Pharma', 'Business'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleJobCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      jobCategory: prev.jobCategory.includes(category)
        ? prev.jobCategory.filter(c => c !== category)
        : [...prev.jobCategory, category]
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
            
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
                {formData.profilePicture ? (
                  <img src={formData.profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <Upload className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="profilePicture"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => handleInputChange('profilePicture', reader.result);
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <label htmlFor="profilePicture" className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Upload Profile Picture
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <div className="flex space-x-6">
                  {['Male', 'Female', 'Other'].map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value={option}
                        checked={formData.gender === option}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="mr-2"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alternate Phone
                </label>
                <input
                  type="tel"
                  value={formData.alternatePhone}
                  onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter alternate phone number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your complete address"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Career Preferences</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Looking for Job Category *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {jobCategories.map((category) => (
                  <label key={category} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.jobCategory.includes(category)}
                      onChange={() => handleJobCategoryChange(category)}
                      className="text-green-600"
                    />
                    <span className="text-sm">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Selected Categories:</h3>
              <div className="flex flex-wrap gap-2">
                {formData.jobCategory.map((category) => (
                  <span key={category} className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                    {category}
                  </span>
                ))}
              </div>
              {formData.jobCategory.length === 0 && (
                <p className="text-gray-500 text-sm">No categories selected yet</p>
              )}
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Resume Upload</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">Upload Your Resume *</h3>
                <p className="text-gray-600">Drag and drop your resume here, or click to browse</p>
                <p className="text-sm text-gray-500">Supported formats: PDF, DOC, DOCX (Max size: 5MB)</p>
              </div>
              
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                id="resume"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleInputChange('resume', file);
                  }
                }}
              />
              <label
                htmlFor="resume"
                className="inline-block mt-4 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
              >
                Choose File
              </label>
              
              {formData.resume && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">✓ {formData.resume.name}</p>
                  <p className="text-green-600 text-sm">Resume uploaded successfully</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">💡 Resume Tips:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Keep it concise (1-2 pages maximum)</li>
                <li>• Use a professional format and font</li>
                <li>• Include relevant keywords for your target roles</li>
                <li>• Highlight your achievements and quantifiable results</li>
                <li>• Proofread for spelling and grammar errors</li>
              </ul>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Step {currentStep}</h2>
            <p className="text-gray-600">This step is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Job Seeker Registration</h1>
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Role Selection</span>
          </button>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-600 to-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        {renderStep()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <button
            onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
          >
            {currentStep === totalSteps ? 'Complete Registration' : 'Next Step'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobSeekerRegistration;
