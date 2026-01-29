"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UserFooter from '@/components/UserFooter';

// Define the type for notices from your API based on your Prisma model
interface Notice {
  id: number;
  title: string;
  description: string;
  expiry: string;
  createdAt: string;
}

const HomePage = () => {
  const router = useRouter();
  
  // State for dynamic announcements from API
  const [notices, setNotices] = useState<Notice[]>([]);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notices from API
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/notices/getNotices`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch notices: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.notices && Array.isArray(data.notices)) {
          setNotices(data.notices);
        } else {
          throw new Error('Invalid data format received from API');
        }
      } catch (err) {
        console.error('Error fetching notices:', err);
        setError('Failed to load announcements');
        // Fallback to hardcoded announcements if API fails
        setNotices([
          { id: 1, title: "Admissions open for the Academic Year 2026-27! Contact the office for details.", description: "", expiry: "", createdAt: "" },
          { id: 2, title: "Upcoming Event: Annual Sports Day scheduled for February 15th.", description: "", expiry: "", createdAt: "" },
          { id: 3, title: "Congratulations to our students for winning the District Level Science Fair!", description: "", expiry: "", createdAt: "" },
          { id: 4, title: "New Smart Classrooms inaugurated for better learning experience.", description: "", expiry: "", createdAt: "" },
          { id: 5, title: "Parent-Teacher Meeting scheduled for next week.", description: "", expiry: "", createdAt: "" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  // Rotate announcements automatically
  useEffect(() => {
    if (notices.length === 0) return;

    const interval = setInterval(() => {
      setCurrentAnnouncement((prev) => (prev + 1) % notices.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [notices.length]);

  // Key Features data
  const keyFeatures = [
    {
      id: 1,
      title: "Experienced Teachers",
      description: "Teachers with 10+ years of Experience",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14v6l9-5M12 20l-9-5" />
        </svg>
      ),
      color: "from-[#8E1B1B] to-[#C62828]"
    },
    {
      id: 2,
      title: "Smart Classrooms",
      description: "Smart Classrooms includes smart TV's etc",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: "from-[#673AB7] to-[#9575CD]"
    },
    {
      id: 3,
      title: "Modern Facilities",
      description: "Modern Facilites",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: "from-[#E91E63] to-[#F48FB1]"
    }
  ];

  // Achievements data
  const achievements = [
    {
      id: 1,
      name: "Student 1",
      role: "Student",
      description: "First prize in science Exibition",
      color: "bg-linear-to-r from-[#8E1B1B] to-[#C62828]"
    },
   {
      id: 2,
      name: "Student 1",
      role: "Student",
      description: "First prize in science Exibition",
      color: "bg-linear-to-r from-[#8E1B1B] to-[#C62828]"
    },
   {
      id: 3,
      name: "Student 1",
      role: "Student",
      description: "First prize in science Exibition",
      color: "bg-linear-to-r from-[#8E1B1B] to-[#C62828]"
    },
   {
      id: 4,
      name: "Student 1",
      role: "Student",
      description: "First prize in science Exibition",
      color: "bg-linear-to-r from-[#8E1B1B] to-[#C62828]"
    },
  ];

  // Press & Media data
  const pressItems = [
    { id: 1, title: "Annual Science Fair Coverage", date: "Jan 15, 2024", source: "Local News" },
    { id: 2, title: "Smart Classroom Initiative", date: "Dec 20, 2023", source: "Education Today" },
    { id: 3, title: "Sports Day Highlights", date: "Nov 10, 2023", source: "School Journal" },
    { id: 4, title: "Community Outreach Program", date: "Oct 5, 2023", source: "Community News" }
  ];

  const navItems = [
    {item:"About Us",tgt:"/about"},
    {item:"Image Gallery",tgt:"/gallery"},
    {item:"Blogs",tgt:"/blogs"},
    {item:"Special Thanks",tgt:"/thanks"},
    {item:"Admin Login",tgt:"/login"},
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Scrolling Announcement Bar */}
      <div className="relative overflow-hidden bg-linear-to-r from-[#8E1B1B] to-[#C62828] text-white">
        <div className="py-3 px-4">
          <div className="flex items-center max-w-7xl mx-auto">
            <div className="flex items-center mr-6">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <span className="font-semibold text-sm">Latest:</span>
            </div>
            <div className="flex-1 overflow-hidden">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-white/30 rounded w-3/4"></div>
                </div>
              ) : error ? (
                <div className="text-sm">{error}</div>
              ) : notices.length === 0 ? (
                <div>No announcements at the moment</div>
              ) : (
                <div 
                  key={currentAnnouncement}
                  className="animate-slide-in"
                >
                  {notices[currentAnnouncement]?.title || "No announcement"}
                </div>
              )}
            </div>
            {!loading && !error && notices.length > 0 && (
              <div className="flex items-center ml-6">
                {notices.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentAnnouncement(index)}
                    className={`w-2 h-2 rounded-full mx-1 transition-all ${index === currentAnnouncement ? 'bg-white' : 'bg-white/50'}`}
                    aria-label={`Go to announcement ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/School Name */}
            <div className="flex items-center">
              <div className="text-2xl font-bold">
                <span className="text-[#8E1B1B]">ZP</span>
                <span className="text-[#673AB7]"> PRIMARY SCHOOL</span>
                <span className="text-[#E91E63]"> JAWALI</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.item}
                  href={item.tgt}
                  className="text-gray-700 hover:text-[#8E1B1B] font-medium transition-colors"
                >
                  {item.item}
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Background Image */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://ik.imagekit.io/zpjawali/homePage')`,
            }}
          />
          {/* linear Overlay */}
          <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/40 to-black/60" />
          {/* Subtle Pattern Overlay */}
         <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2760%27 height=%2760%27 viewBox=%270 0 60 60%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27none%27 fill-rule=%27evenodd%27%3E%3Cg fill=%27%239C92AC%27 fill-opacity=%270.05%27%3E%3Cpath d=%27M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
         </div>
        
        {/* Content Container */}
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 w-full">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
              Shaping <span className="text-transparent bg-clip-text bg-linear-to-r from-white via-gray-200 to-gray-300">Future</span> Leaders
            </h1>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto drop-shadow-md">
              A premier educational institution dedicated to holistic development, academic excellence, and character building for the leaders of tomorrow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/gallery')}
                className="bg-linear-to-r from-[#8E1B1B] to-[#C62828] text-white px-8 py-4 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 shadow-lg"
              >
                <div className="flex items-center justify-center gap-2">
                  View Gallery
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
              <button className="bg-white/90 backdrop-blur-sm text-gray-800 border border-white/20 px-8 py-4 rounded-xl font-semibold hover:bg-white hover:border-[#8E1B1B] hover:text-[#8E1B1B] transition-all duration-300 shadow-lg hover:shadow-2xl">
                <div className="flex items-center justify-center gap-2">
                  Contact Us
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </button>
            </div>
            
            {/* Stats Counter */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">500+</div>
                <div className="text-white/80 text-sm">Happy Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">25+</div>
                <div className="text-white/80 text-sm">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">50+</div>
                <div className="text-white/80 text-sm">Expert Teachers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">100%</div>
                <div className="text-white/80 text-sm">Parent Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Key Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide exceptional educational facilities and experienced faculty to nurture young minds
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {keyFeatures.map((feature) => (
              <div 
                key={feature.id}
                className="relative group"
              >
                <div className="absolute inset-0 bg-linear-to-r from-white to-gray-50 rounded-2xl transform group-hover:scale-105 transition-transform duration-300"></div>
                <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 group-hover:shadow-xl transition-all duration-300">
                  <div className={`w-16 h-16 rounded-xl bg-linear-to-r ${feature.color} text-white flex items-center justify-center mb-6`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center text-[#8E1B1B] font-medium">
                      Learn more
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Achievements</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Celebrating excellence and recognizing the accomplishments of our community members
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="group">
                <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className={`h-3 ${achievement.color}`}></div>
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="w-16 h-16 rounded-full bg-gray-200 mb-3 flex items-center justify-center text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">{achievement.name}</h3>
                      <p className="text-[#757575] text-sm mt-1">{achievement.role}</p>
                    </div>
                    <p className="text-gray-700">{achievement.description}</p>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="text-xs text-[#757575] flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Achievement Recognized
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Press & Media Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Press & Media</h2>
              <p className="text-gray-600 max-w-2xl">
                Stay updated with our latest news and media coverage
              </p>
            </div>
            <button className="mt-4 md:mt-0 bg-linear-to-r from-[#8E1B1B] to-[#C62828] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow">
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pressItems.map((item) => (
              <div key={item.id} className="group">
                <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="p-6">
                    <div className="flex items-center text-[#757575] text-sm mb-4">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {item.date}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm text-[#8E1B1B] font-medium">{item.source}</span>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-[#8E1B1B] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

     <UserFooter/>
      {/* Animation styles */}
      <style jsx>{`
        @keyframes slide-in {
          0% {
            opacity: 0;
            transform: translateX(30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default HomePage;