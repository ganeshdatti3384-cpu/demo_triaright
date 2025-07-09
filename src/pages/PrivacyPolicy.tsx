
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Mail, MapPin, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PrivacyPolicy = () => {
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
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-blue-600 mb-2">
              Privacy Policy
            </h1>
            <p className="text-gray-600">Triaright Solutions LLP</p>
            <p className="text-sm text-gray-500">Effective Date: July 8, 2025 | Last Updated: July 8, 2025</p>
          </div>

          <Card className="backdrop-blur-xl bg-white/80 border-0 shadow-xl">
            <CardContent className="p-8 space-y-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  Welcome to Triaright Solutions LLP ("Company", "we", "our", or "us"). We are committed to protecting your privacy. This Privacy Policy describes how we collect, use, store, and disclose your information when you visit our website, use our services, or interact with us in any way.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  This policy applies to all visitors, users, and others who access or use our Services.
                </p>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600">1. Information We Collect</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">a. Personal Information</h4>
                      <p className="text-gray-700 mb-2">We may collect the following personally identifiable information from you:</p>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        <li>Full Name</li>
                        <li>Email Address</li>
                        <li>Educational Background</li>
                        <li>Payment Information (secured via third-party payment gateways)</li>
                        <li>User Login Credentials (encrypted)</li>
                        <li>Location or Address Information (when needed for services)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">b. Non-Personal Information</h4>
                      <p className="text-gray-700 mb-2">We may automatically collect certain information such as:</p>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        <li>IP Address</li>
                        <li>Browser Type</li>
                        <li>Device Information</li>
                        <li>Date and Time of Visit</li>
                        <li>Pages Visited</li>
                        <li>Referring Site</li>
                      </ul>
                      <p className="text-gray-700 mt-2">This helps us improve our platform and user experience.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600">2. How We Use Your Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-2">We use the collected data to:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Register and manage your user account</li>
                      <li>Deliver educational content and personalized services</li>
                      <li>Communicate important updates, offers, or support information</li>
                      <li>Process payments and issue certificates</li>
                      <li>Improve our content, features, and services</li>
                      <li>Comply with legal obligations</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600">3. Use of Cookies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      We use cookies and similar tracking technologies to enhance your experience on our site. These tools help us remember your preferences and analyze usage patterns.
                    </p>
                    <p className="text-gray-700 mt-2">
                      You can choose to disable cookies through your browser settings, but doing so may limit certain functionalities of our website.
                    </p>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600">4. Sharing and Disclosure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-2">
                      Triaright Solutions LLP does not sell your personal data. However, we may share your data with:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Trusted third-party service providers for hosting, payment processing, or analytics</li>
                      <li>Regulatory authorities or law enforcement when required by law</li>
                      <li>Partner institutions or employers (only with your consent)</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600">5. Data Retention</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      We retain your data only as long as necessary for the purposes described in this policy or as required by applicable laws. You can request deletion of your account and data by contacting us.
                    </p>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600">6. Security Measures</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-2">
                      We use industry-standard security practices to protect your information, including:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>SSL encryption</li>
                      <li>Secure databases</li>
                      <li>Access control and data monitoring</li>
                    </ul>
                    <p className="text-gray-700 mt-2">
                      While we strive to protect your data, no method of transmission over the internet is 100% secure.
                    </p>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600">7. Children's Privacy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      Our services are not directed to children under 13. We do not knowingly collect data from children. If such data is identified, we will take immediate steps to delete it.
                    </p>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600">8. Your Rights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-2">
                      Depending on your jurisdiction, you may have the right to:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Access the personal data we hold about you</li>
                      <li>Request correction or deletion of your data</li>
                      <li>Withdraw consent or object to certain uses</li>
                      <li>Request data portability</li>
                    </ul>
                    <p className="text-gray-700 mt-2">
                      To exercise these rights, please reach out to us at the contact information below.
                    </p>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600">9. Third-Party Links</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      Our website may include links to third-party sites. Triaright Solutions LLP is not responsible for the privacy practices of external websites. We encourage you to review their privacy policies separately.
                    </p>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600">10. Changes to This Policy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      We may update this Privacy Policy periodically. Changes will be posted on this page with a new effective date. Continued use of our services after changes constitutes your acceptance.
                    </p>
                  </CardContent>
                </Card>

                <Card className="mt-6 bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600 flex items-center">
                      <Mail className="h-5 w-5 mr-2" />
                      11. Contact Us
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">
                      If you have questions or concerns regarding this Privacy Policy, please contact us:
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

export default PrivacyPolicy;
