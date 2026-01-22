"use client"
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

// Define the shape of our folder data based on your schema
interface Folder {
  id: number;
  title: string;
  slug: string;
  thumbnail_image: {
    url: string;
    alt?: string;
  };
  event_date: string;
  image_count: number;
  category?: string;
}

interface ApiResponse {
  data: Folder[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

async function getFolders(page: number, search: string, sort: string = 'newest'): Promise<ApiResponse> {
  const baseUrl = 'http://localhost:5000/api/gallery/getFolders'; 
  const query = new URLSearchParams({
    paginate: 'true',
    page: page.toString(),
    limit: '12',
    search: search || '',
    sort: sort,
  });

  try {
    const res = await fetch(`${baseUrl}?${query.toString()}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Fetch failed:', res.status, res.statusText);
      return { data: [], meta: { totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 12 } };
    }
    return res.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return { data: [], meta: { totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 12 } };
  }
}

// Function to get category color based on title or category
const getCategoryColor = (title: string, category?: string) => {
  const categoryText = category || title.toLowerCase();
  
  if (categoryText.includes('independence') || categoryText.includes('school event') || categoryText.includes('celebration')) {
    return 'bg-gradient-to-r from-[#E91E63] to-[#F48FB1] text-white'; // Pink gradient
  } else if (categoryText.includes('sports') || categoryText.includes('athletics') || categoryText.includes('competition')) {
    return 'bg-gradient-to-r from-[#673AB7] to-[#9575CD] text-white'; // Purple gradient
  } else if (categoryText.includes('academic') || categoryText.includes('graduation') || categoryText.includes('achievement')) {
    return 'bg-gradient-to-r from-[#8E1B1B] to-[#C62828] text-white'; // Maroon gradient
  } else if (categoryText.includes('workshop') || categoryText.includes('seminar') || categoryText.includes('training')) {
    return 'bg-gradient-to-r from-[#00695C] to-[#26A69A] text-white'; // Teal gradient
  } else {
    return 'bg-gradient-to-r from-[#455A64] to-[#78909C] text-white'; // Gray gradient
  }
};

// Function to format date with modern style
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const year = date.getFullYear();
  
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-bold text-[#8E1B1B] leading-none">{day}</span>
      <span className="text-xs text-[#757575] uppercase tracking-wide">{month}</span>
      <span className="text-xs text-[#757575]">{year}</span>
    </div>
  );
};

function GalleryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const currentPage = Number(searchParams.get('page')) || 1;
  const searchTerm = searchParams.get('search') || '';
  const sortOrder = searchParams.get('sort') || 'newest';
  
  const [folders, setFolders] = useState<Folder[]>([]);
  const [meta, setMeta] = useState({ totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 12 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getFolders(currentPage, searchTerm, sortOrder);
        
        if (isMounted) {
          setFolders(response.data);
          setMeta(response.meta);
        }
      } catch (err) {
        console.error('Error fetching folders:', err);
        if (isMounted) {
          setError('Failed to load gallery data');
          setFolders([]);
          setMeta({ totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 12 });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [currentPage, searchTerm, sortOrder]);

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
    
    router.push(`/gallery?${params.toString()}`);
  };

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', newSort);
    params.set('page', '1'); // Reset to page 1 when changing sort
    router.push(`/gallery?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#8E1B1B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gallery...</p>
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
                <path fillRule="evenodd" d="M10 18a8 0 100-16 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Capture Every Moment
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Our <span className="text-transparent bg-clip-text bg-linear-to-r from-[#8E1B1B] via-[#673AB7] to-[#E91E63]">Gallery</span> of Memories
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-2xl">
              A visual journey through our school&apos;s most cherished moments, events, and achievements
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
                    placeholder="Search for events, activities, moments..."
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
        
        {/* Stats Bar */}
        <div className="relative -mt-8 mb-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#8E1B1B]">{meta?.totalItems || 0}</div>
                <div className="text-sm text-gray-600">Total Albums</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#673AB7]">{folders.length}</div>
                <div className="text-sm text-gray-600">Showing Now</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#E91E63]">{meta?.totalPages || 1}</div>
                <div className="text-sm text-gray-600">Total Pages</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">{currentPage}</div>
                <div className="text-sm text-gray-600">Current Page</div>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {folders.length > 0 ? (
            folders.map((folder) => (
              <Link 
                href={`/gallery/${folder.id}`} 
                key={folder.id}
                className="group relative"
              >
                <div className="h-full bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#8E1B1B]/20">
                  {/* Thumbnail Container */}
                  <div className="relative h-64 overflow-hidden bg-linear-to-br from-gray-50 to-gray-100">
                    {folder.thumbnail_image?.url ? (
                      <div className="relative h-full">
                        <img
                          src={folder.thumbnail_image.url}
                          alt={folder.thumbnail_image.alt || folder.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-gray-400">
                          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    )}
                    
                    {/* Floating Date Badge */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                      {formatDate(folder.event_date)}
                    </div>
                    
                    {/* Image Count Badge */}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-2 rounded-full">
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        <span>{folder.image_count}</span>
                      </div>
                    </div>
                    
                    {/* Hover Action Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white text-[#8E1B1B] font-semibold px-6 py-3 rounded-full shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2">
                        View Album
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-bold text-xl text-gray-900 group-hover:text-[#8E1B1B] transition-colors duration-300 line-clamp-2">
                        {folder.title}
                      </h3>
                    </div>
                    
                    {/* Category Tag */}
                    <div className="mb-4">
                      <span className={`inline-block ${getCategoryColor(folder.title, folder.category)} text-xs font-semibold px-3 py-1.5 rounded-full`}>
                        {folder.category || 'School Event'}
                      </span>
                    </div>
                    
                  
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-32 h-32 mx-auto mb-8 relative">
                  <div className="absolute inset-0 bg-linear-to-r from-[#8E1B1B]/10 to-[#E91E63]/10 rounded-full animate-pulse"></div>
                  <div className="absolute inset-4 bg-linear-to-r from-[#673AB7]/10 to-[#8E1B1B]/10 rounded-full"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">No albums found</h3>
                <p className="text-gray-600 mb-8 text-lg">
                  {searchTerm 
                    ? `No results found for "${searchTerm}". Try different keywords or browse all albums.`
                    : 'Start creating memorable albums to showcase school events and achievements.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {searchTerm && (
                    <Link 
                      href="/gallery"
                      className="bg-linear-to-r from-[#8E1B1B] to-[#C62828] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow"
                    >
                      View All Albums
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modern Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="mt-16">
            <div className="bg-linear-to-r from-white to-gray-50 rounded-2xl p-8 border border-gray-100">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="text-gray-700">
                  <div className="text-sm font-medium text-gray-500 mb-1">Gallery Navigation</div>
                  <div className="text-lg font-semibold">
                    Page <span className="text-[#8E1B1B]">{currentPage}</span> of <span className="text-[#673AB7]">{meta.totalPages}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {currentPage > 1 ? (
                    <Link
                      href={`/gallery?page=${currentPage - 1}&search=${searchTerm}&sort=${sortOrder}`}
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
                          href={`/gallery?page=${pageNum}&search=${searchTerm}&sort=${sortOrder}`}
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
                          href={`/gallery?page=${meta.totalPages}&search=${searchTerm}&sort=${sortOrder}`}
                          className="min-w-12 h-12 flex items-center justify-center rounded-xl font-medium text-gray-700 hover:bg-gray-100"
                        >
                          {meta.totalPages}
                        </Link>
                      </>
                    )}
                  </div>
                  
                  {currentPage < meta.totalPages ? (
                    <Link
                      href={`/gallery?page=${currentPage + 1}&search=${searchTerm}&sort=${sortOrder}`}
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
  );
}

// Main component wrapped in Suspense for useSearchParams
export default function GalleryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#8E1B1B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    }>
      <GalleryContent />
    </Suspense>
  );
}