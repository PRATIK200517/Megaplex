// components/AddFolderForm.tsx
'use client';

import { useState, useRef } from 'react';
import {
  PhotoIcon,
  CalendarIcon,
  FolderIcon,
  TagIcon,
  XMarkIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline';
import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";
import axios from 'axios';

export default function AddFolderForm() {
  const [formData, setFormData] = useState({
    folderName: '',
    caption: '',
    eventDay: new Date().toISOString().split('T')[0],
  });

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  
  const abortControllerRef = useRef<AbortController | null>(null);


const authenticator = async () => {
  try {
    const response = await axios.get(
      `/api/main/upload-auth`,
      {
        withCredentials: true, 
      }
    );

    const data = response.data;

    if (data.error) {
      throw new Error(data.error);
    }

    return {
      signature: data.signature,
      expire: data.expire,
      token: data.token,
      publicKey: data.publicKey,
      urlEndpoint: data.urlEndpoint
    };
  } catch (error: any) {
    console.error('Authentication error:', error);
    
    // Extract the message from axios error if available
    const errorMessage = error.response?.data?.message || 'Failed to authenticate for upload';
    setUploadError(errorMessage);
    
    throw error;
  }
};

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (uploadError) setUploadError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {

      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size must be less than 5MB');
        return;
      }

      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setUploadError('Please upload a valid image file (JPEG, PNG, GIF, WebP)');
        return;
      }

      setThumbnail(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setUploadError('');
      setUploadedImageUrl('');
      setUploadProgress(0);
    }
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    setUploadedImageUrl('');
    setUploadProgress(0);
    setUploadError('');
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

const uploadToImageKit = async (file: File): Promise<any> => {
  abortControllerRef.current = new AbortController();
  
  const authParams = await authenticator();
  const { signature, expire, token, publicKey } = authParams;

  try {
    const uploadResponse = await upload({
      expire,
      token,
      signature,
      publicKey,
      file,
      fileName: `${Date.now()}-${file.name.replace(/\s+/g, '-').toLowerCase()}`,
      onProgress: (event) => {
        const progress = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(progress);
      },
      abortSignal: abortControllerRef.current.signal,
    });

    console.log('ImageKit upload response:', uploadResponse);
    
    return uploadResponse; 
    
  } catch (error) {
      if (error instanceof ImageKitAbortError) {
        console.log('Upload was cancelled');
        throw new Error('Upload cancelled');
      } else if (error instanceof ImageKitInvalidRequestError) {
        console.error('Invalid request:', error.message);
        throw new Error('Invalid upload request');
      } else if (error instanceof ImageKitUploadNetworkError) {
        console.error('Network error:', error.message);
        throw new Error('Network error during upload');
      } else if (error instanceof ImageKitServerError) {
        console.error('ImageKit server error:', error.message);
        throw new Error('Upload server error');
      } else {
        console.error('Upload error:', error);
        throw new Error('Failed to upload image');
      }
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  setUploadError('');
  setUploadProgress(0);

  try {
    if (!formData.folderName.trim()) throw new Error('Folder name is required');
    if (!thumbnail) throw new Error('Please select a thumbnail image');

    const ikResult = await uploadToImageKit(thumbnail);

    const payload = {
      title: formData.folderName,
      caption: formData.caption || "No caption provided",
      event_date: formData.eventDay, 
      thumbnail_image: {
        fileId: ikResult.fileId,
        url: ikResult.url,
        height: ikResult.height,
        width: ikResult.width
      }
    };

    const backendResponse = await axios.post(
      `/api/main/gallery/addFolder`,
      payload,
      {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    console.log('Backend response:', backendResponse.data);
    alert('Folder created successfully!');

    // 5. Reset Form
    setFormData({
      folderName: '',
      caption: '',
      eventDay: new Date().toISOString().split('T')[0],
    });
    removeThumbnail();

  } catch (error: any) {
    console.error('Submit Error:', error);
    const msg = error.response?.data?.message || error.message || 'An error occurred';
    setUploadError(msg);
  } finally {
    setIsSubmitting(false);
    abortControllerRef.current = null;
  }
};

  const handleCancel = () => {
    setFormData({
      folderName: '',
      caption: '',
      eventDay: new Date().toISOString().split('T')[0],
    });
    removeThumbnail();
    setUploadError('');
  };

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setUploadProgress(0);
      setUploadError('Upload cancelled');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Folder</h1>
        <p className="text-gray-600 mt-2">Create a new folder with metadata and thumbnail</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Folder Name Field */}
            <div>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-linear-to-r from-blue-100 to-blue-50 rounded-lg flex items-center justify-center mr-3">
                  <FolderIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <label htmlFor="folderName" className="block text-lg font-semibold text-gray-900">
                    Folder Name
                  </label>
                  <p className="text-sm text-gray-500">Enter a descriptive name for the folder</p>
                </div>
              </div>
              <input
                id="folderName"
                name="folderName"
                type="text"
                value={formData.folderName}
                onChange={handleInputChange}
                placeholder="Enter name for the Folder here"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 placeholder:text-gray-400"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Caption Field */}
            <div>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-linear-to-r from-purple-100 to-purple-50 rounded-lg flex items-center justify-center mr-3">
                  <TagIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <label htmlFor="caption" className="block text-lg font-semibold text-gray-900">
                    Caption
                  </label>
                  <p className="text-sm text-gray-500">Add a short description or caption</p>
                </div>
              </div>
              <textarea
                id="caption"
                name="caption"
                value={formData.caption}
                onChange={handleInputChange}
                placeholder="Enter name for the Caption here"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 placeholder:text-gray-400 resize-none"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Event Day Field */}
            <div>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-linear-to-r from-green-100 to-green-50 rounded-lg flex items-center justify-center mr-3">
                  <CalendarIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <label htmlFor="eventDay" className="block text-lg font-semibold text-gray-900">
                    Event Day
                  </label>
                  <p className="text-sm text-gray-500">Select the event date</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="eventDay"
                  name="eventDay"
                  type="date"
                  value={formData.eventDay}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Selected: {new Date(formData.eventDay).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* Thumbnail Upload */}
            <div>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-linear-to-r from-orange-100 to-orange-50 rounded-lg flex items-center justify-center mr-3">
                  <PhotoIcon className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <label htmlFor="thumbnail" className="block text-lg font-semibold text-gray-900">
                    Thumbnail
                  </label>
                  <p className="text-sm text-gray-500">Upload a thumbnail image for the folder</p>
                </div>
              </div>

              {/* File Upload Area */}
              {!previewUrl ? (
                <div className="mt-2">
                  <label
                    htmlFor="thumbnail-upload"
                    className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      uploadError 
                        ? 'border-red-300 bg-red-50 hover:bg-red-100' 
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <CloudArrowUpIcon className={`w-12 h-12 mb-4 ${uploadError ? 'text-red-400' : 'text-gray-400'}`} />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP up to 5MB</p>
                    </div>
                    <input
                      id="thumbnail-upload"
                      name="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                  </label>
                </div>
              ) : (
                <div className="relative mt-2">
                  <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200 relative">
                    <img
                      src={previewUrl}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Upload Progress */}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
                        <div className="w-64 bg-gray-200 rounded-full h-2.5 mb-4">
                          <div 
                            className="bg-linear-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-white font-medium">{uploadProgress}%</p>
                        <button
                          type="button"
                          onClick={cancelUpload}
                          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                          Cancel Upload
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={removeThumbnail}
                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    aria-label="Remove thumbnail"
                    disabled={isSubmitting}
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Upload Error Display */}
              {uploadError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {uploadError}
                  </p>
                </div>
              )}

              {/* Upload Success */}
              {uploadedImageUrl && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Thumbnail uploaded successfully!
                  </p>
                  <a 
                    href={uploadedImageUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm mt-1 block truncate"
                  >
                    {uploadedImageUrl}
                  </a>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !thumbnail}
                className="flex-1 px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {uploadProgress > 0 && uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Creating...'}
                  </div>
                ) : (
                  'Create Folder'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        <div className="bg-linear-to-r from-gray-50 to-gray-100 border-t border-gray-200 p-6 md:p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-medium text-gray-900 mb-2">Folder Details</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex">
                  <dt className="text-gray-500 w-32">Folder Name:</dt>
                  <dd className="text-gray-900 font-medium">
                    {formData.folderName || <span className="text-gray-400 italic">Not set</span>}
                  </dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-32">Caption:</dt>
                  <dd className="text-gray-900 font-medium">
                    {formData.caption || <span className="text-gray-400 italic">Not set</span>}
                  </dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-32">Event Day:</dt>
                  <dd className="text-gray-900 font-medium">
                    {formData.eventDay ? new Date(formData.eventDay).toLocaleDateString() : 'Not set'}
                  </dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-32">Upload Status:</dt>
                  <dd className="text-gray-900 font-medium">
                    {uploadedImageUrl ? (
                      <span className="text-green-600">✓ Uploaded</span>
                    ) : uploadProgress > 0 ? (
                      <span className="text-blue-600">Uploading ({uploadProgress}%)</span>
                    ) : (
                      <span className="text-gray-400">Not uploaded</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-medium text-gray-900 mb-2">Thumbnail</h4>
              <div className="flex items-center justify-center h-32 bg-gray-50 rounded border border-dashed border-gray-300">
                {previewUrl ? (
                  <div className="relative w-full h-full">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <PhotoIcon className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No thumbnail selected</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex">
          <div className="shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Tips for creating folders</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Images are uploaded to ImageKit.io for fast, optimized delivery</li>
                <li>Supported formats: JPG, PNG, GIF, WebP (max 5MB)</li>
                <li>Upload progress is shown and can be cancelled if needed</li>
                <li>Once uploaded, the image URL is automatically saved with your folder</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}