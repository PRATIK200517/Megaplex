"use client"
import { MagnifyingGlassIcon, TrashIcon, XMarkIcon, PhotoIcon, ExclamationTriangleIcon, DocumentTextIcon } from "@heroicons/react/24/outline"
import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import debounce from "lodash/debounce"

interface PressImage {
    id: number
    title: string  // Note: This matches the schema typo
    fileId: string
    url: string
    height: number | null
    width: number | null
    uploaded_at: string
}

interface SearchResult extends PressImage {
    displayTitle: string
}

export default function DeleteNewsForm() {
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const [selectedImage, setSelectedImage] = useState<PressImage | null>(null)
    const [isSearching, setIsSearching] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState<string>("")
    const [successMessage, setSuccessMessage] = useState<string>("")
    const [showConfirm, setShowConfirm] = useState(false)
    const [allImages, setAllImages] = useState<PressImage[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Fetch all images on component mount
    useEffect(() => {
        fetchAllImages()
    }, [])

    const fetchAllImages = async () => {
        setIsLoading(true)
        setError("")
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/news/media`,
                {
                    withCredentials: true
                }
            )

            if (response.data && response.data.images && Array.isArray(response.data.images)) {
                const images = response.data.images
                setAllImages(images)
                // Set initial search results to show all images
                const searchResults = images.map((image: PressImage) => ({
                    ...image,
                    displayTitle: image.title.length > 50 
                        ? image.title.substring(0, 50) + "..." 
                        : image.title
                }))
                setSearchResults(searchResults)
            } else {
                setAllImages([])
                setSearchResults([])
            }
        } catch (err: any) {
            console.error("Fetch images error:", err)
            setError(err.response?.data?.message || "Failed to fetch press images")
        } finally {
            setIsLoading(false)
        }
    }

    const debouncedSearch = useCallback(
        debounce((query: string, images: PressImage[]) => {
            if (!query.trim()) {
                const allResults = images.map((image: PressImage) => ({
                    ...image,
                    displayTitle: image.title.length > 50 
                        ? image.title.substring(0, 50) + "..." 
                        : image.title
                }))
                setSearchResults(allResults)
                return
            }

            setIsSearching(true)
            setError("")

            try {
                const filteredImages = images.filter(image => 
                    image.title.toLowerCase().includes(query.toLowerCase()) ||
                    image.fileId.toLowerCase().includes(query.toLowerCase())
                )

                const results = filteredImages.map((image: PressImage) => ({
                    ...image,
                    displayTitle: image.title.length > 50 
                        ? image.title.substring(0, 50) + "..." 
                        : image.title
                }))
                setSearchResults(results)
            } catch (err: any) {
                console.error("Search error:", err)
                setError("Failed to search images")
                setSearchResults([])
            } finally {
                setIsSearching(false)
            }
        }, 300),
        []
    )

    useEffect(() => {
        debouncedSearch(searchQuery, allImages)

        return () => {
            debouncedSearch.cancel()
        }
    }, [searchQuery, allImages, debouncedSearch])

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
        setError("")
        setSuccessMessage("")
    }

    const handleSelectImage = (image: PressImage) => {
        setSelectedImage(image)
        setError("")
        setSuccessMessage("")
    }

    const handleClearSelection = () => {
        setSelectedImage(null)
        setSearchQuery("")
        setSearchResults(allImages.map(img => ({
            ...img,
            displayTitle: img.title.length > 50 
                ? img.title.substring(0, 50) + "..." 
                : img.title
        })))
        setError("")
        setSuccessMessage("")
        setShowConfirm(false)
    }

    const handleDeleteImage = async () => {
        if (!selectedImage) return

        setIsDeleting(true)
        setError("")
        setSuccessMessage("")

        try {
            const payload = {
                fileIds: [selectedImage.fileId]
            }

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/news/deleteMedia`,
                payload,
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                }
            )

            if (response.status === 200) {
                setSuccessMessage(`Press image "${selectedImage.title}" deleted successfully!`)
                // Remove deleted image from all images
                const updatedImages = allImages.filter(img => img.id !== selectedImage.id)
                setAllImages(updatedImages)
                // Update search results
                const updatedSearchResults = searchResults.filter(img => img.id !== selectedImage.id)
                setSearchResults(updatedSearchResults)
                // Clear selection
                handleClearSelection()
            }
        } catch (err: any) {
            console.error("Delete error:", err)
            
            let errorMessage = "Failed to delete press image"
            
            if (err.response) {
                if (err.response.status === 400 && err.response.data.errors) {
                    const errors = err.response.data.errors
                    const errorMessages: string[] = []
                    
                    if (errors.fileIds && errors.fileIds._errors) {
                        errorMessages.push(`File IDs: ${errors.fileIds._errors.join(', ')}`)
                    }
                    
                    if (errorMessages.length > 0) {
                        errorMessage = `Validation failed: ${errorMessages.join('; ')}`
                    } else {
                        errorMessage = err.response.data?.message || `Server error (${err.response.status})`
                    }
                } else {
                    errorMessage = err.response.data?.message || `Server error (${err.response.status})`
                }
            } else if (err.request) {
                errorMessage = "No response from server. Please check your connection."
            } else if (err.message) {
                errorMessage = err.message
            }
            
            setError(errorMessage)
        } finally {
            setIsDeleting(false)
            setShowConfirm(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatFileSize = (height: number | null, width: number | null) => {
        if (height && width) {
            const megapixels = (height * width) / 1000000
            return `${megapixels.toFixed(1)} MP`
        }
        return "Unknown"
    }

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Delete Press Images</h1>
                    <p className="text-gray-600 mt-2">Manage and delete press images</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-6 md:p-8">
                        <div className="flex justify-center items-center h-64">
                            <div className="text-center">
                                <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading press images...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Delete Press Images</h1>
                <p className="text-gray-600 mt-2">Manage and delete press images</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6 md:p-8">
                    <div className="space-y-8">
                        {/* Stats Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                        <PhotoIcon className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-blue-700">Total Images</p>
                                        <p className="text-2xl font-bold text-blue-900">{allImages.length}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                                        <DocumentTextIcon className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-700">Showing</p>
                                        <p className="text-2xl font-bold text-gray-900">{searchResults.length}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                                        <TrashIcon className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-red-700">Ready to Delete</p>
                                        <p className="text-2xl font-bold text-red-900">{selectedImage ? 1 : 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search Section */}
                        <div>
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-linear-to-r from-blue-100 to-blue-50 rounded-lg flex items-center justify-center mr-3">
                                    <MagnifyingGlassIcon className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <label htmlFor="search" className="block text-lg font-semibold text-gray-900">
                                        Search Press Images
                                    </label>
                                    <p className="text-sm text-gray-500">Search by title or file ID</p>
                                </div>
                            </div>
                            <div className="relative">
                                <input
                                    id="search"
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    placeholder="Type title or file ID to search..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 placeholder:text-gray-400"
                                    disabled={isDeleting}
                                />
                                {isSearching && (
                                    <div className="absolute right-3 top-3">
                                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-sm text-gray-500">
                                    Found {searchResults.length} image{searchResults.length !== 1 ? 's' : ''}
                                </p>
                                <button
                                    onClick={fetchAllImages}
                                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                                    disabled={isDeleting}
                                >
                                    Refresh List
                                </button>
                            </div>
                        </div>

                        {/* Images Grid */}
                        {searchResults.length > 0 && !selectedImage && (
                            <div className="mt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-medium text-gray-900">
                                        Press Images
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        Click on an image to select
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {searchResults.map((image) => (
                                        <div
                                            key={image.id}
                                            onClick={() => handleSelectImage(image)}
                                            className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 hover:shadow-md cursor-pointer transition-all group"
                                        >
                                            <div className="aspect-square bg-gray-100 relative">
                                                <img
                                                    src={image.url}
                                                    alt={image.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                    onError={(e) => {
                                                        e.currentTarget.src = `https://via.placeholder.com/150?text=Image+Error`
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200"></div>
                                            </div>
                                            <div className="p-3 bg-white">
                                                <h5 className="font-medium text-gray-900 text-sm truncate" title={image.title}>
                                                    {image.displayTitle}
                                                </h5>
                                                <div className="flex justify-between items-center mt-2">
                                                    <p className="text-xs text-gray-500">
                                                        {formatDate(image.uploaded_at)}
                                                    </p>
                                                    <div className="flex items-center gap-1">
                                                        <DocumentTextIcon className="w-3 h-3 text-gray-400" />
                                                        <span className="text-xs text-gray-500">
                                                            {formatFileSize(image.height, image.width)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Selected Image Details */}
                        {selectedImage && (
                            <div className="mt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-medium text-gray-900">
                                        Selected Press Image
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={handleClearSelection}
                                        className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center gap-1"
                                        disabled={isDeleting}
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                        Clear Selection
                                    </button>
                                </div>

                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="p-6 bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    {selectedImage.title}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full">
                                                        Uploaded: {formatDate(selectedImage.uploaded_at)}
                                                    </span>
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                                                        ID: {selectedImage.id}
                                                    </span>
                                                    {selectedImage.height && selectedImage.width && (
                                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                                                            {selectedImage.width} × {selectedImage.height} px
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">
                                                    File ID: {selectedImage.fileId.substring(0, 8)}...
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Full ID on hover
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex flex-col lg:flex-row gap-6">
                                            <div className="lg:w-1/3">
                                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                                    <img
                                                        src={selectedImage.url}
                                                        alt={selectedImage.title}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.src = `https://via.placeholder.com/400?text=Image+Error`
                                                        }}
                                                    />
                                                </div>
                                                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                                    <div className="bg-gray-50 p-2 rounded">
                                                        <p className="text-gray-500">Width</p>
                                                        <p className="font-medium">{selectedImage.width || "Unknown"} px</p>
                                                    </div>
                                                    <div className="bg-gray-50 p-2 rounded">
                                                        <p className="text-gray-500">Height</p>
                                                        <p className="font-medium">{selectedImage.height || "Unknown"} px</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="lg:w-2/3">
                                                <div className="space-y-4">
                                                    <div>
                                                        <h5 className="font-medium text-gray-900 mb-2">Image Details</h5>
                                                        <div className="bg-gray-50 p-4 rounded-lg">
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Title:</span>
                                                                    <span className="font-medium">{selectedImage.title}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">File ID:</span>
                                                                    <span className="font-medium font-mono text-sm" title={selectedImage.fileId}>
                                                                        {selectedImage.fileId.length > 20 
                                                                            ? selectedImage.fileId.substring(0, 20) + "..." 
                                                                            : selectedImage.fileId}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Database ID:</span>
                                                                    <span className="font-medium">#{selectedImage.id}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Upload Date:</span>
                                                                    <span className="font-medium">{formatDate(selectedImage.uploaded_at)}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">URL:</span>
                                                                    <a 
                                                                        href={selectedImage.url} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer"
                                                                        className="text-blue-600 hover:text-blue-800 text-sm truncate ml-2"
                                                                        title={selectedImage.url}
                                                                    >
                                                                        Open Image
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Confirmation Dialog */}
                                                    {showConfirm ? (
                                                        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                                                            <div className="flex items-center mb-4">
                                                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                                                                    <TrashIcon className="w-5 h-5 text-red-600" />
                                                                </div>
                                                                <div>
                                                                    <h5 className="font-semibold text-gray-900">Confirm Deletion</h5>
                                                                    <p className="text-sm text-gray-600">
                                                                        Are you sure you want to delete this press image?
                                                                    </p>
                                                                    <p className="text-xs text-red-600 mt-1">
                                                                        Note: This will delete the image from both ImageKit storage and database.
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col sm:flex-row gap-3">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowConfirm(false)}
                                                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    disabled={isDeleting}
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={handleDeleteImage}
                                                                    disabled={isDeleting}
                                                                    className="flex-1 px-6 py-3 bg-linear-to-r from-red-600 to-red-700 text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                                                                >
                                                                    {isDeleting ? (
                                                                        <div className="flex items-center justify-center">
                                                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                            </svg>
                                                                            Deleting...
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                            <TrashIcon className="w-5 h-5 mr-2" />
                                                                            Yes, Delete Image
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 border border-gray-200 bg-gray-50 rounded-lg">
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowConfirm(true)}
                                                                disabled={isDeleting}
                                                                className="w-full px-6 py-3 bg-linear-to-r from-red-600 to-red-700 text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                                                            >
                                                                <TrashIcon className="w-5 h-5 mr-2" />
                                                                Delete This Press Image
                                                            </button>
                                                            <p className="text-sm text-gray-500 text-center mt-3">
                                                                Clicking this button will permanently delete the image from both cloud storage and database.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* No Results Message */}
                        {searchQuery && !isSearching && searchResults.length === 0 && !selectedImage && (
                            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                <p className="text-center text-gray-700">
                                    No press images found matching "<span className="font-semibold">{searchQuery}</span>"
                                </p>
                                <p className="text-center text-sm text-gray-500 mt-1">
                                    Try a different search term or clear the search to see all images
                                </p>
                                <div className="flex justify-center mt-3">
                                    <button
                                        onClick={handleClearSelection}
                                        className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                                    >
                                        Clear Search
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* No Images Message */}
                        {allImages.length === 0 && !isLoading && (
                            <div className="mt-6 p-8 text-center border border-gray-200 rounded-lg">
                                <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-700 font-medium">No press images found</p>
                                <p className="text-gray-600 text-sm mt-1">Upload some press images first to see them here</p>
                            </div>
                        )}

                        {/* Error Display */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-red-700 font-medium">Error</p>
                                </div>
                                <p className="text-red-700 text-sm mt-1 wrap-break-words">{error}</p>
                                <button
                                    type="button"
                                    onClick={() => setError("")}
                                    className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                                >
                                    Dismiss
                                </button>
                            </div>
                        )}

                        {/* Success Message */}
                        {successMessage && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-green-700 font-medium">Success!</p>
                                </div>
                                <p className="text-green-700 text-sm mt-1">{successMessage}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Information Panel */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start">
                    <ExclamationTriangleIcon className="w-6 h-6 text-blue-600 mr-3 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-blue-900 mb-2">About Press Image Management</h3>
                        <ul className="space-y-2 text-blue-700 text-sm">
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                <span><strong>Press Images</strong> are displayed in the media/press section of your website</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                <span>Deleting an image removes it from both <strong>ImageKit storage</strong> and <strong>database</strong></span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                <span>Each image has a <strong>unique title</strong> (required by database schema)</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                <span>You can search images by <strong>title</strong> or <strong>file ID</strong></span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                <span>Deleted images cannot be recovered. Make sure you have backups if needed.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}