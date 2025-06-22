import React, { useState } from 'react';
import { Upload, Plus, ArrowLeft } from 'lucide-react';

const StudentRegistration = () => {
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
    qualifications: [{ instituteName: '', stream: '', yearOfPassing: '' }],
    projects: [{ projectName: '', githubLink: '', description: '' }],
    certifications: [''],
    internships: [{ companyName: '', role: '', responsibilities: '' }],
    username: '',
    password: '',
    confirmPassword: ''
  });

  const totalSteps = 8;
  const handleSkip = () => setCurrentStep((prev) => prev + 1);
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addQualification = () => {
    setFormData(prev => ({
      ...prev,
      qualifications: [...prev.qualifications, { instituteName: '', stream: '', yearOfPassing: '' }]
    }));
  };

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, { projectName: '', githubLink: '', description: '' }]
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
              <label htmlFor="profilePicture" className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Upload Profile Picture
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name (as per SSC certificate) *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your complete address"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Family & Personal Info</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Father's Name
                </label>
                <input
                  type="text"
                  value={formData.fatherName}
                  onChange={(e) => handleInputChange('fatherName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter father's name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marital Status *
                </label>
                <div className="flex space-x-6">
                  {['Single', 'Married'].map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        name="maritalStatus"
                        value={option}
                        checked={formData.maritalStatus === option}
                        onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                        className="mr-2"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nationality *
                </label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter nationality"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages Known *
                </label>
                <input
                  type="text"
                  value={formData.languagesKnown}
                  onChange={(e) => handleInputChange('languagesKnown', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter languages (comma separated)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hobbies
              </label>
              <textarea
                value={formData.hobbies}
                onChange={(e) => handleInputChange('hobbies', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us about your hobbies and interests"
              />
            </div>
          </div>
        );
    case 3:
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Educational Qualification</h2>

          {formData.qualifications.map((qualification, index) => (
            <div key={index} className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Institute Name *</label>
                <input
                  type="text"
                  value={qualification.instituteName}
                  onChange={(e) => {
                    const updated = [...formData.qualifications];
                    updated[index].instituteName = e.target.value;
                    handleInputChange('qualifications', updated);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your institute name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stream/Course *</label>
                <input
                  type="text"
                  value={qualification.stream}
                  onChange={(e) => {
                    const updated = [...formData.qualifications];
                    updated[index].stream = e.target.value;
                    handleInputChange('qualifications', updated);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., B.Tech, MCA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year of Passing *</label>
                <input
                  type="text"
                  value={qualification.yearOfPassing}
                  onChange={(e) => {
                    const updated = [...formData.qualifications];
                    updated[index].yearOfPassing = e.target.value;
                    handleInputChange('qualifications', updated);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2023"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addQualification}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            + Add Education
          </button>
        </div>
      );

    case 4:
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>

          {formData.projects.map((project, index) => (
            <div key={index} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                  <input
                    type="text"
                    value={project.projectName}
                    onChange={(e) => {
                      const updated = [...formData.projects];
                      updated[index].projectName = e.target.value;
                      handleInputChange('projects', updated);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Name of your project"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GitHub Link</label>
                  <input
                    type="url"
                    value={project.githubLink}
                    onChange={(e) => {
                      const updated = [...formData.projects];
                      updated[index].githubLink = e.target.value;
                      handleInputChange('projects', updated);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={project.description}
                  onChange={(e) => {
                    const updated = [...formData.projects];
                    updated[index].description = e.target.value;
                    handleInputChange('projects', updated);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  rows={4}
                  placeholder="Briefly describe your project"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addProject}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            + Add Project
          </button>
        </div>
      );

    case 5:
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Certifications</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Certification Details</label>
            <textarea
              value={formData.certifications}
              onChange={(e) => handleInputChange('certifications', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              rows={4}
              placeholder="List your certifications here"
            />
          </div>
        </div>
      );

    case 6:
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Internships</h2>

          {formData.internships.map((internship, index) => (
            <div key={index} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={internship.companyName}
                    onChange={(e) => {
                      const updated = [...formData.internships];
                      updated[index].companyName = e.target.value;
                      handleInputChange('internships', updated);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Company where you interned"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Internship Role</label>
                  <input
                    type="text"
                    value={internship.role}
                    onChange={(e) => {
                      const updated = [...formData.internships];
                      updated[index].role = e.target.value;
                      handleInputChange('internships', updated);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Your position/role"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Responsibilities</label>
                <textarea
                  value={internship.responsibilities}
                  onChange={(e) => {
                    const updated = [...formData.internships];
                    updated[index].responsibilities = e.target.value;
                    handleInputChange('internships', updated);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  rows={4}
                  placeholder="Describe your responsibilities during the internship"
                />
              </div>
            </div>
          ))}
        </div>
      );
    case 7:
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Account Details</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Choose a username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Enter password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Re-enter Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Re-enter your password"
              />
            </div>        
          </div>
        </div>
      );

    default:
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Complete!</h2>
          <p className="text-gray-600">Your student registration has been submitted successfully.</p>
        </div>
      );
  }
};


  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Student Registration</h1>
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
            className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-300"
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
        {currentStep !== totalSteps && (
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Skip
            </button>
            <button
              onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
            >
              {currentStep === totalSteps - 1 ? 'Complete Registration' : 'Next Step'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentRegistration;