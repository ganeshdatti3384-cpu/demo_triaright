
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin,
  ArrowRight
} from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { name: 'About Us', href: '#about' },
    { name: 'Courses', href: '#courses' },
    { name: 'Jobs', href: '#jobs' },
    { name: 'Internships', href: '#internships' },
    { name: 'Training', href: '#training' },
    { name: 'Success Stories', href: '#stories' }
  ];

  const support = [
    { name: 'Help Center', href: '#help' },
    { name: 'Contact Support', href: '#contact' },
    { name: 'Documentation', href: '#docs' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Privacy Policy', href: '#privacy' },
    { name: 'Terms of Service', href: '#terms' }
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Get the latest updates on new courses, job opportunities, and career tips 
              delivered straight to your inbox.
            </p>
            
            <div className="max-w-md mx-auto flex gap-4">
              <Input 
                placeholder="Enter your email"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/70"
              />
              <Button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-6">
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                Triaright Hub
              </h3>
              <p className="text-gray-400 mb-6 max-w-md">
                Empowering careers through comprehensive education. Your one-stop platform 
                for learning, growing, and succeeding in today's competitive job market, Since 2010. 
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-400">info@triaright.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-blue-400" />
                  <p className="truncate text-gray-400">+91 90593 73300</p><br />
                  <p className="truncate text-gray-400">+91 83410 44141</p>       
                </div>
                <div className="flex items-center space-x-3" >
                  <MapPin className="h-5 w-5 text-blue-400" />
                  <p className="max-w-[200px] text-gray-400">
                    #7-1-58, 401, Surekha Chambers,<br />
                    Ameerpet, Hyderabad, Telangana 500016
                  </p>                </div>
              </div>

              
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Us */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
              <div className="space-y-4 text-sm text-gray-400">
                <div>
                  <p className="font-semibold text-white">Business Collaboration:</p>
                  <p className="truncate">business@triaright.com</p>
                </div>
                <div>
                  <p className="font-semibold text-white">Human Resources:</p>
                  <p className="truncate">hr@triaright.com</p>
                </div>
                <div>
                  <p className="font-semibold text-white">Leadership / Escalations:</p>
                  <p className="truncate">kk@triaright.com</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      {/* Bottom Bar */}
      <Separator className="bg-gray-800" />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              ©  2025 TriaRight. All Rights Reserved.
            </div>
            <div className="flex space-x-4 ">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            <div className="flex space-x-4 text-sm">
              <a href="#privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
