"use client"
import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Define the shape of our image data
interface Image {
  id: number;
  url: string;
  uploaded_at: string;
}

interface ApiResponse {
  data: Image[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

interface FolderInfo {
  id: number;
  title: string;
  slug?: string;
  event_date: string;
  image_count: number;
}

async function getImagesByFolder(folderId: string, page: number = 1, limit: number = 12): Promise<ApiResponse> {
  const baseUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/gallery/${folderId}/images`;
  const query = new URLSearchParams({
    paginate: 'true',
    page: page.toString(),
    limit: limit.toString(),
  });

  try {
    const res = await fetch(`${baseUrl}?${query.toString()}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch images');
    }
    return res.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return { data: [], meta: { totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 12 } };
  }
}

async function getFolderInfo(folderId: string): Promise<FolderInfo | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/gallery/folders/${folderId}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch (error) {
    console.error("Fetch folder info error:", error);
    return null;
  }
}

// Loading skeleton for images
const ImageSkeleton = () => (
  <div className="bg-linear-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden animate-pulse">
    <div className="aspect-square w-full"></div>
    <div className="p-4 space-y-2">
      <div className="h-4 bg-gray-300 rounded"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
  </div>
);

function FolderGalleryContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const folderId = params.folderId as string;
  const currentPage = Number(searchParams.get('page')) || 1;
  
  const [images, setImages] = useState<Image[]>([]);
  const [meta, setMeta] = useState({ totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 12 });
  const [folderInfo, setFolderInfo] = useState<FolderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch folder info and images in parallel
        const [folderData, imagesData] = await Promise.all([
          getFolderInfo(folderId),
          getImagesByFolder(folderId, currentPage)
        ]);

        
        if (isMounted) {
          if (!folderData) {
            setError('Folder not found');
          } else {
            setFolderInfo(folderData);
          }
          setImages(imagesData.data);
          setMeta(imagesData.meta);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        if (isMounted) {
          setError('Failed to load gallery images');
          setImages([]);
          setMeta({ totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 12 });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (folderId) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [folderId, currentPage]);

  // Function to handle image click for lightbox
  const handleImageClick = (image: Image) => {
    setSelectedImage(image);
  };

  // Function to close lightbox
  const closeLightbox = () => {
    setSelectedImage(null);
  };

  // Function to navigate between images in lightbox
  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedImage) return;
    
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % images.length;
    } else {
      newIndex = (currentIndex - 1 + images.length) % images.length;
    }
    
    setSelectedImage(images[newIndex]);
  };

  // Handle keyboard navigation in lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        navigateImage('next');
      } else if (e.key === 'ArrowLeft') {
        navigateImage('prev');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header Skeleton */}
        <div className="relative overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 py-16">
            <div className="max-w-3xl">
              <div className="h-8 bg-linear-to-r from-gray-200 to-gray-300 rounded-full mb-6 w-64"></div>
              <div className="h-16 bg-linear-to-r from-gray-300 to-gray-400 rounded-2xl mb-4 w-full"></div>
              <div className="h-6 bg-gray-200 rounded mb-10 w-3/4"></div>
            </div>
          </div>
        </div>
        
        {/* Images Grid Skeleton */}
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ImageSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Header */}
      <div className="relative overflow-hidden bg-linear-to-br from-white via-gray-50 to-white">
        {/* Abstract background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-[#8E1B1B]/5 to-[#673AB7]/5 rounded-full -translate-y-32 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-linear-to-tr from-[#E91E63]/5 to-[#673AB7]/5 rounded-full -translate-x-48 translate-y-48"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 mb-6">
                <Link 
                  href="/gallery" 
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-[#8E1B1B] transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Gallery
                </Link>
                <span className="text-gray-400">/</span>
                <span className="bg-linear-to-r from-[#8E1B1B]/10 to-[#E91E63]/10 text-[#8E1B1B] text-sm font-semibold px-4 py-2 rounded-full">
                  {folderInfo?.title || 'Album'}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
                {folderInfo?.title || 'Gallery Album'}
              </h1>
              
              {folderInfo?.slug && (
                <p className="text-lg text-gray-600 mb-6 max-w-2xl">
                  {folderInfo.slug}
                </p>
              )}
              
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
                  <svg className="w-5 h-5 text-[#8E1B1B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700 font-medium">
                    {folderInfo?.event_date ? new Date(folderInfo.event_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Date not specified'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
                  <svg className="w-5 h-5 text-[#673AB7]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 font-medium">
                    {meta.totalItems} {meta.totalItems === 1 ? 'Image' : 'Images'}
                  </span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 pb-16">
        {error && (
          <div className="bg-linear-to-r from-red-50 to-red-100 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium">{error}</p>
                <p className="text-sm mt-1">Please check the folder ID or try again later.</p>
              </div>
            </div>
          </div>
        )}

        {/* Images Grid */}
        {images.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((image) => (
                <div 
                  key={image.id} 
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#8E1B1B]/20 cursor-pointer"
                  onClick={() => handleImageClick(image)}
                >
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden bg-linear-to-br from-gray-50 to-gray-100">
                    <img
                      src={image.url}
                      alt={ 'Gallery Image'}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* linear Overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Hover Overlay Content */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 backdrop-blur-sm text-[#8E1B1B] font-semibold px-6 py-3 rounded-full shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2">
                        View Full Size
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                        </svg>
                      </div>
                    </div>
                    
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow hover:shadow-md transition-shadow">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modern Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="mt-16">
                <div className="bg-linear-to-r from-white to-gray-50 rounded-2xl p-8 border border-gray-100">
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                    <div className="text-gray-700">
                      <div className="text-sm font-medium text-gray-500 mb-1">Image Navigation</div>
                      <div className="text-lg font-semibold">
                        Page <span className="text-[#8E1B1B]">{currentPage}</span> of <span className="text-[#673AB7]">{meta.totalPages}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {currentPage > 1 ? (
                        <Link
                          href={`/gallery/${folderId}?page=${currentPage - 1}`}
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
                              href={`/gallery/${folderId}?page=${pageNum}`}
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
                              href={`/gallery/${folderId}?page=${meta.totalPages}`}
                              className="min-w-12 h-12 flex items-center justify-center rounded-xl font-medium text-gray-700 hover:bg-gray-100"
                            >
                              {meta.totalPages}
                            </Link>
                          </>
                        )}
                      </div>
                      
                      {currentPage < meta.totalPages ? (
                        <Link
                          href={`/gallery/${folderId}?page=${currentPage + 1}`}
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
          </>
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-32 h-32 mx-auto mb-8 relative">
                <div className="absolute inset-0 bg-linear-to-r from-[#8E1B1B]/10 to-[#E91E63]/10 rounded-full animate-pulse"></div>
                <div className="absolute inset-4 bg-linear-to-r from-[#673AB7]/10 to-[#8E1B1B]/10 rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">No images found</h3>
              <p className="text-gray-600 mb-8 text-lg">
                This album doesn&apos;t contain any images yet.
              </p>
              <Link 
                href="/gallery"
                className="inline-flex items-center gap-2 bg-linear-to-r from-[#8E1B1B] to-[#C62828] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Gallery
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="relative max-w-7xl w-full max-h-[90vh]">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-400 transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Navigation Buttons */}
            <button
              onClick={() => navigateImage('prev')}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => navigateImage('next')}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Image Container */}
            <div className="relative w-full h-full">
              <img
                src={selectedImage.url}
                alt={ 'Gallery Image'}
                className="w-full h-full max-h-[70vh] object-contain rounded-2xl"
              />
              
              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-6 rounded-b-2xl">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center gap-4 mt-4 text-white/60 text-sm">
                    <span>Image {images.findIndex(img => img.id === selectedImage.id) + 1} of {images.length}</span>
                    <span>•</span>
                    <span>{selectedImage.uploaded_at ? new Date(selectedImage.uploaded_at).toLocaleDateString() : ''}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Image Counter */}
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
              {images.findIndex(img => img.id === selectedImage.id) + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main component wrapped in Suspense
export default function FolderGalleryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#8E1B1B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading album...</p>
        </div>
      </div>
    }>
      <FolderGalleryContent />
    </Suspense>
  );
}