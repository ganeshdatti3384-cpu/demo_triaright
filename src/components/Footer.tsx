import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();

  const getHomeLink = () => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        const role = user.role;
        switch (role) {
          case 'student':
            return '/student';
          case 'jobseeker':
            return '/job-seeker';
          case 'employee':
            return '/employee';
          case 'employer':
            return '/employer';
          case 'college':
            return '/college';
          case 'admin':
            return '/admin';
          case 'superadmin':
            return '/super-admin';
          default:
            return '/';
        }
      } catch {
        return '/';
      }
    }
    return '/';
  };

  const quickLinks = [
    { name: 'Home', href: getHomeLink() },
    { name: 'About Us', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Contact', href: '/contact' },
  ];

  const services = [
    { name: 'Courses', href: '#courses' },
    { name: 'Internships', href: '#internships' },
    { name: 'Job Placement', href: '#jobs' },
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/people/Tria-Right/100090272642962/', label: 'Facebook' },
    { icon: Twitter, href: 'https://x.com/triaright', label: 'Twitter' },
    { icon: Instagram, href: 'https://www.instagram.com/triaright/?hl=en', label: 'Instagram' },
    { icon: Linkedin, href: 'https://www.linkedin.com/company/triaright/', label: 'LinkedIn' },
    { icon: Youtube, href: 'https://www.youtube.com/@TriarightSolutionsLLP', label: 'YouTube' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
     

      {/* Main Footer Content */}
      <div className="py-14">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Company Info */}
          <div>
            <img
              src="/lovable-uploads/8a53fb02-6194-4512-8c0c-ba7831af3ae8.png"
              alt="TriaRight - The New Era Of Learning"
              className="h-12 mb-4"
            />
            <p className="text-sm text-gray-400">
              Empowering careers through education, skills development, and placement services since 2010.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <Link to={link.href} className="hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Our Services */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Our Services</h4>
            <ul className="space-y-3">
              {services.map((service, idx) => (
                <li key={idx}>
                  <a href={service.href} className="hover:text-white transition-colors">
                    {service.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <Separator className="bg-gray-700" />
      <div className="py-6 text-sm">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-400">© 2025 TriaRight. All Rights Reserved.</div>
          <div className="flex space-x-4">
            {socialLinks.map((social, idx) => (
              <a
                key={idx}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-brand-primary transition-colors"
                aria-label={social.label}
              >
                <social.icon className="h-5 w-5 text-white" />
              </a>
            ))}
          </div>
          <div className="flex space-x-4">
            <a href="#privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#terms" className="text-gray-400 hover:text-white transition-colors">Terms</a>
            <a href="#cookies" className="text-gray-400 hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
