'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Trash2, Download, Copy, Upload, ImageIcon, X } from 'lucide-react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';

type ImageData = {
  name: string;
  path: string;
  url: string;
  size: number;
  created_at: string;
  updated_at: string;
  mimetype: string;
};

export default function AdminImagesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<ImageData[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/media/list');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('Failed to fetch images');
      }
      const data = await response.json();
      setImages(data.images || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching images:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (image: ImageData) => {
    if (!confirm(`Are you sure you want to delete "${image.name}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    setDeletingId(image.path);

    try {
      const response = await fetch(`/api/media?url=${encodeURIComponent(image.url)}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete image');
      }

      // Remove from list
      setImages(images.filter((img) => img.path !== image.path));

      // Close modal if this image was selected
      if (selectedImage?.path === image.path) {
        setSelectedImage(null);
      }
    } catch (error: any) {
      console.error('Error deleting image:', error);
      alert(`Failed to delete image: ${error.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpload = async (file: File) => {
    setUploadingImage(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setUploadError(result.error || 'Failed to upload image');
        return;
      }

      // Refresh the images list
      await fetchImages();
    } catch (err: any) {
      setUploadError(err.message || 'An unexpected error occurred');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleUpload(file);
    } else {
      setUploadError('Please drop an image file');
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <AdminPageWrapper showLogout={false}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper showLogout={false}>
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black text-white mb-2">Image Gallery</h2>
          <p className="text-gray-400 text-sm">Manage all uploaded blog images</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-2">{images.length} images</div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="mb-8">
        {uploadError && (
          <div className="mb-3 p-3 bg-[#ff005520] border-2 border-[#ff0055] text-[#ff0055] text-sm">
            {uploadError}
          </div>
        )}

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed transition-colors ${
            isDragging
              ? 'border-[#00ff88] bg-[#00ff8820]'
              : 'border-gray-700 hover:border-gray-500'
          } ${uploadingImage ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            onChange={handleFileChange}
            disabled={uploadingImage}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            id="upload-image"
          />
          <label
            htmlFor="upload-image"
            className="flex flex-col items-center justify-center p-8 cursor-pointer"
          >
            {uploadingImage ? (
              <>
                <svg
                  className="animate-spin h-10 w-10 text-[#00ff88] mb-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-white font-bold">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-500 mb-4" />
                <p className="text-white font-bold mb-2">
                  {isDragging ? 'Drop image here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-gray-500 text-xs">
                  JPEG, PNG, WebP, AVIF, or GIF (max 10MB)
                </p>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Images Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((image) => (
            <div
              key={image.path}
              className="bg-black border border-gray-800 hover:border-[#00ff88] transition-all group relative"
            >
              <div
                className="relative aspect-video w-full cursor-pointer overflow-hidden"
                onClick={() => setSelectedImage(image)}
              >
                <Image
                  src={image.url}
                  alt={image.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
              </div>
              <div className="p-2">
                <div className="text-xs text-gray-400 truncate mb-1" title={image.name}>
                  {image.name}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{formatFileSize(image.size)}</span>
                  <button
                    onClick={() => handleDelete(image)}
                    disabled={deletingId === image.path}
                    className="text-gray-500 hover:text-[#ff0055] transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    {deletingId === image.path ? '...' : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-black border border-gray-800">
          <ImageIcon className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h2 className="text-lg font-black text-white mb-2">No Images Yet</h2>
          <p className="text-sm text-gray-500 mb-6">Upload your first image to get started</p>
        </div>
      )}

      {/* Image Detail Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-black border-2 border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h3 className="text-white font-bold truncate flex-1">{selectedImage.name}</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-gray-400 hover:text-white transition-colors ml-4"
              >
                <X size={20} />
              </button>
            </div>

            {/* Image */}
            <div className="relative aspect-video w-full bg-gray-900">
              <Image
                src={selectedImage.url}
                alt={selectedImage.name}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>

            {/* Details & Actions */}
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 text-xs mb-1">File Size</div>
                  <div className="text-white">{formatFileSize(selectedImage.size)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">Type</div>
                  <div className="text-white">{selectedImage.mimetype}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">Uploaded</div>
                  <div className="text-white">
                    {new Date(selectedImage.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">Path</div>
                  <div className="text-white text-xs truncate" title={selectedImage.path}>
                    {selectedImage.path}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-gray-500 text-xs mb-2">URL</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedImage.url}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-900 text-white text-xs border border-gray-800 focus:border-[#00ff88] focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(selectedImage.url)}
                    className="px-3 py-2 bg-[#00cfff] text-black font-bold uppercase text-xs hover:bg-[#00e5ff] transition-colors flex items-center gap-2"
                  >
                    <Copy size={14} />
                    {copiedUrl === selectedImage.url ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => downloadImage(selectedImage.url, selectedImage.name)}
                  className="flex-1 px-4 py-2 bg-gray-800 text-white font-bold uppercase text-xs hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={14} />
                  Download
                </button>
                <button
                  onClick={() => handleDelete(selectedImage)}
                  disabled={deletingId === selectedImage.path}
                  className="flex-1 px-4 py-2 bg-[#ff0055] text-white font-bold uppercase text-xs hover:bg-[#ff0077] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={14} />
                  {deletingId === selectedImage.path ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminPageWrapper>
  );
}
