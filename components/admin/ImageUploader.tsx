'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface ImageUploaderProps {
  onSelectImages?: (files: File[]) => void;
  onImagesSelected?: (files: File[]) => void;
  fileList?: string[];
  onRemoveImage?: (index: number) => void;
  onRemoveExisting?: (index: number) => void;
  maxFiles?: number;
  accept?: string;
  galleryMode?: boolean;
}

interface FileWithPreview extends File {
  preview: string;
}

/**
 * ImageUploader - Multi-image upload component with drag & drop
 * 
 * Features:
 * - Drag and drop support
 * - Multiple file selection
 * - Preview thumbnails
 * - File size validation
 * - Gallery mode display
 */
const ImageUploader: React.FC<ImageUploaderProps> = ({
  onSelectImages,
  onImagesSelected,
  fileList = [],
  onRemoveImage,
  onRemoveExisting,
  maxFiles = 10,
  galleryMode = false,
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [error, setError] = useState('');

  // Use whichever callback is provided
  const imageSelectCallback = onSelectImages || onImagesSelected;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Limit number of files
    const remainingSlots = maxFiles - (fileList.length || 0);

    if (remainingSlots <= 0) {
      setError(`Maximum of ${maxFiles} images allowed.`);
      setTimeout(() => setError(''), 5000);
      return;
    }

    // Take only as many files as we have slots for
    const filesToProcess = acceptedFiles.slice(0, remainingSlots);

    // Check file size (max 5MB)
    const validFiles = filesToProcess.filter(file => file.size <= 5 * 1024 * 1024);
    const oversizedFiles = filesToProcess.filter(file => file.size > 5 * 1024 * 1024);

    if (oversizedFiles.length > 0) {
      setError(`${oversizedFiles.length} file(s) exceed the 5MB size limit and were not added.`);
      setTimeout(() => setError(''), 5000);
    }

    // Create preview URLs
    const newFiles = validFiles.map(file =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    ) as FileWithPreview[];

    setFiles(prevFiles => [...prevFiles, ...newFiles]);

    // Call the appropriate callback
    if (imageSelectCallback) {
      imageSelectCallback(newFiles);
    }
  }, [maxFiles, fileList, imageSelectCallback]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: maxFiles,
  });

  const removeFile = (index: number) => {
    const newFiles = [...files];

    // Release object URL to prevent memory leaks
    if (newFiles[index].preview) {
      URL.revokeObjectURL(newFiles[index].preview);
    }

    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  // Handle removing an existing image
  const handleRemoveImage = (index: number) => {
    if (onRemoveImage) {
      onRemoveImage(index);
    } else if (onRemoveExisting) {
      onRemoveExisting(index);
    }
  };

  return (
    <div className="mt-2">
      {/* Dropzone area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}
        `}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-primary">Drop the images here...</p>
        ) : (
          <div className="flex flex-col items-center">
            <PhotoIcon className="h-10 w-10 text-gray-400 mb-2" />
            <p className="mb-1">Drag & drop images here, or click to select files</p>
            <p className="text-sm text-gray-500">
              Supports: JPG, PNG, GIF, WEBP (Max 5MB each)
              {maxFiles > 0 &&
                ` • Upload up to ${maxFiles - fileList.length} more image${maxFiles - fileList.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}

      {/* Display uploaded/existing images in gallery mode */}
      {fileList.length > 0 && (
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">
            {galleryMode ? 'Image Gallery' : 'Current Images'}
            <span className="text-gray-500 ml-2 text-xs">
              ({fileList.length}/{maxFiles})
            </span>
          </label>
          <div
            className={`grid ${galleryMode ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'} gap-3`}
          >
            {fileList.map((img, index) => (
              <div key={`existing-${index}`} className="relative group">
                <div className="relative h-24 w-full">
                  <Image
                    src={img}
                    alt={`Image ${index + 1}`}
                    fill
                    className="object-contain rounded-md border border-gray-200"
                  />
                </div>
                <span className="absolute bottom-0 left-0 bg-white/70 text-xs px-1">
                  Image {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview selected files */}
      {files.length > 0 && (
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Selected for Upload</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {files.map((file, index) => (
              <div key={`file-${index}`} className="relative group">
                <div className="relative h-24 w-full">
                  <Image
                    src={file.preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-contain rounded-md border border-gray-200"
                  />
                </div>
                <span className="absolute bottom-0 left-0 bg-black/50 text-white text-xs px-1">
                  New {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
