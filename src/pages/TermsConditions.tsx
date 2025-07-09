
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Mail, MapPin, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const TermsConditions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-blue-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-blue-600 mb-2">
              Terms & Conditions
            </h1>
            <p className="text-gray-600">Triaright Solutions LLP</p>
            <p className="text-sm text-gray-500">Effective Date: July 8, 2025 | Last Updated: July 8, 2025</p>
          </div>

          <Card className="backdrop-blur-xl bg-white/80 border-0 shadow-xl">
            <CardContent className="p-8 space-y-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  Welcome to the official website of Triaright Solutions LLP ("Company", "we", "us", or "our"). These Terms and Conditions ("Terms") govern your use of our website, products, services, and content (collectively, the "Services").
                </p>
                <p className="text-gray-700 leading-relaxed">
                  By accessing or using our website [www.triaright.com], you agree to be bound by these Terms. If you do not agree with any part of these Terms, you must not use our services.
                </p>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600">1. Eligibility</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      By using our Services, you confirm that you are at least 13 years old and legally competent to enter into a binding agreement. If you are under 18, parental or guardian consent is required.
                    </p>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600">2. Account Registration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>You may be required to create an account to access certain features.</li>
                      <li>You agree to provide accurate, complete, and updated information.</li>
                      <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                      <li>You agree to notify us immediately of any unauthorized use of your account.</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600">3. Use of Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-2">By using our Services, you agree to:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mb-3">
                      <li>Use the platform only for lawful, educational, and non-commercial purposes.</li>
                      <li>Not duplicate, distribute, or resell any course content or material.</li>
                      <li>Not interfere with or disrupt the platform or servers.</li>
                      <li>Not upload viruses, spam, or harmful code.</li>
                    </ul>
                    <p className="text-gray-700 font-medium">
                      Violation of these rules may result in suspension or termination of access without notice.
                    </p>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600">4. Intellectual Property</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      All content, courses, videos, graphics, logos, and materials on this website are the intellectual property of Triaright Solutions LLP or its licensors. You may not reproduce, distribute, or use any content without prior written permission.
                    </p>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600">5. Payments & Subscriptions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>All course fees are clearly stated at the time of purchase.</li>
                      <li>Payments must be made via the approved payment gateways.</li>
                      <li>Course access will be granted upon successful payment confirmation.</li>
                      <li>All sales are subject to our Refund Policy and are applicable only to eligible courses.</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600">6. Refunds</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      Refunds are governed strictly by our Refund Policy. Please read it carefully before enrolling in any course.
                    </p>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600">7. Termination of Access</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-2">We reserve the right to suspend or terminate your access to the Services if:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>You violate these Terms.</li>
                      <li>Your actions harm other users or the integrity of the platform.</li>
                      <li>Required by legal or regulatory authorities.</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600">8. Disclaimers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>We strive to provide high-quality and accurate educational content. However, we do not guarantee specific results from course completion.</li>
                      <li>Content may be updated, revised, or removed as needed without prior notice.</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600">9. Limitation of Liability</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      Triaright Solutions LLP is not liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use our Services.
                    </p>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600">10. Third-Party Links</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      Our Services may contain links to third-party websites or tools. We are not responsible for the content or practices of these external sites. Users should review their terms and policies independently.
                    </p>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600">11. Modifications to Terms</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      We may update or revise these Terms at any time. The revised version will be posted with the "Last Updated" date. Continued use of our Services implies acceptance of the new Terms.
                    </p>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600">12. Governing Law and Jurisdiction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      These Terms shall be governed by the laws of India, and any disputes shall be subject to the jurisdiction of courts located in Hyderabad, Telangana.
                    </p>
                  </CardContent>
                </Card>

                <Card className="mt-6 bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600 flex items-center">
                      <Mail className="h-5 w-5 mr-2" />
                      13. Contact Us
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">
                      If you have any questions or concerns regarding these Terms, please contact:
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

export default TermsConditions;
