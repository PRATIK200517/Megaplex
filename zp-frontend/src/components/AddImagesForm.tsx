"use client"
import { useEffect, useState, useRef } from "react"
import axios from "axios";
import {
    PhotoIcon,
    CloudArrowUpIcon,
    XMarkIcon,
    FolderIcon
} from "@heroicons/react/24/outline";
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
    uploadProgress: number;
    uploadedImageUrl?: string;
    error?: string;
    isUploading: boolean;
    abortController?: AbortController;
}

interface Folder {
    id: number;
    title: string;
}

export default function AddImagesForm() {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadError, setUploadError] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [images, setImages] = useState<ImageFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch folders on mount
    useEffect(() => {
        const fetchFolders = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/gallery/getFolderNames`, {
                    withCredentials: true,
                });
                setFolders(response.data.folders || []);
            } catch (e) {
                console.error("Failed to load folders:", e);
                setUploadError("Failed to load folders. Please refresh the page.");
            }
        };
        fetchFolders();
    }, []);

    const authenticator = async () => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/upload-auth`,
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
            const errorMessage = error.response?.data?.message || 'Failed to authenticate for upload';
            setUploadError(errorMessage);
            throw error;
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        let totalSize = 0;
        const newImages: ImageFile[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            totalSize += file.size;

            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                setUploadError(`File ${file.name} is not a valid image type (JPEG, PNG, GIF, WebP)`);
                continue;
            }

            const previewUrl = URL.createObjectURL(file);

            newImages.push({
                id: `${Date.now()}-${i}`,
                file,
                previewUrl,
                uploadProgress: 0,
                isUploading: false,
            });
        }

        if (totalSize > 50 * 1024 * 1024) {
            setUploadError("Total file size must be less than 50MB");
            return;
        }

        setImages(prev => [...prev, ...newImages]);
        setUploadError("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeImage = (id: string) => {
        const imageToRemove = images.find(img => img.id === id);
        if (imageToRemove) {
            URL.revokeObjectURL(imageToRemove.previewUrl);

            if (imageToRemove.abortController) {
                imageToRemove.abortController.abort();
            }

            setImages(prev => prev.filter(img => img.id !== id));
        }
    };

    const uploadToImageKit = async (image: ImageFile): Promise<any> => {
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

            // Update image with upload result
            setImages(prev => prev.map(img =>
                img.id === image.id
                    ? {
                        ...img,
                        uploadedImageUrl: uploadResponse.url,
                        uploadProgress: 100,
                        isUploading: false
                    }
                    : img
            ));

            return {
                fileId: uploadResponse.fileId,
                url: uploadResponse.url,
                height: uploadResponse.height || 0,
                width: uploadResponse.width || 0
            };

        } catch (error) {
            let errorMessage = 'Failed to upload image';

            if (error instanceof ImageKitAbortError) {
                errorMessage = 'Upload was cancelled';
            } else if (error instanceof ImageKitInvalidRequestError) {
                errorMessage = 'Invalid upload request';
            } else if (error instanceof ImageKitUploadNetworkError) {
                errorMessage = 'Network error during upload';
            } else if (error instanceof ImageKitServerError) {
                errorMessage = 'Upload server error';
            }

            setImages(prev => prev.map(img =>
                img.id === image.id
                    ? { ...img, error: errorMessage, isUploading: false }
                    : img
            ));

            return null;
        }
    };


    const handleAddingImage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedFolderId) {
            setUploadError("Please select a folder first");
            return;
        }

        if (images.length === 0) {
            setUploadError("Please select at least one image to upload");
            return;
        }

        setIsSubmitting(true);
        setUploadError("");
        setSuccessMessage("");

        try {
            const uploadPromises = images.map(image => uploadToImageKit(image));
            const uploadResults = await Promise.all(uploadPromises);

            const successfulUploads = uploadResults.filter(result => result !== null);

            if (successfulUploads.length === 0) {
                throw new Error("No images were successfully uploaded");
            }

            const payload = {
                folder_id: parseInt(selectedFolderId),  
                imageArray: successfulUploads.map(result => ({
                    fileId: result.fileId,
                    url: result.url,
                    height: result.height || 0, 
                    width: result.width || 0     
                }))
            };

            console.log('Sending payload to backend:', payload);

            const backendResponse = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/gallery/addImages`,
                payload,  
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            console.log('Backend response:', backendResponse.data);

            setSuccessMessage(`Successfully uploaded ${successfulUploads.length} image(s) to the folder!`);

            setImages([]);

        } catch (error: any) {
            console.error('Submit Error:', error);

            if (error.response) {
                console.error('Error response:', error.response.data);
                console.error('Error status:', error.response.status);
                console.error('Error headers:', error.response.headers);
            }

            const msg = error.response?.data?.message ||
                error.response?.data?.errors ||
                error.message ||
                'An error occurred during upload';

            const errorMsg = typeof msg === 'object' ? JSON.stringify(msg) : msg;
            setUploadError(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const cancelAllUploads = () => {
        images.forEach(image => {
            if (image.abortController) {
                image.abortController.abort();
            }
            if (image.previewUrl) {
                URL.revokeObjectURL(image.previewUrl);
            }
        });
        setImages([]);
        setUploadError("");
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Add Images to Folder</h1>
                <p className="text-gray-600 mt-2">Select a folder and upload multiple images</p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6 md:p-8">
                    <form onSubmit={handleAddingImage} className="space-y-8">
                        {/* Folder Selection */}
                        <div>
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-linear-to-r from-blue-100 to-blue-50 rounded-lg flex items-center justify-center mr-3">
                                    <FolderIcon className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <label htmlFor="folderSelect" className="block text-lg font-semibold text-gray-900">
                                        Select Folder
                                    </label>
                                    <p className="text-sm text-gray-500">Choose a folder to add images</p>
                                </div>
                            </div>
                            <select
                                id="folderSelect"
                                value={selectedFolderId}
                                onChange={(e) => {
                                    setSelectedFolderId(e.target.value);
                                    setUploadError("");
                                }}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                required
                                disabled={isSubmitting}
                            >
                                <option value="">-- Choose Folder --</option>
                                {folders.map((folder) => (
                                    <option key={folder.id} value={folder.id}>
                                        {folder.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* File Upload Area */}
                        <div>
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-linear-to-r from-orange-100 to-orange-50 rounded-lg flex items-center justify-center mr-3">
                                    <PhotoIcon className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <label htmlFor="images" className="block text-lg font-semibold text-gray-900">
                                        Images
                                    </label>
                                    <p className="text-sm text-gray-500">Upload multiple images for the folder</p>
                                </div>
                            </div>

                            {/* File Upload Input */}
                            <div className="mt-2">
                                <label
                                    htmlFor="images-upload"
                                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${uploadError
                                        ? 'border-red-300 bg-red-50 hover:bg-red-100'
                                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                                        }`}
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <CloudArrowUpIcon className={`w-12 h-12 mb-4 ${uploadError ? 'text-red-400' : 'text-gray-400'}`} />
                                        <p className="mb-2 text-sm text-gray-500">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP up to 5MB each (max 50MB total)</p>
                                        <p className="text-xs text-gray-500 mt-1">You can select multiple files</p>
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

                            {/* Image Previews Grid */}
                            {images.length > 0 && (
                                <div className="mt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-medium text-gray-900">
                                            Selected Images ({images.length})
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={cancelAllUploads}
                                            className="text-sm text-red-600 hover:text-red-800 font-medium"
                                            disabled={isSubmitting}
                                        >
                                            Remove All
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {images.map((image) => (
                                            <div
                                                key={image.id}
                                                className="relative rounded-lg border border-gray-200 overflow-hidden group"
                                            >
                                                {/* Image Preview */}
                                                <div className="aspect-square bg-gray-100 relative">
                                                    <img
                                                        src={image.previewUrl}
                                                        alt={image.file.name}
                                                        className="w-full h-full object-cover"
                                                    />

                                                    {/* Upload Progress Overlay */}
                                                    {image.isUploading && image.uploadProgress < 100 && (
                                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                            <div className="text-center">
                                                                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                                                <span className="text-white text-xs font-medium">
                                                                    {image.uploadProgress}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Error Overlay */}
                                                    {image.error && (
                                                        <div className="absolute inset-0 bg-red-500 bg-opacity-90 flex items-center justify-center">
                                                            <div className="text-center p-2">
                                                                <p className="text-white text-xs font-medium">Error</p>
                                                                <p className="text-white text-xs truncate">{image.error}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Success Overlay */}
                                                    {image.uploadedImageUrl && !image.error && (
                                                        <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                                                            <div className="bg-green-500 rounded-full p-1">
                                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Cancel Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(image.id)}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                                    aria-label="Remove image"
                                                    disabled={isSubmitting}
                                                >
                                                    <XMarkIcon className="w-3 h-3" />
                                                </button>

                                                {/* File Name */}
                                                <div className="p-2 bg-white">
                                                    <p className="text-xs text-gray-700 truncate" title={image.file.name}>
                                                        {image.file.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {(image.file.size / 1024).toFixed(1)} KB
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upload Status Summary */}
                            {images.length > 0 && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                Upload Summary
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                {images.filter(img => img.uploadedImageUrl).length} of {images.length} uploaded
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">
                                                Total: {(images.reduce((acc, img) => acc + img.file.size, 0) / (1024 * 1024)).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Error Display */}
                            {uploadError && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-700 text-sm flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        {uploadError}
                                    </p>
                                </div>
                            )}

                            {/* Success Message */}
                            {successMessage && (
                                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-green-700 text-sm flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        {successMessage}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Form Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedFolderId("");
                                    cancelAllUploads();
                                    setUploadError("");
                                    setSuccessMessage("");
                                }}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isSubmitting}
                            >
                                Clear All
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !selectedFolderId || images.length === 0}
                                className="flex-1 px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Uploading Images...
                                    </div>
                                ) : (
                                    `Upload ${images.length} Image(s) to Folder`
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
                            <h4 className="font-medium text-gray-900 mb-2">Selected Folder</h4>
                            <div className="space-y-2">
                                {selectedFolderId ? (
                                    <div className="flex items-center">
                                        <FolderIcon className="w-5 h-5 text-gray-400 mr-2" />
                                        <span className="text-gray-900 font-medium">
                                            {folders.find(f => f.id === parseInt(selectedFolderId))?.title || "Unknown Folder"}
                                        </span>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 italic">No folder selected</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <h4 className="font-medium text-gray-900 mb-2">Upload Status</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Total Images:</span>
                                    <span className="text-gray-900 font-medium">{images.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Uploaded:</span>
                                    <span className="text-green-600 font-medium">
                                        {images.filter(img => img.uploadedImageUrl).length}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Pending:</span>
                                    <span className="text-yellow-600 font-medium">
                                        {images.filter(img => !img.uploadedImageUrl && !img.error).length}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Errors:</span>
                                    <span className="text-red-600 font-medium">
                                        {images.filter(img => img.error).length}
                                    </span>
                                </div>
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
                        <h3 className="text-sm font-medium text-blue-800">Tips for uploading images</h3>
                        <div className="mt-2 text-sm text-blue-700">
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Select multiple images at once using Ctrl+Click or drag-and-drop</li>
                                <li>Each image is uploaded individually to ImageKit.io</li>
                                <li>You can cancel individual uploads by clicking the X button</li>
                                <li>Supported formats: JPG, PNG, GIF, WebP (max 5MB each, 50MB total)</li>
                                <li>Images will be automatically resized and optimized for web delivery</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}