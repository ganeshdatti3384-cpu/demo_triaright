// components/community/CommunityPage.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  User, 
  Building2, 
  GraduationCap, 
  DollarSign,
  Star,
  Shield,
  Award,
  CheckCircle,
  Users,
  ThumbsUp,
  TrendingUp,
  Heart,
  Share2,
  Calendar,
  MapPin,
  IndianRupee,
  Clock,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  Info,
  Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Feedback {
  _id: string;
  name: string;
  feedback: string;
  createdAt: string;
  updatedAt: string;
}

interface Placement {
  _id: string;
  name: string;
  collegeName: string;
  companyName: string;
  salary: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface TrustBadge {
  name: string;
  image: string;
  alt: string;
  category: string;
  description: string;
  verified: boolean;
  year: string;
  impact: string;
}

const trustBadges: TrustBadge[] = [
  {
    name: "Skill India",
    image: "/lovable-uploads/skill-india-badge.png",
    alt: "Skill India - Government of India",
    category: "Government",
    description: "Recognized by Ministry of Skill Development and Entrepreneurship",
    verified: true,
    year: "2015",
    impact: "10M+ Students Trained"
  },
  {
    name: "Startup India",
    image: "/lovable-uploads/startup-india-badge.png",
    alt: "Startup India - Government of India",
    category: "Government",
    description: "Official partner of Startup India Initiative",
    verified: true,
    year: "2016",
    impact: "50K+ Startups Supported"
  },
  {
    name: "AICTE",
    image: "/lovable-uploads/aicte-badge.png",
    alt: "AICTE Approved",
    category: "Education",
    description: "Approved by All India Council for Technical Education",
    verified: true,
    year: "1945",
    impact: "10K+ Institutions"
  },
  {
    name: "APSSDC",
    image: "/lovable-uploads/apssdc-badge.png",
    alt: "APSSDC Partner",
    category: "Government",
    description: "Official Skill Development Partner for Andhra Pradesh",
    verified: true,
    year: "2016",
    impact: "2M+ Youth Trained"
  },
  {
    name: "ISO 9001:2015",
    image: "/lovable-uploads/iso-badge.png",
    alt: "ISO 9001:2015 Certified",
    category: "Quality",
    description: "International Quality Management System Certified",
    verified: true,
    year: "2015",
    impact: "Global Standards"
  },
  {
    name: "MSME",
    image: "/lovable-uploads/msme-badge.png",
    alt: "MSME Registered",
    category: "Government",
    description: "Registered with Ministry of Micro, Small & Medium Enterprises",
    verified: true,
    year: "2006",
    impact: "60M+ Enterprises"
  },
  {
    name: "NASSCOM",
    image: "/lovable-uploads/nasscom-badge.gif",
    alt: "NASSCOM Partner",
    category: "Industry",
    description: "Partner with India's Premier IT Industry Body",
    verified: true,
    year: "1988",
    impact: "3000+ Members"
  },
  {
    name: "NSDC",
    image: "/lovable-uploads/nsdc-badge.png",
    alt: "NSDC Partner",
    category: "Government",
    description: "National Skill Development Corporation Partner",
    verified: true,
    year: "2009",
    impact: "25M+ Trained"
  },
  {
    name: "APSCHE",
    image: "/lovable-uploads/apsche-badge.png",
    alt: "APSCHE Affiliated",
    category: "Education",
    description: "Andhra Pradesh State Council of Higher Education",
    verified: true,
    year: "1988",
    impact: "500+ Colleges"
  }
];

const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState('testimonials');
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<TrustBadge | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [trustBadgeFilter, setTrustBadgeFilter] = useState('all');

  const { toast } = useToast();

