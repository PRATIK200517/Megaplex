"use client"
import { useEffect, useState } from "react"
import axios from "axios";

export default function DeleteFolderForm() {
    const [folders, setFolders] = useState([]); // Initialized as array
    const [selectedFolderId, setSelectedFolderId] = useState("");
    const [loading, setLoading] = useState(false);

    // Fetch folders on mount
    useEffect(() => {
        const fetchFolders = async () => {
            try {
                const response = await axios.get(`/api/main/gallery/getFolderNames`, {
                    withCredentials: true,
                });
                setFolders(response.data.folders || []);
            } catch (e) {
                console.error("Failed to load folders:", e);
            }
        };
        fetchFolders();
    }, []);

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFolderId) return alert("Please select a folder first");

        const confirmDelete = confirm("Are you sure? This action cannot be undone.");
        if (!confirmDelete) return;

        setLoading(true);
        try {
            await axios.delete(`/api/main/gallery/deleteFolder/${selectedFolderId}`, {
                withCredentials: true,
            });
            
            setFolders(folders.filter((f: any) => f.id !== parseInt(selectedFolderId)));
            setSelectedFolderId("");
            alert("Folder deleted successfully");
        } catch (e) {
            console.error(e);
            alert("Error deleting folder");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Delete Folder</h2>
            
            <form onSubmit={handleDelete} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select a folder to remove
                    </label>
                    <select 
                        value={selectedFolderId}
                        onChange={(e) => setSelectedFolderId(e.target.value) }
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

                <button
                type="submit"
                disabled={loading || !selectedFolderId}
                className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                    loading || !selectedFolderId ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
                }`}
                >
                    {loading ? "Deleting..." : "Delete Permanatly"}
                </button>
                
            </form>
        </div>
    );
}