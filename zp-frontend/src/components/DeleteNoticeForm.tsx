"use client"
import { TrashIcon, CalendarIcon, ClockIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import { useState, useEffect } from "react"
import axios from "axios"

interface Notice {
    id: number
    title: string
    description: string
    expiry: string
    createdAt: string
}

export default function DeleteNoticeForm() {
    const [notices, setNotices] = useState<Notice[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDeleting, setIsDeleting] = useState<number | null>(null)
    const [error, setError] = useState<string>("")
    const [successMessage, setSuccessMessage] = useState<string>("")
    const [showConfirm, setShowConfirm] = useState<number | null>(null)

    // Fetch notices on component mount
    useEffect(() => {
        fetchNotices()
    }, [])

    const fetchNotices = async () => {
        setIsLoading(true)
        setError("")
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/notices/getNotices`,
                {
                    withCredentials: true
                }
            )

            if (response.data && response.data.notices && Array.isArray(response.data.notices)) {
                // Sort by expiry date (closest first)
                const sortedNotices = response.data.notices.sort((a: Notice, b: Notice) => {
                    return new Date(a.expiry).getTime() - new Date(b.expiry).getTime()
                })
                setNotices(sortedNotices)
            } else {
                setNotices([])
            }
        } catch (err: any) {
            console.error("Fetch notices error:", err)
            setError(err.response?.data?.message || "Failed to fetch notices")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteNotice = async (noticeId: number) => {
        setIsDeleting(noticeId)
        setError("")
        setSuccessMessage("")

        try {
            // Delete notice - adjust endpoint based on your backend
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/notices/deleteNotice/${noticeId}`,
                {},
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                }
            )

            if (response.status === 200) {
                setSuccessMessage("Notice deleted successfully!")
                // Remove deleted notice from the list
                setNotices(prev => prev.filter(notice => notice.id !== noticeId))
            }
        } catch (err: any) {
            console.error("Delete notice error:", err)
            
            let errorMessage = "Failed to delete notice"
            
            if (err.response) {
                errorMessage = err.response.data?.message || `Server error (${err.response.status})`
            } else if (err.request) {
                errorMessage = "No response from server. Please check your connection."
            } else if (err.message) {
                errorMessage = err.message
            }
            
            setError(errorMessage)
        } finally {
            setIsDeleting(null)
            setShowConfirm(null)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getTimeRemaining = (expiryDate: string) => {
        const now = new Date()
        const expiry = new Date(expiryDate)
        const diffMs = expiry.getTime() - now.getTime()
        
        if (diffMs <= 0) {
            return { text: "Expired", color: "text-red-600", bgColor: "bg-red-100" }
        }
        
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffHours / 24)
        
        if (diffDays > 0) {
            return { 
                text: `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`, 
                color: "text-green-600", 
                bgColor: "bg-green-100" 
            }
        } else if (diffHours > 0) {
            return { 
                text: `${diffHours} hour${diffHours !== 1 ? 's' : ''} remaining`, 
                color: "text-yellow-600", 
                bgColor: "bg-yellow-100" 
            }
        } else {
            const diffMinutes = Math.floor(diffMs / (1000 * 60))
            return { 
                text: `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} remaining`, 
                color: "text-orange-600", 
                bgColor: "bg-orange-100" 
            }
        }
    }

    const isExpired = (expiryDate: string) => {
        return new Date(expiryDate) <= new Date()
    }

    const activeNotices = notices.filter(notice => !isExpired(notice.expiry))
    const expiredNotices = notices.filter(notice => isExpired(notice.expiry))

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Manage Notices</h1>
                    <p className="text-gray-600 mt-2">Delete notices before they expire</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-6 md:p-8">
                        <div className="flex justify-center items-center h-64">
                            <div className="text-center">
                                <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading notices...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Manage Notices</h1>
                <p className="text-gray-600 mt-2">Delete notices before they expire</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6 md:p-8">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                    <ClockIcon className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-blue-700">Active Notices</p>
                                    <p className="text-2xl font-bold text-blue-900">{activeNotices.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                                    <CalendarIcon className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-700">Total Notices</p>
                                    <p className="text-2xl font-bold text-gray-900">{notices.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-red-700">Expired Notices</p>
                                    <p className="text-2xl font-bold text-red-900">{expiredNotices.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active Notices Section */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Active Notices</h2>
                                <p className="text-sm text-gray-600 mt-1">Currently visible to users</p>
                            </div>
                            <button
                                onClick={fetchNotices}
                                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                                disabled={isLoading}
                            >
                                Refresh List
                            </button>
                        </div>

                        {activeNotices.length === 0 ? (
                            <div className="p-8 text-center border border-gray-200 rounded-lg">
                                <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-700 font-medium">No active notices</p>
                                <p className="text-gray-600 text-sm mt-1">All notices have expired or no notices have been created</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {activeNotices.map((notice) => {
                                    const timeRemaining = getTimeRemaining(notice.expiry)
                                    return (
                                        <div key={notice.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                            <div className="p-6 bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-bold text-gray-900">
                                                            {notice.title}
                                                        </h3>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <span className={`px-3 py-1 ${timeRemaining.bgColor} ${timeRemaining.color} text-sm rounded-full font-medium`}>
                                                                {timeRemaining.text}
                                                            </span>
                                                            <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full">
                                                                Expires: {formatDateTime(notice.expiry)}
                                                            </span>
                                                            <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full">
                                                                Created: {formatDate(notice.createdAt)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        {showConfirm === notice.id ? (
                                                            <div className="flex flex-col gap-2">
                                                                <p className="text-xs text-red-600 font-medium mb-2">Are you sure?</p>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => handleDeleteNotice(notice.id)}
                                                                        disabled={isDeleting === notice.id}
                                                                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors flex items-center"
                                                                    >
                                                                        {isDeleting === notice.id ? (
                                                                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                                                                        ) : (
                                                                            <TrashIcon className="w-3 h-3 mr-1" />
                                                                        )}
                                                                        Yes
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setShowConfirm(null)}
                                                                        className="px-3 py-1 border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50 transition-colors"
                                                                        disabled={isDeleting === notice.id}
                                                                    >
                                                                        No
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setShowConfirm(notice.id)}
                                                                disabled={isDeleting === notice.id}
                                                                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center"
                                                            >
                                                                <TrashIcon className="w-4 h-4 mr-1" />
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <div className="mb-4">
                                                    <h5 className="font-medium text-gray-900 mb-2">Description</h5>
                                                    <p className="text-gray-700 whitespace-pre-line">{notice.description}</p>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    <p>Notice ID: {notice.id}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Expired Notices Section */}
                    {expiredNotices.length > 0 && (
                        <div className="mt-10 pt-10 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Expired Notices</h2>
                                    <p className="text-sm text-gray-600 mt-1">No longer visible to users</p>
                                </div>
                                <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full font-medium">
                                    Auto-Expired
                                </span>
                            </div>

                            <div className="space-y-4">
                                {expiredNotices.map((notice) => (
                                    <div key={notice.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 opacity-75">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-medium text-gray-900 line-through">{notice.title}</h4>
                                                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                                                        Expired
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <span>Expired: {formatDateTime(notice.expiry)}</span>
                                                    <span>Created: {formatDate(notice.createdAt)}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteNotice(notice.id)}
                                                disabled={isDeleting === notice.id}
                                                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors flex items-center"
                                            >
                                                {isDeleting === notice.id ? (
                                                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                                                ) : (
                                                    <TrashIcon className="w-3 h-3 mr-1" />
                                                )}
                                                Clean Up
                                            </button>
                                        </div>
                                        <div className="mt-3">
                                            <p className="text-sm text-gray-600 line-clamp-2">{notice.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
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
                        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <p className="text-green-700 font-medium">Success!</p>
                            </div>
                            <p className="text-green-700 text-sm mt-1">{successMessage}</p>
                        </div>
                    )}

                    {/* Information Panel */}
                    <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start">
                            <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 mr-3 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-blue-900 mb-2">About Notice Management</h4>
                                <ul className="space-y-1 text-blue-700 text-sm">
                                    <li className="flex items-start">
                                        <span className="text-blue-500 mr-2">•</span>
                                        <span><strong>Active Notices</strong> are currently visible to users and will automatically expire at the specified time</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-500 mr-2">•</span>
                                        <span><strong>Expired Notices</strong> are no longer visible to users and can be cleaned up</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-500 mr-2">•</span>
                                        <span><strong>Time remaining</strong> is color-coded: Green (days), Yellow (hours), Orange (minutes), Red (expired)</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-500 mr-2">•</span>
                                        <span>Use the <strong>Refresh List</strong> button to update the notice list</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}