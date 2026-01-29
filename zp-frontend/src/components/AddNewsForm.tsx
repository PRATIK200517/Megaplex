"use client"
import { FolderIcon, PhotoIcon, CloudArrowUpIcon, XMarkIcon, InformationCircleIcon } from "@heroicons/react/24/outline"
import React, { useState, useRef, useCallback, useMemo } from "react"
import axios from "axios";
import {
    ImageKitAbortError,
    ImageKitInvalidRequestError,
    ImageKitServerError,
    ImageKitUploadNetworkError,
    upload,
} from "@imagekit/next";

interface ImageFile {
    id: string;
    file: File;
    previewUrl: string;
    title: string;
    uploadProgress: number;
    uploadedImageUrl?: string;
    uploadedFileId?: string;
    uploadedHeight?: number;
    uploadedWidth?: number;
    error?: string;
    isUploading: boolean;
    isUploaded?: boolean;
    abortController?: AbortController;
}

interface UploadedImage {
    title: string;
    fileId: string;
    url: string;
    height: number;
    width: number;
}

export default function AddNewsForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadError, setUploadError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [images, setImages] = useState<ImageFile[]>([]);
    const [globalTitle, setGlobalTitle] = useState<string>('');

    const authenticator = useCallback(async () => {
        try {
            const response = await axios.get(
                `/api/main/upload-auth`,
                {
                    withCredentials: true,
                    timeout: 10000
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
            const errorMessage = error.response?.data?.message || 'Failed to authenticate for upload';
            setUploadError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGlobalTitle(e.target.value);
        if (uploadError) setUploadError('');
        if (successMessage) setSuccessMessage('');
    };

    const handleImageTitleChange = (id: string, title: string) => {
        setImages(prev => prev.map(img =>
            img.id === id ? { ...img, title } : img
        ));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (files.length > 50) {
            setUploadError("Maximum 50 images allowed at once");
            return;
        }

        let totalSize = 0;
        const newImages: ImageFile[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            if (file.size > 5 * 1024 * 1024) {
                setUploadError(`File ${file.name} exceeds 5MB limit`);
                continue;
            }
            
            totalSize += file.size;

            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                setUploadError(`File ${file.name} is not a valid image type (JPEG, PNG, GIF, WebP)`);
                continue;
            }

            const previewUrl = URL.createObjectURL(file);
            const baseTitle = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, ' ').trim();

            newImages.push({
                id: `${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
                file,
                previewUrl,
                title: globalTitle || baseTitle || `Image ${images.length + i + 1}`,
                uploadProgress: 0,
                isUploading: false,
                isUploaded: false,
            });
        }
        
        if (totalSize > 50 * 1024 * 1024) {
            setUploadError("Total file size must be less than 50MB");
            newImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
            return;
        }

        if (newImages.length === 0) {
            setUploadError("No valid images to upload");
            return;
        }

        setImages(prev => {
            const combined = [...prev, ...newImages];
            if (combined.length > 100) {
                setUploadError("Maximum 100 images allowed total");
                return combined.slice(0, 100);
            }
            return combined;
        });
        setUploadError("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const cancelAllUploads = useCallback(() => {
        setImages(prev => {
            prev.forEach(img => {
                if (img.abortController) {
                    img.abortController.abort();
                }
                if (img.previewUrl) {
                    URL.revokeObjectURL(img.previewUrl);
                }
            });
            return [];
        });
        setUploadError("");
        setGlobalTitle("");
    }, []);

    const removeImage = useCallback((id: string) => {
        setImages(prev => {
            const updated = prev.filter(img => {
                if (img.id === id) {
                    if (img.abortController) {
                        img.abortController.abort();
                    }
                    if (img.previewUrl) {
                        URL.revokeObjectURL(img.previewUrl);
                    }
                    return false;
                }
                return true;
            });
            return updated;
        });
    }, []);

    const uploadToImageKit = useCallback(async (image: ImageFile): Promise<UploadedImage | null> => {
        const abortController = new AbortController();

        setImages(prev => prev.map(img =>
            img.id === image.id
                ? { ...img, abortController, isUploading: true, error: undefined }
                : img
        ));

        try {
            const authParams = await authenticator();
            const { signature, expire, token, publicKey } = authParams;

            const uploadResponse = await upload({
                expire,
                token,
                signature,
                publicKey,
                file: image.file,
                fileName: `${Date.now()}-${image.file.name.replace(/\s+/g, '-').toLowerCase()}`,
                onProgress: (event) => {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    setImages(prev => prev.map(img =>
                        img.id === image.id ? { ...img, uploadProgress: progress } : img
                    ));
                },
                abortSignal: abortController.signal,
            });

            console.log('ImageKit upload response:', uploadResponse);

            if (!uploadResponse.url || !uploadResponse.fileId) {
                console.error('Upload response missing required fields:', uploadResponse);
                throw new Error('Image upload failed: Missing URL or fileId');
            }

            setImages(prev => prev.map(img =>
                img.id === image.id
                    ? {
                        ...img,
                        uploadedImageUrl: uploadResponse.url,
                        uploadedFileId: uploadResponse.fileId,
                        uploadedHeight: uploadResponse.height || 0,
                        uploadedWidth: uploadResponse.width || 0,
                        uploadProgress: 100,
                        isUploading: false,
                        isUploaded: true,
                        abortController: undefined
                    }
                    : img
            ));

            return {
                title: image.title.trim() || `Image ${Date.now()}`,
                fileId: uploadResponse.fileId,
                url: uploadResponse.url,
                height: uploadResponse.height || 0,
                width: uploadResponse.width || 0
            };

        } catch (error: any) {
            console.error('ImageKit upload error:', error);
            
            let errorMessage = 'Failed to upload image';
            
            if (error.name === 'AbortError' || error instanceof ImageKitAbortError) {
                errorMessage = 'Upload was cancelled';
            } else if (error instanceof ImageKitInvalidRequestError) {
                errorMessage = 'Invalid upload request';
            } else if (error instanceof ImageKitUploadNetworkError) {
                errorMessage = 'Network error during upload';
            } else if (error instanceof ImageKitServerError) {
                errorMessage = 'Upload server error';
            } else if (error.message) {
                errorMessage = error.message;
            }

            setImages(prev => prev.map(img =>
                img.id === image.id
                    ? { 
                        ...img, 
                        error: errorMessage, 
                        isUploading: false, 
                        isUploaded: false,
                        uploadProgress: 0,
                        abortController: undefined
                    }
                    : img
            ));

            return null;
        }
    }, [authenticator]);

    const handleAddNews = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (images.length === 0) {
            setUploadError("Please add at least one image");
            return;
        }

        // Check if all images have titles
        const imagesWithoutTitles = images.filter(img => !img.title.trim());
        if (imagesWithoutTitles.length > 0) {
            setUploadError("Please add titles to all images");
            return;
        }

        // Check for duplicate titles
        const titles = images.map(img => img.title.trim().toLowerCase());
        const duplicateTitles = titles.filter((title, index) => titles.indexOf(title) !== index);
        if (duplicateTitles.length > 0) {
            setUploadError("Duplicate titles found. Each image must have a unique title.");
            return;
        }

        setIsSubmitting(true);
        setUploadError("");
        setSuccessMessage("");

        try {
            // Separate images into already uploaded and needs upload
            const alreadyUploadedImages = images.filter(img => img.uploadedImageUrl && img.isUploaded && !img.error);
            const needsUploadImages = images.filter(img => !img.uploadedImageUrl && !img.error && !img.isUploaded);

            console.log('Already uploaded images:', alreadyUploadedImages.length);
            console.log('Images needing upload:', needsUploadImages.length);

            let uploadedResults: UploadedImage[] = [];
            
            // Add already uploaded images to results
            const alreadyUploadedResults: UploadedImage[] = alreadyUploadedImages
                .filter(img => img.uploadedImageUrl && img.uploadedFileId && img.title.trim())
                .map(img => ({
                    title: img.title.trim(),
                    fileId: img.uploadedFileId!,
                    url: img.uploadedImageUrl!,
                    height: img.uploadedHeight || 0,
                    width: img.uploadedWidth || 0
                }));

            uploadedResults = [...alreadyUploadedResults];

            // Upload images that haven't been uploaded yet
            if (needsUploadImages.length > 0) {
                console.log('Uploading', needsUploadImages.length, 'images to ImageKit');
                
                const uploadPromises = needsUploadImages.map(img => uploadToImageKit(img));
                const uploadResults = await Promise.allSettled(uploadPromises);
                
                console.log('Upload results:', uploadResults);
                
                // Process upload results
                const newlyUploadedResults = uploadResults
                    .filter((result): result is PromiseFulfilledResult<UploadedImage> => 
                        result.status === 'fulfilled' && result.value !== null
                    )
                    .map(result => result.value);
                
                console.log('Newly uploaded results:', newlyUploadedResults.length);
                
                uploadedResults = [...uploadedResults, ...newlyUploadedResults];
            }

            console.log('Total uploaded results:', uploadedResults.length);
            console.log('Uploaded results details:', uploadedResults);

            if (uploadedResults.length === 0) {
                // Check for failed uploads
                const failedImages = images.filter(img => img.error);
                const errorMessages = failedImages.map(img => img.error).join(', ');
                
                if (failedImages.length > 0) {
                    throw new Error(`Image uploads failed: ${errorMessages}`);
                } else {
                    throw new Error("No images were successfully uploaded. Please check your image files and try again.");
                }
            }

            // Send to backend
            const payload = {
                imageArray: uploadedResults
            };

            console.log('Sending payload to backend:', JSON.stringify(payload, null, 2));

            const response = await axios.post(
                `/api/main/news/addMedia`,
                payload,
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 30000
                }
            );

            if (response.status === 201) {
                setSuccessMessage("Press images added successfully!");
                
                setTimeout(() => {
                    cancelAllUploads();
                    setGlobalTitle("");
                }, 2000);
            } else {
                throw new Error(response.data?.message || `Server responded with status ${response.status}`);
            }

        } catch (err: any) {
            console.error('Upload error details:', err);
            
            let errorMessage = "An unexpected error occurred";
            
            if (err.response) {
                if (err.response.status === 400 && err.response.data.errors) {
                    const errors = err.response.data.errors;
                    const errorMessages: string[] = [];
                    
                    if (errors.imageArray && errors.imageArray._errors) {
                        errorMessages.push(`Images: ${errors.imageArray._errors.join(', ')}`);
                    }
                    
                    if (errorMessages.length > 0) {
                        errorMessage = `Validation failed: ${errorMessages.join('; ')}`;
                    } else {
                        errorMessage = err.response.data?.message || `Server error (${err.response.status})`;
                    }
                } else {
                    errorMessage = err.response.data?.message || 
                                  `Server error (${err.response.status})`;
                }
            } else if (err.request) {
                errorMessage = "No response from server. Please check your connection.";
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setUploadError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClearAll = () => {
        cancelAllUploads();
        setGlobalTitle("");
        setUploadError("");
        setSuccessMessage("");
    };

    const imageStats = useMemo(() => {
        const uploadedImagesCount = images.filter(img => img.uploadedImageUrl && img.isUploaded && !img.error).length;
        const uploadingImagesCount = images.filter(img => img.isUploading).length;
        const failedImagesCount = images.filter(img => img.error).length;
        const pendingUploadCount = images.filter(img => !img.uploadedImageUrl && !img.isUploading && !img.error && !img.isUploaded).length;
        const totalSizeMB = images.reduce((acc, img) => acc + img.file.size, 0) / (1024 * 1024);
        
        return {
            uploadedImagesCount,
            uploadingImagesCount,
            failedImagesCount,
            pendingUploadCount,
            totalSizeMB: totalSizeMB.toFixed(2)
        };
    }, [images]);

    const ImagePreview = React.memo(({ image, isSubmitting, onRemove, onTitleChange }: {
        image: ImageFile;
        isSubmitting: boolean;
        onRemove: (id: string) => void;
        onTitleChange: (id: string, title: string) => void;
    }) => {
        return (
            <div className={`relative rounded-lg border overflow-hidden group transition-all ${
                image.error
                    ? 'border-red-300'
                    : image.uploadedImageUrl && image.isUploaded
                        ? 'border-green-300'
                        : 'border-gray-200'
            }`}>
                <div className="aspect-square bg-gray-100 relative">
                    <img
                        src={image.previewUrl}
                        alt={image.file.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.currentTarget.src = `https://via.placeholder.com/150?text=Image+Error`;
                        }}
                    />

                    {image.isUploading && image.uploadProgress < 100 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-12 h-12 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <span className="text-white text-xs font-medium">
                                    {image.uploadProgress}%
                                </span>
                            </div>
                        </div>
                    )}

                    {image.error && (
                        <div className="absolute inset-0 bg-red-500 bg-opacity-90 flex items-center justify-center">
                            <div className="text-center p-2">
                                <p className="text-white text-xs font-medium">Error</p>
                                <p className="text-white text-xs truncate">{image.error}</p>
                            </div>
                        </div>
                    )}

                    {image.uploadedImageUrl && image.isUploaded && !image.error && (
                        <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                            <div className="bg-green-500 rounded-full p-1">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => onRemove(image.id)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    aria-label="Remove image"
                    disabled={isSubmitting}
                >
                    <XMarkIcon className="w-3 h-3" />
                </button>

                <div className="absolute top-1 left-1">
                    {image.error ? (
                        <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded">Error</span>
                    ) : image.uploadedImageUrl && image.isUploaded ? (
                        <span className="px-1.5 py-0.5 bg-green-500 text-white text-xs rounded">Done</span>
                    ) : image.isUploading ? (
                        <span className="px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded">
                            {image.uploadProgress}%
                        </span>
                    ) : (
                        <span className="px-1.5 py-0.5 bg-gray-500 text-white text-xs rounded">Pending</span>
                    )}
                </div>

                <div className="p-3 bg-white">
                    <div className="mb-2">
                        <label htmlFor={`title-${image.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                            Image Title *
                        </label>
                        <input
                            id={`title-${image.id}`}
                            type="text"
                            value={image.title}
                            onChange={(e) => onTitleChange(image.id, e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter unique title"
                            disabled={isSubmitting || image.isUploading || image.isUploaded}
                            maxLength={100}
                        />
                        <p className="text-xs text-gray-500 mt-1 text-right">
                            {image.title.length}/100
                        </p>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500 truncate" title={image.file.name}>
                            {image.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                            {(image.file.size / 1024).toFixed(1)} KB
                        </p>
                    </div>
                </div>
            </div>
        );
    });

    ImagePreview.displayName = 'ImagePreview';

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Add Press Images</h1>
                <p className="text-gray-600 mt-2">Upload images for press/media section</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6 md:p-8">
                    <form className="space-y-8" onSubmit={handleAddNews}>
                        {/* Global Title (Optional) */}
                        <div>
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-linear-to-r from-blue-100 to-blue-50 rounded-lg flex items-center justify-center mr-3">
                                    <FolderIcon className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <label htmlFor="global-title" className="block text-lg font-semibold text-gray-900">
                                        Default Title (Optional)
                                    </label>
                                    <p className="text-sm text-gray-500">This title will be applied to all images. You can override it for individual images.</p>
                                </div>
                            </div>
                            <input
                                id="global-title"
                                type="text"
                                value={globalTitle}
                                onChange={handleTitleChange}
                                placeholder="e.g., Press Event Photos, Product Launch"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 placeholder:text-gray-400"
                                disabled={isSubmitting}
                                maxLength={100}
                            />
                            <p className="mt-1 text-sm text-gray-500 text-right">
                                {globalTitle.length}/100
                            </p>
                        </div>

                        {/* Images Section */}
                        <div>
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-linear-to-r from-orange-100 to-orange-50 rounded-lg flex items-center justify-center mr-3">
                                    <PhotoIcon className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <label className="block text-lg font-semibold text-gray-900">
                                        Press Images *
                                    </label>
                                    <p className="text-sm text-gray-500">Upload images for the press/media section</p>
                                    <p className="text-xs text-red-600 mt-1">
                                        Each image must have a unique title
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* File Upload Input */}
                        <div className="mt-2">
                            <label
                                htmlFor="images-upload"
                                className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                    uploadError && uploadError.includes("image")
                                        ? 'border-red-300 bg-red-50 hover:bg-red-100'
                                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <CloudArrowUpIcon className={`w-12 h-12 mb-4 ${uploadError && uploadError.includes("image") ? 'text-red-400' : 'text-gray-400'}`} />
                                    <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP up to 5MB each (max 50MB total)</p>
                                    <p className="text-xs text-gray-500 mt-1">You can select multiple files (max 50)</p>
                                    <p className="text-xs mt-1 text-center text-red-600 font-medium">
                                        At least one image is required
                                    </p>
                                </div>
                                <input
                                    id="images-upload"
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    disabled={isSubmitting}
                                    multiple
                                />
                            </label>
                        </div>

                        {images.length > 0 && (
                            <div className="mt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h4 className="font-medium text-gray-900">
                                            Selected Images ({images.length})
                                        </h4>
                                        <div className="flex gap-4 mt-1 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                Ready: {imageStats.uploadedImagesCount}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                                Uploading: {imageStats.uploadingImagesCount}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                                Pending: {imageStats.pendingUploadCount}
                                            </span>
                                            {imageStats.failedImagesCount > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                    Failed: {imageStats.failedImagesCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={cancelAllUploads}
                                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 font-medium border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        Remove All
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {images.map((image) => (
                                        <ImagePreview
                                            key={image.id}
                                            image={image}
                                            isSubmitting={isSubmitting}
                                            onRemove={removeImage}
                                            onTitleChange={handleImageTitleChange}
                                        />
                                    ))}
                                </div>

                                {/* Upload Status Summary */}
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-gray-900">
                                                Upload Status
                                            </p>
                                            <div className="flex flex-wrap gap-4">
                                                <span className="text-sm text-gray-600">
                                                    Total: {images.length} images
                                                </span>
                                                <span className="text-sm text-green-600 font-medium">
                                                    Ready: {imageStats.uploadedImagesCount}
                                                </span>
                                                {imageStats.uploadingImagesCount > 0 && (
                                                    <span className="text-sm text-blue-600 font-medium">
                                                        Uploading: {imageStats.uploadingImagesCount}
                                                    </span>
                                                )}
                                                {imageStats.pendingUploadCount > 0 && (
                                                    <span className="text-sm text-gray-600">
                                                        Pending: {imageStats.pendingUploadCount}
                                                    </span>
                                                )}
                                                {imageStats.failedImagesCount > 0 && (
                                                    <span className="text-sm text-red-600 font-medium">
                                                        Failed: {imageStats.failedImagesCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">
                                                Total Size: {imageStats.totalSizeMB} MB
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {imageStats.uploadedImagesCount} image(s) ready for submission
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Validation Info */}
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start">
                                <InformationCircleIcon className="w-5 h-5 text-yellow-600 mr-3 shrink-0 mt-0.5" />
                                <div>
                                    <h5 className="font-medium text-yellow-900 mb-2">Important Requirements</h5>
                                    <ul className="space-y-1 text-yellow-700 text-sm">
                                        <li className="flex items-start">
                                            <span className="text-yellow-600 mr-2">•</span>
                                            <span><strong>Unique Titles:</strong> Each image must have a unique title (case-insensitive)</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-yellow-600 mr-2">•</span>
                                            <span><strong>Required Titles:</strong> All images must have a title before submission</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-yellow-600 mr-2">•</span>
                                            <span><strong>Image Upload:</strong> All images will be uploaded to ImageKit before saving to database</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Error Display */}
                        {uploadError && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-red-700 font-medium">Error</p>
                                </div>
                                <p className="text-red-700 text-sm mt-1 wrap-break-words">{uploadError}</p>
                                <button
                                    type="button"
                                    onClick={() => setUploadError("")}
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
                                onClick={handleClearAll}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isSubmitting}
                            >
                                Clear All
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || images.length === 0 }
                                className="flex-1 px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {imageStats.uploadingImagesCount > 0 ? `Uploading Images...` : 'Saving...'}
                                    </div>
                                ) : (
                                    `Save Press Images${imageStats.uploadedImagesCount > 0 ? ` (${imageStats.uploadedImagesCount} ready)` : ''}`
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
                        <h3 className="font-semibold text-blue-900 mb-2">About Press Images</h3>
                        <ul className="space-y-2 text-blue-700 text-sm">
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                <span><strong>Press Images</strong> are displayed in the media/press section of your website</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                <span>Each image requires a <strong>unique title</strong> (database enforces uniqueness)</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                <span>Images are uploaded to <strong>ImageKit</strong> for optimized delivery</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                <span>You can add individual titles or use a default title for all images</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                <span>Images are stored permanently until manually deleted</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}