  // Auto-rotate badges
  useEffect(() => {
    if (!isAutoPlaying || activeTab !== 'badges') return;

    const interval = setInterval(() => {
      setCurrentBadgeIndex((prev) => (prev + 1) % trustBadges.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, activeTab]);

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      
      // Fetch feedbacks
      const feedbackResponse = await fetch('/api/users/feedbacks');
      if (feedbackResponse.ok) {
        const feedbackData = await feedbackResponse.json();
        setFeedbacks(feedbackData.slice(0, 12)); // Limit to 12 for display
      }

      // Fetch placements
      const placementResponse = await fetch('/api/users/placements');
      if (placementResponse.ok) {
        const placementData = await placementResponse.json();
        setPlacements(placementData.slice(0, 12)); // Limit to 12 for display
      }

    } catch (error) {
      console.error('Error fetching community data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load community data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredBadges = trustBadgeFilter === 'all' 
    ? trustBadges 
    : trustBadges.filter(badge => badge.category === trustBadgeFilter);

  const nextBadge = () => {
    setCurrentBadgeIndex((prev) => (prev + 1) % filteredBadges.length);
  };

  const prevBadge = () => {
    setCurrentBadgeIndex((prev) => (prev - 1 + filteredBadges.length) % filteredBadges.length);
  };

  const openBadgeModal = (badge: TrustBadge) => {
    setSelectedBadge(badge);
    setShowBadgeModal(true);
  };

  // Stats for the community
  const communityStats = [
    { label: 'Success Stories', value: placements.length, icon: Users, color: 'text-blue-600' },
    { label: 'Testimonials', value: feedbacks.length, icon: ThumbsUp, color: 'text-green-600' },
    { label: 'Trust Badges', value: trustBadges.length, icon: Shield, color: 'text-purple-600' },
    { label: 'Success Rate', value: '95%', icon: TrendingUp, color: 'text-orange-600' },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full shadow-lg">
              <Users className="h-6 w-6 mr-2" />
              <span className="font-semibold">Welcome to Our Community</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Join Our Growing Family
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover success stories, read testimonials from our students, and explore the trust badges 
              that make us a recognized leader in education and career development.
            </p>
          </div>

          {/* Community Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {communityStats.map((stat, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 mb-4 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-2">
              <TabsTrigger 
                value="testimonials" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Testimonials
              </TabsTrigger>
              <TabsTrigger 
                value="success" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-600 data-[state=active]:text-white rounded-xl transition-all"
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                Success Stories
              </TabsTrigger>
              <TabsTrigger 
                value="badges" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-xl transition-all"
              >
                <Shield className="h-4 w-4 mr-2" />
                Trust Badges
              </TabsTrigger>
            </TabsList>

            {/* Testimonials Tab */}
            <TabsContent value="testimonials" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {feedbacks.map((feedback, index) => (
                  <Card 
                    key={feedback._id} 
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-3 mb-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg group-hover:scale-110 transition-transform duration-300">
                            {feedback.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{feedback.name}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed line-clamp-4 group-hover:line-clamp-none transition-all duration-300">
                        "{feedback.feedback}"
                      </p>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <ThumbsUp className="h-4 w-4" />
                          <span>Helpful</span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {feedbacks.length === 0 && !loading && (
                <Card className="text-center border-0 shadow-lg">
                  <CardContent className="pt-12 pb-12">
                    <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Testimonials Yet</h3>
                    <p className="text-gray-600">Be the first to share your experience with our community!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Success Stories Tab */}
            <TabsContent value="success" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {placements.map((placement, index) => (
                  <Card 
                    key={placement._id} 
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group overflow-hidden"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {placement.image && (
                      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                        <img 
                          src={placement.image} 
                          alt={placement.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-green-500 text-white px-3 py-1">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Placed
                          </Badge>
                        </div>
                      </div>
                    )}
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 mb-1">{placement.name}</h3>
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <GraduationCap className="h-4 w-4 mr-1" />
                            <span className="truncate">{placement.collegeName}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Building2 className="h-4 w-4 mr-2 text-blue-600" />
                          <span className="font-medium">{placement.companyName}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                          <Badge variant="secondary" className="font-semibold bg-green-50 text-green-700">
                            {placement.salary}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                          {new Date(placement.createdAt).toLocaleDateString()}
                        </span>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {placements.length === 0 && !loading && (
                <Card className="text-center border-0 shadow-lg">
                  <CardContent className="pt-12 pb-12">
                    <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Success Stories Yet</h3>
                    <p className="text-gray-600">Our students' success stories will appear here soon!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Trust Badges Tab */}
            <TabsContent value="badges" className="space-y-8">
              {/* Featured Badge Carousel */}
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
                <CardHeader className="text-center pb-6 pt-8">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="p-3 bg-blue-100 rounded-2xl">
                      <Shield className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Our Recognitions
                    </CardTitle>
                    <div className="p-3 bg-indigo-100 rounded-2xl">
                      <Award className="h-8 w-8 text-indigo-600" />
                    </div>
                  </div>
                  <CardDescription className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    We are proud to be associated with leading government bodies and industry organizations, 
                    ensuring the highest standards of quality and credibility for your career growth.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-8">
                  {/* Filter Tabs */}
                  <div className="flex justify-center mb-8">
                    <div className="inline-flex rounded-2xl bg-white/80 backdrop-blur-sm p-2 border border-gray-200 shadow-lg">
                      {['all', 'Government', 'Education', 'Industry', 'Quality'].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => {
                            setTrustBadgeFilter(filter);
                            setCurrentBadgeIndex(0);
                          }}
                          className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                            trustBadgeFilter === filter 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                          }`}
                        >
                          {filter === 'all' ? 'All Partners' : filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Featured Badge Display */}
                  <div className="relative mb-8">
                    <div className="bg-white rounded-3xl p-8 border-2 border-blue-100 shadow-xl">
                      <div className="flex items-center justify-between">
                        <button 
                          onClick={prevBadge}
                          className="p-3 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-blue-200"
                        >
                          <ChevronLeft className="h-6 w-6 text-blue-600" />
                        </button>
                        
                        <div className="flex-1 mx-8">
                          <div className="text-center mb-6">
                            <Badge className="bg-green-500 text-white px-4 py-1 text-sm mb-2">
                              <Check className="h-3 w-3 mr-1" />
                              Verified Partner
                            </Badge>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                              {filteredBadges[currentBadgeIndex]?.name}
                            </h3>
                            <p className="text-gray-600 text-lg">
                              {filteredBadges[currentBadgeIndex]?.description}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-center gap-8">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-blue-600">{filteredBadges[currentBadgeIndex]?.year}</div>
                              <div className="text-sm text-gray-500">Since</div>
                            </div>
                            
                            <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-4 shadow-2xl border-2 border-blue-200 transform hover:scale-105 transition-transform duration-300">
                              <img 
                                src={filteredBadges[currentBadgeIndex]?.image} 
                                alt={filteredBadges[currentBadgeIndex]?.alt}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            
                            <div className="text-center">
                              <div className="text-2xl font-bold text-indigo-600">{filteredBadges[currentBadgeIndex]?.impact}</div>
                              <div className="text-sm text-gray-500">Impact</div>
                            </div>
                          </div>
                        </div>
                        
                        <button 
                          onClick={nextBadge}
                          className="p-3 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-blue-200"
                        >
                          <ChevronRight className="h-6 w-6 text-blue-600" />
                        </button>
                      </div>
                      
                      {/* Auto-play Controls */}
                      <div className="flex justify-center mt-6">
                        <button
                          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                          className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200"
                        >
                          {isAutoPlaying ? (
                            <>
                              <Pause className="h-4 w-4" />
                              <span className="text-sm font-medium">Pause</span>
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4" />
                              <span className="text-sm font-medium">Play</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* All Badges Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {filteredBadges.map((badge, index) => (
                      <div 
                        key={index}
                        onClick={() => openBadgeModal(badge)}
                        className={`group cursor-pointer flex flex-col items-center justify-center p-6 bg-white rounded-2xl border-2 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl ${
                          index === currentBadgeIndex 
                            ? 'border-blue-500 shadow-2xl scale-105' 
                            : 'border-blue-100 hover:border-blue-300'
                        }`}
                      >
                        {/* Verified Badge */}
                        {badge.verified && (
                          <div className="absolute -top-2 -right-2">
                            <Badge className="bg-green-500 text-white text-xs px-2 py-1">
                              <Check className="h-3 w-3" />
                            </Badge>
                          </div>
                        )}
                        
                        {/* Badge Image */}
                        <div className="w-20 h-20 mb-4 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 group-hover:scale-110 transition-transform duration-300">
                          <img 
                            src={badge.image} 
                            alt={badge.alt}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        
                        {/* Badge Info */}
                        <span className="text-sm font-semibold text-gray-800 text-center mb-1">
                          {badge.name}
                        </span>
                        <span className="text-xs text-blue-600 font-medium mb-2">
                          {badge.category}
                        </span>
                        
                        {/* View Details */}
                        <div className="flex items-center gap-1 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Info className="h-3 w-3" />
                          View details
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Progress Indicators */}
                  <div className="flex justify-center mt-8">
                    <div className="flex gap-2">
                      {filteredBadges.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentBadgeIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === currentBadgeIndex 
                              ? 'bg-blue-600 w-8' 
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* CTA Section */}
          <Card className="mt-12 border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl">
            <CardContent className="pt-12 pb-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Join Our Community Today</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Be part of a growing network of successful students and professionals. 
                Share your story, get inspired, and take your career to the next level.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 rounded-full"
                  onClick={() => window.location.href = '/courses'}
                >
                  Explore Courses
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-3 rounded-full"
                  onClick={() => window.location.href = '/internships'}
                >
                  Find Internships
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Badge Detail Modal */}
        {showBadgeModal && selectedBadge && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full transform animate-in zoom-in-95">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedBadge.name}</h3>
                  <button 
                    onClick={() => setShowBadgeModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <ChevronRight className="h-6 w-6 text-gray-500 rotate-45" />
                  </button>
                </div>
                
                <div className="text-center mb-6">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 mb-4 border-2 border-blue-200">
                    <img 
                      src={selectedBadge.image} 
                      alt={selectedBadge.alt}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <Badge className="bg-blue-100 text-blue-700 px-3 py-1 text-sm mb-3">
                    {selectedBadge.category}
                  </Badge>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {selectedBadge.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-blue-50 rounded-2xl p-4">
                      <div className="text-2xl font-bold text-blue-600">{selectedBadge.year}</div>
                      <div className="text-sm text-gray-500">Established</div>
                    </div>
                    <div className="bg-indigo-50 rounded-2xl p-4">
                      <div className="text-lg font-bold text-indigo-600">{selectedBadge.impact}</div>
                      <div className="text-sm text-gray-500">Impact</div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  onClick={() => setShowBadgeModal(false)}
                >
                  Got it
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CommunityPage;