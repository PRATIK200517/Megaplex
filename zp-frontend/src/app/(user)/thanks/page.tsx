"use client"
import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Define the shape of thank data
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

interface ApiResponse {
  data: Thank[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

// Helper function to get first image from images array
const getFirstImage = (images: any): string => {
  if (!images || !Array.isArray(images)) return '/api/placeholder/600/400';
  const firstImage = images[0];
  return firstImage?.url || '/api/placeholder/600/400';
};

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Truncate text
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// API Functions
async function getThanks(page: number = 1, search: string = '', sort: string = 'newest'): Promise<ApiResponse> {
  const baseUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/thanks/fetchThanks`;
  const query = new URLSearchParams({
    paginate: 'true',
    page: page.toString(),
    limit: '9',
    ...(search && { search }),
    sort: sort,
  });

  try {
    const res = await fetch(`${baseUrl}?${query.toString()}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch thanks');
    }
    return res.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return { data: [], meta: { totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 9 } };
  }
}

async function getFeaturedthanks(page: number = 1): Promise<ApiResponse> {
  const baseUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/thanks/fetchFeatured`;
  const query = new URLSearchParams({
    paginate: 'true',
    page: page.toString(),
    limit: '3',
  });

  try {
    const res = await fetch(`${baseUrl}?${query.toString()}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch featured thanks');
    }
    return res.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return { data: [], meta: { totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 3 } };
  }
}

