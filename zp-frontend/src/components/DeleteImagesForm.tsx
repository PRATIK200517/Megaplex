"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function DeleteImagesForm() {
    const [folders, setFolders] = useState([]);
    const [selectedFolderId, setSelectedFolderId] = useState("");
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState([]);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);

    // 1. Fetch folders on mount
    useEffect(() => {
        const fetchFolders = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/gallery/getFolderNames`, {
                    withCredentials: true,
                });
                setFolders(response.data.folders || []);
            } catch (e) {
                console.error("Failed to load folders:", e);
            }
        };
        fetchFolders();
    }, []);

    // 2. Fetch images when folder changes
    useEffect(() => {
        const fetchFolderImages = async () => {
            if (!selectedFolderId) {
                setImages([]);
                setSelectedImages([]);
                return;
            }

            try {
                setLoading(true);
                setSelectedImages([]); // Clear previous selection
                
                // Using POST as per your original logic, though GET is standard for fetching
                const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/gallery/${selectedFolderId}/getImages`,
                    { withCredentials: true }
                );

                setImages(response.data.images || []);
            } catch (e) {
                console.error("Failed to fetch Images in Folder", e);
            } finally {
                setLoading(false);
            }
        };
        fetchFolderImages();
    }, [selectedFolderId]);

    // 3. Toggle selection logic using fileId
    const toggleImageSelection = (fileId: string) => {
        setSelectedImages((prev) =>
            prev.includes(fileId)
                ? prev.filter((id) => id !== fileId)
                : [...prev, fileId]
        );
    };

    const handleSelectAll = () => {
        if (selectedImages.length === images.length) {
            setSelectedImages([]);
        } else {
            setSelectedImages(images.map((img: any) => img.fileId));
        }
    };

    // 4. Delete handler aligned with your backend
    const handleDeleteSelected = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (selectedImages.length === 0) {
            return alert("Please select images to delete");
        }

        const confirmDelete = confirm(`Are you sure you want to delete ${selectedImages.length} selected images? This action is permanent.`);
        if (!confirmDelete) return;

        setLoading(true);
        try {
            // Payload key "fileIds" matches your backend: const { fileIds } = req.body;
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/gallery/deleteImages`,
                { fileIds: selectedImages }, 
                { withCredentials: true }
            );

            // Update local state to remove deleted items
            setImages(images.filter((img: any) => !selectedImages.includes(img.fileId)));
            setSelectedImages([]);
            alert(response.data.message || "Images deleted successfully");
        } catch (e: any) {
            console.error(e);
            alert(e.response?.data?.message || "Error deleting images");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Delete Images</h2>

            <div className="space-y-6">
                {/* Folder Dropdown */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Step 1: Select a folder
                    </label>
                    <select
                        value={selectedFolderId}
                        onChange={(e) => setSelectedFolderId(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition"
                    >
                        <option value="">-- Choose Folder --</option>
                        {folders.map((folder: any) => (
                            <option key={folder.id} value={folder.id}>
                                {folder.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Image Selection Grid */}
                {images.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-semibold text-gray-700">
                                Step 2: Select images ({selectedImages.length} selected)
                            </label>
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                className="text-xs font-bold text-red-600 uppercase tracking-wider hover:underline"
                            >
                                {selectedImages.length === images.length ? "Deselect All" : "Select All"}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-gray-50">
                            {images.map((image: any) => (
                                <div
                                    key={image.fileId}
                                    onClick={() => toggleImageSelection(image.fileId)}
                                    className={`relative cursor-pointer group rounded-md overflow-hidden border-4 transition-all ${
                                        selectedImages.includes(image.fileId)
                                            ? 'border-red-500'
                                            : 'border-transparent hover:border-gray-300'
                                    }`}
                                >
                                    <img
                                        src={image.url}
                                        alt="Gallery content"
                                        className="h-28 w-full object-cover"
                                    />
                                    <div className="absolute top-1 left-1">
                                        <input
                                            type="checkbox"
                                            checked={selectedImages.includes(image.fileId)}
                                            readOnly
                                            className="w-4 h-4 cursor-pointer accent-red-600"
                                        />
                                    </div>
                                    {/* Visual Overlay for selection */}
                                    {selectedImages.includes(image.fileId) && (
                                        <div className="absolute inset-0 bg-red-500 opacity-10" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Loading/Empty State */}
                {selectedFolderId && images.length === 0 && !loading && (
                    <p className="text-center text-sm text-gray-500 py-6">No images found in this folder.</p>
                )}

                {/* Delete Action Button */}
                <button
                    onClick={handleDeleteSelected}
                    disabled={loading || selectedImages.length === 0}
                    className={`w-full py-3 rounded-lg font-bold text-white transition-all shadow-sm ${
                        loading || selectedImages.length === 0
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700 active:scale-[0.98]'
                    }`}
                >
                    {loading ? "Processing..." : `Delete ${selectedImages.length} Selected Image(s)`}
                </button>
            </div>
        </div>
    );
}