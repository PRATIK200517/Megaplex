"use client"
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Define the shape of Thank data
interface Thank {
  id: number;
  title: string;
  description: string;
  content: string;
  images?: {
    url: string;
    alt?: string;
  }[];
  isFeatured: boolean;
  createdAt: string;
}

// API Function
async function getThankById(thankId: string): Promise<{ thank: Thank; message: string } | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/thanks/${thankId}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Thank not found');
      }
      throw new Error(`Failed to fetch thank: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    
    if (data && (data.thank || data.data)) {
      return {
        thank: data.thank || data.data,
        message: data.message || 'Thank retrieved successfully'
      };
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

// Image Carousel Component
function ThankImageCarousel({ images }: { images: { url: string; alt?: string }[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const handlePrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };
  
  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };
  
  if (images.length === 0) return null;
  
  return (
    <div className="relative">
      {/* Main Image */}
      <div className="relative h-100 md:h-125 lg:h-150 rounded-3xl overflow-hidden bg-linear-to-br from-gray-100 to-gray-200">
        <img
          src={images[currentIndex].url}
          alt={images[currentIndex].alt || 'Thank image'}
          className="w-full h-full object-cover"
        />
        
        {/* linear Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent"></div>
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:shadow-xl transition-all duration-300"
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:shadow-xl transition-all duration-300"
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        
        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
      
      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <div className="mt-6">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-300 ${
                  currentIndex === index 
                    ? 'ring-2 ring-[#8E1B1B] ring-offset-2 scale-105' 
                    : 'opacity-70 hover:opacity-100 hover:scale-105'
                }`}
              >
                <img
                  src={image.url}
                  alt={image.alt || `Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {currentIndex === index && (
                  <div className="absolute inset-0 bg-[#8E1B1B]/20"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Table of Contents Component
function TableOfContents({ content }: { content: string }) {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  
  useEffect(() => {
    // Extract headings from content (h2 and h3)
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headingElements = doc.querySelectorAll('h2, h3');
    
    const extractedHeadings = Array.from(headingElements).map((heading, index) => {
      const id = `heading-${index}`;
      heading.id = id;
      return {
        id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName.charAt(1))
      };
    });
    
    setHeadings(extractedHeadings);
  }, [content]);
  
  if (headings.length === 0) return null;
  
  return (
    <div className="sticky top-24 bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-[#8E1B1B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Table of Contents
      </h3>
      <nav className="space-y-2">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={`block text-gray-600 hover:text-[#8E1B1B] transition-colors ${
              heading.level === 3 ? 'ml-4 text-sm' : 'font-medium'
            }`}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </div>
  );
}

// Share Buttons Component
function ShareButtons({ title, url }: { title: string; url: string }) {
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`,
  };
  
  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-700 font-medium">Share:</span>
      <div className="flex items-center gap-2">
        {[
          { name: 'facebook', color: 'bg-blue-600 hover:bg-blue-700', icon: 'F' },
          { name: 'twitter', color: 'bg-sky-500 hover:bg-sky-600', icon: '𝕏' },
          { name: 'linkedin', color: 'bg-blue-700 hover:bg-blue-800', icon: 'in' },
          { name: 'whatsapp', color: 'bg-green-500 hover:bg-green-600', icon: 'WA' },
        ].map((platform) => (
          <a
            key={platform.name}
            href={shareLinks[platform.name as keyof typeof shareLinks]}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${platform.color} transition-colors`}
            aria-label={`Share on ${platform.name}`}
          >
            {platform.icon}
          </a>
        ))}
      </div>
    </div>
  );
}

// Main component
export default function SingleThankPage() {
  const params = useParams();
  const thankId = params.id as string;
  const [thank, setThank] = useState<Thank | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchThank = async () => {
      console.log("Fetching thank with ID:", thankId);
      try {
        setLoading(true);
        setError(null);
        
        const data = await getThankById(thankId);
        console.log("API Response:", data);
        
        if (data?.thank) {
          setThank(data.thank);
        } else {
          setError('Thank not found or invalid response format');
        }
      } catch (err: any) {
        console.error('Error fetching thank:', err);
        setError(err.message || 'Failed to load thank post');
      } finally {
        setLoading(false);
      }
    };
    
    if (thankId) {
      fetchThank();
    } else {
      console.error("No thankId provided");
      setError('No thank ID provided');
      setLoading(false);
    }
  }, [thankId]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header Skeleton */}
        <div className="relative overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto">
              <div className="h-8 bg-linear-to-r from-gray-200 to-gray-300 rounded-full mb-6 w-64"></div>
              <div className="h-12 bg-linear-to-r from-gray-300 to-gray-400 rounded-2xl mb-4 w-full"></div>
              <div className="h-6 bg-gray-200 rounded mb-10 w-3/4"></div>
            </div>
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="h-125 bg-linear-to-br from-gray-100 to-gray-200 rounded-3xl mb-8"></div>
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-gray-100 rounded-2xl"></div>
              <div className="h-64 bg-gray-100 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !thank) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-linear-to-r from-[#8E1B1B]/10 to-[#E91E63]/10 rounded-full"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{error || 'Thank Not Found'}</h1>
          <p className="text-gray-600 mb-8">
            The thank post you're looking for doesn't exist or has been moved.
          </p>
          <Link 
            href="/thanks"
            className="inline-flex items-center gap-2 bg-linear-to-r from-[#8E1B1B] to-[#C62828] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Thanks
          </Link>
        </div>
      </div>
    );
  }
  
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  return (
    <div className="min-h-screen bg-white">
      {/* Modern Header */}
      <div className="relative overflow-hidden bg-linear-to-br from-white via-gray-50 to-white">
        {/* Abstract background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-[#8E1B1B]/5 to-[#673AB7]/5 rounded-full -translate-y-32 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-linear-to-tr from-[#E91E63]/5 to-[#673AB7]/5 rounded-full -translate-x-48 translate-y-48"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Link 
                href="/thanks" 
                className="inline-flex items-center gap-2 text-gray-600 hover:text-[#8E1B1B] transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Thanks
              </Link>
              <span className="text-gray-400">/</span>
              {thank.isFeatured && (
                <>
                  <span className="bg-linear-to-r from-[#8E1B1B]/10 to-[#E91E63]/10 text-[#8E1B1B] text-sm font-semibold px-4 py-2 rounded-full">
                    Featured
                  </span>
                  <span className="text-gray-400">/</span>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-gray-500 mb-6">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">
                {new Date(thank.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {thank.title}
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl">
              {thank.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <ShareButtons title={thank.title} url={currentUrl} />
              
              {/* Read Time Estimate */}
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">
                  {Math.ceil(thank.content.split(' ').length / 200)} min read
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Thank Content - Main Column */}
          <div className="lg:col-span-2">
            {/* Images Carousel */}
            {thank.images && thank.images.length > 0 && (
              <div className="mb-12">
                <ThankImageCarousel images={thank.images} />
              </div>
            )}
            
            {/* Thank Content */}
            <article className="prose prose-lg max-w-none">
              <div 
                className="text-gray-700 leading-relaxed space-y-6"
                dangerouslySetInnerHTML={{ __html: thank.content }}
              />
            </article>
            
            {/* Share Section */}
            <div className="mt-12 p-8 bg-linear-to-r from-[#8E1B1B]/5 to-[#673AB7]/5 rounded-2xl border border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Found this thank note helpful?</h3>
                  <p className="text-gray-600">Share it with others who might benefit from it</p>
                </div>
                <ShareButtons title={thank.title} url={currentUrl} />
              </div>
            </div>
            
            {/* Navigation */}
            <div className="mt-12 flex justify-between items-center pt-8 border-t border-gray-200">
              <Link 
                href="/thanks"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-[#8E1B1B] font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to All Thanks
              </Link>
              
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-[#8E1B1B] font-medium transition-colors"
              >
                Back to Top
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-8">
            {/* Table of Contents */}
            <TableOfContents content={thank.content} />
            
            {/* Featured Badge */}
            {thank.isFeatured && (
              <div className="bg-linear-to-r from-[#8E1B1B]/10 to-[#E91E63]/10 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-linear-to-r from-[#8E1B1B] to-[#C62828] rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Featured Thank Note</h3>
                    <p className="text-sm text-gray-600">This thank note is specially featured</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  This thank note has been selected as a featured post for its valuable content and insights.
                </p>
              </div>
            )}
            
            {/* Author Info */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">From</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-linear-to-br from-[#8E1B1B]/20 to-[#673AB7]/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#8E1B1B]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">School Community</h4>
                  <p className="text-sm text-gray-600">Expressing Gratitude</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Heartfelt thanks and appreciation from our school community.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-6 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Thank Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