// Featured thanks Carousel Component
function FeaturedthanksCarousel({ thanks, totalPages, currentPage }: { 
  thanks: Thank[], 
  totalPages: number, 
  currentPage: number 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const handlePrev = () => {
    if (currentPage > 1) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('featuredPage', (currentPage - 1).toString());
      router.push(`/thanks?${params.toString()}`);
    }
  };
  
  const handleNext = () => {
    if (currentPage < totalPages) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('featuredPage', (currentPage + 1).toString());
      router.push(`/thanks?${params.toString()}`);
    }
  };
  
  if (thanks.length === 0) return null;
  
  return (
    <div className="relative">
      {/* Carousel Navigation */}
      {totalPages > 1 && (
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 z-10 flex justify-between px-4">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className={`w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center transition-all ${
              currentPage === 1 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-white hover:shadow-xl'
            }`}
          >
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={`w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center transition-all ${
              currentPage === totalPages 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-white hover:shadow-xl'
            }`}
          >
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Featured thanks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {thanks.map((thank) => (
          <Link 
            href={`/thanks/${thank.id}`} 
            key={thank.id}
            className="group relative"
          >
            <div className="h-full bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#8E1B1B]/20">
              {/* Featured Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-linear-to-r from-[#8E1B1B] to-[#C62828] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  Featured
                </span>
              </div>
              
              {/* thank Image */}
              <div className="relative h-56 overflow-hidden">
                <div className="w-full h-full bg-linear-to-br from-[#8E1B1B]/10 to-[#673AB7]/10">
                  {thank.images && thank.images.length > 0 ? (
                    <img
                      src={getFirstImage(thank.images)}
                      alt={thank.images[0]?.alt || thank.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-gray-300">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                {/* linear Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              
              {/* thank Content */}
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formatDate(thank.createdAt)}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#8E1B1B] transition-colors duration-300 mb-3 line-clamp-2">
                  {thank.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {truncateText(thank.description, 120)}
                </p>
                
                <div className="flex items-center text-[#8E1B1B] font-semibold group-hover:underline">
                  Read More
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Carousel Pagination Dots */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNum = index + 1;
            return (
              <button
                key={pageNum}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('featuredPage', pageNum.toString());
                  router.push(`/thanks?${params.toString()}`);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentPage === pageNum 
                    ? 'bg-[#8E1B1B] w-8' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to featured page ${pageNum}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ThanksContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const currentPage = Number(searchParams.get('page')) || 1;
  const featuredPage = Number(searchParams.get('featuredPage')) || 1;
  const searchTerm = searchParams.get('search') || '';
  const sortOrder = searchParams.get('sort') || 'newest';
  
  const [featuredthanks, setFeaturedthanks] = useState<Thank[]>([]);
  const [featuredMeta, setFeaturedMeta] = useState({ totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 3 });
  const [thanks, setthanks] = useState<Thank[]>([]);
  const [meta, setMeta] = useState({ totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 9 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch featured thanks and all thanks in parallel
      const [featuredResponse, thanksResponse] = await Promise.all([
        getFeaturedthanks(featuredPage),
        getThanks(currentPage, searchTerm, sortOrder)
      ]);
      
      setFeaturedthanks(featuredResponse.data);
      setFeaturedMeta(featuredResponse.meta);
      setthanks(thanksResponse.data);
      setMeta(thanksResponse.meta);
      
    } catch (err) {
      console.error('Error fetching thanks:', err);
      setError('Failed to load thanks data');
      setFeaturedthanks([]);
      setthanks([]);
      setFeaturedMeta({ totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 3 });
      setMeta({ totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 9 });
    } finally {
      setLoading(false);
    }
  }, [currentPage, featuredPage, searchTerm, sortOrder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle form submission
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get('search') as string;
    const sort = formData.get('sort') as string || sortOrder;
    
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (sort) params.set('sort', sort);
    params.set('page', '1');
    params.set('featuredPage', '1');
    
    router.push(`/thanks?${params.toString()}`);
  };

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', newSort);
    params.set('page', '1'); // Reset to page 1 when changing sort
    router.push(`/thanks?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#8E1B1B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading thanks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Header */}
      <div className="relative overflow-hidden">
        {/* Abstract background */}
        <div className="absolute inset-0 bg-linear-to-br from-white via-[#F5F5F5] to-white"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-[#8E1B1B]/10 to-[#673AB7]/10 rounded-full -translate-y-32 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-linear-to-tr from-[#E91E63]/5 to-[#673AB7]/5 rounded-full -translate-x-48 translate-y-48"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-linear-to-r from-[#8E1B1B]/10 to-[#E91E63]/10 text-[#8E1B1B] text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              Thoughts & Insights
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Our <span className="text-transparent bg-clip-text bg-linear-to-r from-[#8E1B1B] via-[#673AB7] to-[#E91E63]">thank</span> & Articles
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-2xl">
              Discover insights, stories, and updates from our school community
            </p>
            
            {/* Search and Sort Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <form onSubmit={handleSearchSubmit} className="flex-1">
                <div className="relative">
                  <input
                    type="hidden"
                    name="sort"
                    value={sortOrder}
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="search"
                    defaultValue={searchTerm}
                    placeholder="Search for articles, topics, keywords..."
                    className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#8E1B1B]/30 focus:border-[#8E1B1B] focus:outline-none transition-all"
                  />
                  <button type="submit" className="sr-only">Search</button>
                </div>
              </form>
              
              {/* Sort Dropdown */}
              <div className="md:w-64">
                <div className="relative">
                  <select
                    value={sortOrder}
                    onChange={handleSortChange}
                    className="w-full pl-4 pr-10 py-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl text-gray-900 appearance-none focus:ring-2 focus:ring-[#8E1B1B]/30 focus:border-[#8E1B1B] focus:outline-none transition-all"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 pb-16">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}
        
        {/* Featured thanks Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Stories</h2>
              <p className="text-gray-600">Handpicked articles worth reading</p>
            </div>
            {featuredMeta.totalPages > 1 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Page {featuredPage} of {featuredMeta.totalPages}</span>
                <span className="text-gray-400">•</span>
                <span>{featuredMeta.totalItems} featured articles</span>
              </div>
            )}
          </div>
          
          <FeaturedthanksCarousel 
            thanks={featuredthanks} 
            totalPages={featuredMeta.totalPages} 
            currentPage={featuredPage} 
          />
        </div>
        
        {/* All thanks Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">All Articles</h2>
              <p className="text-gray-600">Browse our complete collection of thank posts</p>
            </div>
            <div className="text-sm text-gray-600">
              Showing {thanks.length} of {meta.totalItems} articles
            </div>
          </div>
          
          {/* thanks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {thanks.length > 0 ? (
              thanks.map((thank) => (
                <Link 
                  href={`/thanks/${thank.id}`} 
                  key={thank.id}
                  className="group"
                >
                  <div className="h-full bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#8E1B1B]/20">
                    {/* thank Image */}
                    <div className="relative h-48 overflow-hidden">
                      <div className="w-full h-full bg-linear-to-br from-[#673AB7]/10 to-[#8E1B1B]/10">
                        {thank.images && thank.images.length > 0 ? (
                          <img
                            src={getFirstImage(thank.images)}
                            alt={thank.images[0]?.alt || thank.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-gray-300">
                              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Featured Badge */}
                      {thank.isFeatured && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-linear-to-r from-[#8E1B1B] to-[#C62828] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                            Featured
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* thank Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(thank.createdAt)}</span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#8E1B1B] transition-colors duration-300 mb-3 line-clamp-2">
                        {thank.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {truncateText(thank.description, 100)}
                      </p>
                      
                      <div className="flex items-center text-[#8E1B1B] font-semibold text-sm group-hover:underline">
                        Read Article
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-3 py-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-6 relative">
                    <div className="absolute inset-0 bg-linear-to-r from-[#8E1B1B]/10 to-[#E91E63]/10 rounded-full"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No articles found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm 
                      ? `No results found for "${searchTerm}". Try different keywords or browse all articles.`
                      : 'Start creating thank posts to share insights and stories with the community.'
                    }
                  </p>
                  {searchTerm && (
                    <Link 
                      href="/thanks"
                      className="inline-flex items-center gap-2 bg-linear-to-r from-[#8E1B1B] to-[#C62828] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow"
                    >
                      View All Articles
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Modern Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="mt-12">
              <div className="bg-linear-to-r from-white to-gray-50 rounded-2xl p-8 border border-gray-100">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="text-gray-700">
                    <div className="text-sm font-medium text-gray-500 mb-1">Article Navigation</div>
                    <div className="text-lg font-semibold">
                      Page <span className="text-[#8E1B1B]">{currentPage}</span> of <span className="text-[#673AB7]">{meta.totalPages}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {currentPage > 1 ? (
                      <Link
                        href={`/thanks?page=${currentPage - 1}&search=${searchTerm}&sort=${sortOrder}&featuredPage=${featuredPage}`}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 hover:bg-[#8E1B1B] hover:text-white shadow-md hover:shadow-lg border border-gray-200 hover:border-[#8E1B1B] rounded-xl font-medium transition-all duration-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Previous
                      </Link>
                    ) : (
                      <span className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-400 cursor-not-allowed rounded-xl font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Previous
                      </span>
                    )}
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(
                          meta.totalPages - 4,
                          currentPage - 2
                        )) + i;
                        
                        if (pageNum > meta.totalPages) return null;
                        
                        return (
                          <Link
                            key={pageNum}
                            href={`/thanks?page=${pageNum}&search=${searchTerm}&sort=${sortOrder}&featuredPage=${featuredPage}`}
                            className={`min-w-12 h-12 flex items-center justify-center rounded-xl font-medium transition-all duration-300 ${
                              currentPage === pageNum
                                ? 'bg-linear-to-r from-[#8E1B1B] to-[#673AB7] text-white shadow-lg'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </Link>
                        );
                      })}
                      
                      {meta.totalPages > 5 && currentPage < meta.totalPages - 2 && (
                        <>
                          <span className="px-2 text-gray-400">...</span>
                          <Link
                            href={`/thanks?page=${meta.totalPages}&search=${searchTerm}&sort=${sortOrder}&featuredPage=${featuredPage}`}
                            className="min-w-12 h-12 flex items-center justify-center rounded-xl font-medium text-gray-700 hover:bg-gray-100"
                          >
                            {meta.totalPages}
                          </Link>
                        </>
                      )}
                    </div>
                    
                    {currentPage < meta.totalPages ? (
                      <Link
                        href={`/thanks?page=${currentPage + 1}&search=${searchTerm}&sort=${sortOrder}&featuredPage=${featuredPage}`}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 hover:bg-[#8E1B1B] hover:text-white shadow-md hover:shadow-lg border border-gray-200 hover:border-[#8E1B1B] rounded-xl font-medium transition-all duration-300"
                      >
                        Next
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    ) : (
                      <span className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-400 cursor-not-allowed rounded-xl font-medium">
                        Next
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main component wrapped in Suspense
export default function thanksPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#8E1B1B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading thanks...</p>
        </div>
      </div>
    }>
     <ThanksContent/>
    </Suspense>
  );
}