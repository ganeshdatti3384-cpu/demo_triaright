import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  User,
  Building,
} from 'lucide-react';

const ContactUs = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      subject: '',
      message: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Addresses",
      details: [
        "📧 info@triaright.com - General Info",
        "📧 business@triaright.com - Business",
        "📧 hr@triaright.com - HR Related",
        "📧 kk@triaright.com - Leadership"
      ]
    },
    {
      icon: Phone,
      title: "Phone Numbers",
      details: [
        "📞 +91 9059373300",
        "📞 +91 8341044141"
      ]
    },
    {
      icon: MapPin,
      title: "Office Address",
      details: [
        "🏢 #7-1-58, 401, Surekha Chambers,",
        "Ameerpet, Hyderabad, Telangana 500016"
      ]
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: [
        "Monday - Friday: 9:00 AM - 6:00 PM",
        "Saturday: 9:00 AM - 1:00 PM",
        "Sunday: Closed"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            Get in Touch
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto animate-fade-in">
            Have questions about our courses or services? We're here to help you start your learning journey.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div className="animate-fade-in">
            <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  Send us a Message
                </CardTitle>
                <p className="text-muted-foreground">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Full Name *
                      </label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address *
                      </label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </label>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Company/Institution
                      </label>
                      <Input
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Enter company name"
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject *</label>
                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What is this regarding?"
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message *</label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your inquiry..."
                      rows={5}
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 transform hover:scale-[1.02]"
                    size="lg"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-3xl font-bold mb-6">Contact Information</h2>
              <p className="text-muted-foreground text-lg">
                Reach out to us through any of the following channels. We're always here to help!
              </p>
            </div>

            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-all duration-200 border-0 bg-card/30 backdrop-blur-sm hover:bg-card/50">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <info.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{info.title}</h3>
                      <div className="space-y-1">
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-muted-foreground">
                            {detail}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Quick Response Promise */}
            <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Quick Response Guarantee
              </h3>
              <p className="text-muted-foreground">
                We typically respond to all inquiries within 24 hours during business days. 
                For urgent matters, please call us directly.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;