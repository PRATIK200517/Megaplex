"use client"
import { MagnifyingGlassIcon, TrashIcon, XMarkIcon, DocumentTextIcon } from "@heroicons/react/24/outline"
import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import debounce from "lodash/debounce"

interface Thanks {
    id: number
    title: string
    description: string
    content: string
    images: any[]
    isFeatured: boolean
    createdAt: string
}

interface SearchResult extends Thanks {
    displayTitle: string
}

export default function DeleteThanksForm() {
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const [selectedThanks, setSelectedThanks] = useState<Thanks | null>(null)
    const [isSearching, setIsSearching] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState<string>("")
    const [successMessage, setSuccessMessage] = useState<string>("")
    const [showConfirm, setShowConfirm] = useState(false)

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce(async (query: string) => {
            if (!query.trim()) {
                setSearchResults([])
                return
            }

            setIsSearching(true)
            setError("")

            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_SERVER_URL}/thanks/search`,
                    {
                        params: { title: query },
                        withCredentials: true
                    }
                )

                if (response.data && Array.isArray(response.data)) {
                    const results = response.data.map((thanks: Thanks) => ({
                        ...thanks,
                        displayTitle: thanks.title.length > 50 
                            ? thanks.title.substring(0, 50) + "..." 
                            : thanks.title
                    }))
                    setSearchResults(results)
                } else {
                    setSearchResults([])
                }
            } catch (err: any) {
                console.error("Search error:", err)
                setError(err.response?.data?.message || "Failed to search special thanks")
                setSearchResults([])
            } finally {
                setIsSearching(false)
            }
        }, 300),
        []
    )

    useEffect(() => {
        if (searchQuery.trim()) {
            debouncedSearch(searchQuery)
        } else {
            setSearchResults([])
            setSelectedThanks(null)
        }

        return () => {
            debouncedSearch.cancel()
        }
    }, [searchQuery, debouncedSearch])

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
        setError("")
        setSuccessMessage("")
    }

    const handleSelectThanks = (thanks: Thanks) => {
        setSelectedThanks(thanks)
        setError("")
        setSuccessMessage("")
    }

    const handleClearSelection = () => {
        setSelectedThanks(null)
        setSearchQuery("")
        setSearchResults([])
        setError("")
        setSuccessMessage("")
        setShowConfirm(false)
    }

    const handleDeleteThanks = async () => {
        if (!selectedThanks) return

        setIsDeleting(true)
        setError("")
        setSuccessMessage("")

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/thanks/deleteThanks/${selectedThanks.id}`,
                {},
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                }
            )

            if (response.status === 200) {
                setSuccessMessage("Special thanks deleted successfully!")
                // Remove deleted thanks from search results
                setSearchResults(prev => prev.filter(thanks => thanks.id !== selectedThanks.id))
                // Clear selection
                handleClearSelection()
            }
        } catch (err: any) {
            console.error("Delete error:", err)
            setError(err.response?.data?.message || "Failed to delete special thanks")
        } finally {
            setIsDeleting(false)
            setShowConfirm(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Delete Special Thanks</h1>
                <p className="text-gray-600 mt-2">Search and delete special thanks entries</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6 md:p-8">
                    <div className="space-y-8">
                        {/* Search Section */}
                        <div>
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-linear-to-r from-blue-100 to-blue-50 rounded-lg flex items-center justify-center mr-3">
                                    <MagnifyingGlassIcon className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <label htmlFor="search" className="block text-lg font-semibold text-gray-900">
                                        Search Special Thanks
                                    </label>
                                    <p className="text-sm text-gray-500">Search for special thanks by title to delete</p>
                                </div>
                            </div>
                            <div className="relative">
                                <input
                                    id="search"
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    placeholder="Type person/organization name to search..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 placeholder:text-gray-400"
                                    disabled={isDeleting}
                                />
                                {isSearching && (
                                    <div className="absolute right-3 top-3">
                                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && !selectedThanks && (
                            <div className="mt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-medium text-gray-900">
                                        Search Results ({searchResults.length})
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        Click on an entry to select
                                    </p>
                                </div>

                                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                    {searchResults.map((thanks) => (
                                        <div
                                            key={thanks.id}
                                            onClick={() => handleSelectThanks(thanks)}
                                            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition-all group"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h5 className="font-semibold text-gray-900 group-hover:text-blue-600">
                                                            {thanks.displayTitle}
                                                        </h5>
                                                        {thanks.isFeatured && (
                                                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full font-medium">
                                                                Featured
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                                        {thanks.description}
                                                    </p>
                                                    <div className="flex items-center text-xs text-gray-500 gap-4">
                                                        <span>Created: {formatDate(thanks.createdAt)}</span>
                                                        <span>Images: {Array.isArray(thanks.images) ? thanks.images.length : 0}</span>
                                                    </div>
                                                </div>
                                                <div className="ml-4 flex items-center">
                                                    <DocumentTextIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Selected Thanks Details */}
                        {selectedThanks && (
                            <div className="mt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-medium text-gray-900">
                                        Selected Special Thanks
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
                                                    {selectedThanks.title}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full">
                                                        Created: {formatDate(selectedThanks.createdAt)}
                                                    </span>
                                                    {selectedThanks.isFeatured && (
                                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full font-medium">
                                                            Featured Thanks
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">
                                                    Images: {Array.isArray(selectedThanks.images) ? selectedThanks.images.length : 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="mb-6">
                                            <h5 className="font-medium text-gray-900 mb-2">Description</h5>
                                            <p className="text-gray-700">{selectedThanks.description}</p>
                                        </div>

                                        <div>
                                            <h5 className="font-medium text-gray-900 mb-2">Thanks Message Preview</h5>
                                            <div className="text-gray-700 max-h-40 overflow-y-auto pr-2">
                                                {selectedThanks.content.length > 300 
                                                    ? selectedThanks.content.substring(0, 300) + "..."
                                                    : selectedThanks.content
                                                }
                                            </div>
                                            <p className="text-sm text-gray-500 mt-2">
                                                Total characters: {selectedThanks.content.length}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Confirmation Dialog */}
                                    {showConfirm ? (
                                        <div className="p-6 border-t border-gray-200 bg-red-50">
                                            <div className="flex items-center mb-4">
                                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                                                    <TrashIcon className="w-5 h-5 text-red-600" />
                                                </div>
                                                <div>
                                                    <h5 className="font-semibold text-gray-900">Confirm Deletion</h5>
                                                    <p className="text-sm text-gray-600">
                                                        Are you sure you want to delete this special thanks entry? This action cannot be undone.
                                                    </p>
                                                    <p className="text-xs text-red-600 mt-1">
                                                        Note: All associated images will also be removed from storage.
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
                                                    onClick={handleDeleteThanks}
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
                                                            Yes, Delete Special Thanks
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-6 border-t border-gray-200">
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirm(true)}
                                                disabled={isDeleting}
                                                className="w-full px-6 py-3 bg-linear-to-r from-red-600 to-red-700 text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                                            >
                                                <TrashIcon className="w-5 h-5 mr-2" />
                                                Delete This Special Thanks
                                            </button>
                                            <p className="text-sm text-gray-500 text-center mt-3">
                                                Clicking this button will permanently delete the special thanks entry and all associated images from storage.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* No Results Message */}
                        {searchQuery && !isSearching && searchResults.length === 0 && !selectedThanks && (
                            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                <p className="text-center text-gray-700">
                                    No special thanks found matching "<span className="font-semibold">{searchQuery}</span>"
                                </p>
                                <p className="text-center text-sm text-gray-500 mt-1">
                                    Try a different search term
                                </p>
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
                                <p className="text-red-700 text-sm mt-1">{error}</p>
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
        </div>
    )
}