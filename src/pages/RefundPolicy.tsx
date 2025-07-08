
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Mail, MapPin, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4">
              <RefreshCw className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Refund Policy
            </h1>
            <p className="text-gray-600">Triaright Solutions LLP</p>
            <p className="text-sm text-gray-500">Effective Date: July 8, 2025 | Last Updated: July 8, 2025</p>
          </div>

          <Card className="backdrop-blur-xl bg-white/80 border-0 shadow-xl">
            <CardContent className="p-8 space-y-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  At Triaright Solutions LLP, we are committed to providing high-quality educational content and services that add real value to your learning and career. However, we understand that there may be circumstances in which you may seek a refund. This Refund Policy outlines the terms under which refunds may be granted.
                </p>

                <Card className="mt-6 bg-amber-50 border-amber-200">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-amber-800 font-medium">Please Note:</p>
                        <p className="text-amber-700 text-sm">
                          This Refund Policy applies only to the courses that are specifically marked as eligible for refund. Courses purchased under non-refundable categories, bundled offers, or promotional discounts are excluded unless explicitly stated.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-green-600">1. Eligibility for Refund</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-2">Refunds are considered only under the following conditions:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>The user is unable to access the course due to technical issues on our platform (not caused by user-side errors or poor connectivity).</li>
                      <li>The user has made a duplicate payment for the same course.</li>
                      <li>The refund request is made within 7 days from the date of purchase and the course progress is less than 20%.</li>
                      <li>The course is listed as "Eligible for Refund" on the course purchase page or product details.</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-red-600">2. Non-Refundable Situations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-2">Refunds will not be provided in the following scenarios:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>User has accessed more than 20% of the course content.</li>
                      <li>Refund request is made after 7 days of purchase.</li>
                      <li>The course is not marked as refundable.</li>
                      <li>User dissatisfaction due to reasons not attributable to course quality or delivery.</li>
                      <li>Inability to complete the course within the access period.</li>
                      <li>Digital downloads or study material already delivered.</li>
                      <li>Courses purchased during promotional offers or discounts, unless explicitly stated as refundable.</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600">3. Refund Process</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">To request a refund, please follow these steps:</p>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">1</div>
                        <p className="text-gray-700">Email your refund request to <strong>info@triaright.com</strong> with the subject line: <span className="bg-gray-100 px-2 py-1 rounded">Refund Request – [Course Name]</span></p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">2</div>
                        <div>
                          <p className="text-gray-700 mb-2">Include the following details in your email:</p>
                          <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                            <li>Full Name</li>
                            <li>Registered Email ID</li>
                            <li>Order ID / Transaction Reference</li>
                            <li>Reason for refund request</li>
                          </ul>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">3</div>
                        <p className="text-gray-700">Our support team will review your request and respond within <strong>5–7 business days</strong>.</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">4</div>
                        <p className="text-gray-700">If approved, the refund will be processed to your original payment method within <strong>20 business days</strong>.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600">4. Cancellation Policy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      Once enrolled in a course, cancellation is not possible beyond the refund eligibility window. We encourage you to review course details, refund eligibility, and technical requirements before purchase.
                    </p>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600">5. Dispute Resolution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      If you are not satisfied with the outcome of your refund request, you may escalate the matter to our grievance team by writing to <strong>info@triaright.com</strong> with the subject line: <span className="bg-gray-100 px-2 py-1 rounded">Escalation – Refund Issue</span>. We aim to resolve all concerns fairly and transparently.
                    </p>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600">6. Changes to the Refund Policy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      Triaright Solutions LLP reserves the right to update or modify this Refund Policy at any time. Any changes will be posted on this page with a revised effective date. Continued use of our platform after changes implies acceptance of the revised terms.
                    </p>
                  </CardContent>
                </Card>

                <Card className="mt-6 bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600 flex items-center">
                      <Mail className="h-5 w-5 mr-2" />
                      7. Contact Us
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">
                      For any questions or assistance regarding this Refund Policy, please contact:
                    </p>
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-semibold text-gray-800 mb-2">Triaright Solutions LLP</h4>
                      <div className="flex items-center text-gray-700 mb-2">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>Address: Madhapur, Hyderabad</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>Email: info@triaright.com</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RefundPolicy;
