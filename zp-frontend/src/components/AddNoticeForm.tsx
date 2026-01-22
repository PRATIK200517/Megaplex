"use client"
import { DocumentTextIcon, CalendarIcon, InformationCircleIcon } from "@heroicons/react/24/outline"
import React, { useState, useRef } from "react"
import axios from "axios"

export default function AddNoticeForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string>('')
    const [successMessage, setSuccessMessage] = useState<string>('')
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        expiry: ''
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        if (error) setError('')
        if (successMessage) setSuccessMessage('')
    }

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Frontend validation
        if (!formData.title.trim()) {
            setError("Title is required")
            return
        }
        if (!formData.description.trim()) {
            setError("Description is required")
            return
        }

        // Validate date if provided
        if (formData.expiry) {
            const selectedDate = new Date(formData.expiry)
            const now = new Date()
            if (selectedDate <= now) {
                setError("Expiry date must be in the future")
                return
            }
        }

        setIsSubmitting(true)
        setError('')
        setSuccessMessage('')

        try {
            // Prepare payload
            const payload: any = {
                title: formData.title.trim(),
                description: formData.description.trim()
            }

            // Add expiry date if provided
            if (formData.expiry) {
                payload.expiry = new Date(formData.expiry).toISOString()
            }

            console.log('Sending payload:', payload)

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/notices/AddNotice`,
                payload,
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 30000
                }
            )

            if (response.status === 201) {
                setSuccessMessage("Notice created successfully!")
                
                // Clear form after successful submission
                setTimeout(() => {
                    setFormData({
                        title: '',
                        description: '',
                        expiry: ''
                    })
                }, 2000)
            } else {
                throw new Error(response.data?.message || `Server responded with status ${response.status}`)
            }

        } catch (err: any) {
            console.error('Notice upload error:', err)
            
            let errorMessage = "An unexpected error occurred"
            
            if (err.response) {
                // Handle validation errors from backend
                if (err.response.status === 400 && err.response.data.errors) {
                    const errors = err.response.data.errors
                    const errorMessages: string[] = []
                    
                    if (errors.title && errors.title._errors) {
                        errorMessages.push(`Title: ${errors.title._errors.join(', ')}`)
                    }
                    if (errors.description && errors.description._errors) {
                        errorMessages.push(`Description: ${errors.description._errors.join(', ')}`)
                    }
                    if (errors.expiry && errors.expiry._errors) {
                        errorMessages.push(`Expiry: ${errors.expiry._errors.join(', ')}`)
                    }
                    
                    if (errorMessages.length > 0) {
                        errorMessage = errorMessages.join('; ')
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
            setIsSubmitting(false)
        }
    }

    const handleClear = () => {
        setFormData({
            title: '',
            description: '',
            expiry: ''
        })
        setError('')
        setSuccessMessage('')
    }

    // Calculate default expiry (tomorrow at current time)
    const getDefaultExpiry = () => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        
        // Format as YYYY-MM-DDTHH:mm for datetime-local input
        const year = tomorrow.getFullYear()
        const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
        const day = String(tomorrow.getDate()).padStart(2, '0')
        const hours = String(tomorrow.getHours()).padStart(2, '0')
        const minutes = String(tomorrow.getMinutes()).padStart(2, '0')
        
        return `${year}-${month}-${day}T${hours}:${minutes}`
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Add Notice</h1>
                <p className="text-gray-600 mt-2">Create and publish important notices</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6 md:p-8">
                    <form className="space-y-8" onSubmit={handleSubmit}>
                        {/* Title Field */}
                        <div>
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-linear-to-r from-blue-100 to-blue-50 rounded-lg flex items-center justify-center mr-3">
                                    <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <label htmlFor="title" className="block text-lg font-semibold text-gray-900">
                                        Title *
                                    </label>
                                    <p className="text-sm text-gray-500">Enter the notice title</p>
                                </div>
                            </div>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g., System Maintenance, Important Announcement"
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 placeholder:text-gray-400 ${
                                    error && error.includes("Title") ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                                disabled={isSubmitting}
                                maxLength={200}
                            />
                            <div className="flex justify-between mt-1">
                                <p className="text-sm text-gray-500">
                                    {formData.title.length}/200 characters
                                </p>
                                {formData.title.length >= 1 && (
                                    <span className="text-sm text-green-600">✓</span>
                                )}
                            </div>
                        </div>

                        {/* Description Field */}
                        <div>
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-linear-to-r from-purple-100 to-purple-50 rounded-lg flex items-center justify-center mr-3">
                                    <InformationCircleIcon className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <label htmlFor="description" className="block text-lg font-semibold text-gray-900">
                                        Description *
                                    </label>
                                    <p className="text-sm text-gray-500">Enter the notice details</p>
                                </div>
                            </div>
                            <textarea
                                id="description"
                                name="description"
                                rows={5}
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Enter the full description of the notice..."
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 placeholder:text-gray-400 ${
                                    error && error.includes("Description") ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                                disabled={isSubmitting}
                                maxLength={1000}
                            />
                            <div className="flex justify-between mt-1">
                                <p className="text-sm text-gray-500">
                                    {formData.description.length}/1000 characters
                                </p>
                                {formData.description.length >= 1 && (
                                    <span className="text-sm text-green-600">✓</span>
                                )}
                            </div>
                        </div>

                        {/* Expiry Date Field */}
                        <div>
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-linear-to-r from-green-100 to-green-50 rounded-lg flex items-center justify-center mr-3">
                                    <CalendarIcon className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <label htmlFor="expiry" className="block text-lg font-semibold text-gray-900">
                                        Expiry Date & Time
                                    </label>
                                    <p className="text-sm text-gray-500">Set when this notice should expire (optional)</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Default: 24 hours from creation if not specified
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex-1">
                                    <input
                                        id="expiry"
                                        name="expiry"
                                        type="datetime-local"
                                        value={formData.expiry}
                                        onChange={handleDateChange}
                                        min={new Date().toISOString().slice(0, 16)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                                            error && error.includes("Expiry") ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        disabled={isSubmitting}
                                    />
                                    {error && error.includes("Expiry") && (
                                        <p className="mt-1 text-sm text-red-600">{error}</p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData(prev => ({
                                            ...prev,
                                            expiry: getDefaultExpiry()
                                        }))
                                    }}
                                    className="px-4 py-3 text-sm text-blue-600 hover:text-blue-800 font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
                                    disabled={isSubmitting}
                                >
                                    Set Tomorrow
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData(prev => ({
                                            ...prev,
                                            expiry: ''
                                        }))
                                    }}
                                    className="px-4 py-3 text-sm text-gray-600 hover:text-gray-800 font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                                    disabled={isSubmitting}
                                >
                                    Clear Date
                                </button>
                            </div>
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                <p className="text-sm text-blue-700">
                                    <span className="font-medium">Note:</span> Notices automatically expire after the specified date/time.
                                    {formData.expiry && (
                                        <span className="block mt-1">
                                            Selected expiry: {new Date(formData.expiry).toLocaleString()}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && !error.includes("Title") && !error.includes("Description") && !error.includes("Expiry") && (
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
                                    onClick={() => setError('')}
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

                        {/* Form Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleClear}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isSubmitting}
                            >
                                Clear Form
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !formData.title.trim() || !formData.description.trim()}
                                className="flex-1 px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating Notice...
                                    </div>
                                ) : (
                                    'Create Notice'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Information Panel */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start">
                    <InformationCircleIcon className="w-6 h-6 text-blue-600 mr-3 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-blue-900 mb-2">About Notices</h3>
                        <ul className="space-y-2 text-blue-700 text-sm">
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                <span>Notices are displayed to users for important announcements and updates</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                <span>Notices automatically expire and stop being displayed after the expiry date</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                <span>If no expiry date is set, notices expire automatically after 24 hours</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                <span>Keep titles clear and descriptive for easy identification</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                <span>Use the description field for detailed information and instructions</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}