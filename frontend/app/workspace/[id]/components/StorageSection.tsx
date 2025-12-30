"use client";

import { useState, useCallback } from "react";
import {
  useStorageFiles,
  useFileUpload,
  StorageHeader,
  FileListView,
  FileGridView,
  SkeletonLoader,
  EmptyState,
  DragOverlay,
  CreateFolderModal,
  RenameModal,
  ImagePreviewModal,
  WorkspaceFile,
} from "./storage";

interface StorageSectionProps {
  workspaceId: number;
}

export default function StorageSection({ workspaceId }: StorageSectionProps) {
  // View state
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameTarget, setRenameTarget] = useState<WorkspaceFile | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Image preview state
  const [previewImage, setPreviewImage] = useState<WorkspaceFile | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Storage files hook
  const {
    files,
    setFiles,
    breadcrumbs,
    currentFolderId,
    isLoading,
    selectedFile,
    fileStats,
    loadFiles,
    handleFileClick: baseHandleFileClick,
    handleBreadcrumbClick,
    handleCreateFolder: baseHandleCreateFolder,
    handleDeleteFile,
    handleRenameFile,
  } = useStorageFiles({ workspaceId });

  // File upload hook
  const {
    isUploading,
    uploadProgress,
    uploadStatus,
    uploadError,
    isDragging,
    fileInputRef,
    folderInputRef,
    setUploadError,
    handleFileUpload,
    handleFolderUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useFileUpload({
    workspaceId,
    currentFolderId,
    onFilesChange: setFiles,
    onUploadComplete: loadFiles,
  });

  // Filter files by search query
  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // File click handler with image preview
  const handleFileClick = useCallback(async (file: WorkspaceFile) => {
    const result = await baseHandleFileClick(file);
    if (result?.isImage) {
      setPreviewImage(file);
      setPreviewImageUrl(result.imageUrl);
    }
  }, [baseHandleFileClick]);

  // Create folder handler
  const handleCreateFolder = useCallback(async (name: string) => {
    setIsCreating(true);
    try {
      await baseHandleCreateFolder(name);
      setShowCreateFolderModal(false);
    } catch (error) {
      console.error("Failed to create folder:", error);
    } finally {
      setIsCreating(false);
    }
  }, [baseHandleCreateFolder]);

  // Rename handler
  const openRenameModal = useCallback((file: WorkspaceFile) => {
    setRenameTarget(file);
    setShowRenameModal(true);
  }, []);

  const handleRename = useCallback(async (newName: string) => {
    if (!renameTarget) return;
    setIsCreating(true);
    try {
      await handleRenameFile(renameTarget.id, newName);
      setShowRenameModal(false);
      setRenameTarget(null);
    } catch (error) {
      console.error("Failed to rename file:", error);
    } finally {
      setIsCreating(false);
    }
  }, [renameTarget, handleRenameFile]);

  // Close image preview
  const closeImagePreview = useCallback(() => {
    setPreviewImage(null);
    setPreviewImageUrl(null);
  }, []);

  return (
    <div
      className="h-full flex flex-col relative bg-white"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {isDragging && <DragOverlay />}

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        multiple
      />
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFolderUpload}
        className="hidden"
        webkitdirectory="true"
        directory="true"
      />

      {/* Header */}
      <StorageHeader
        fileStats={fileStats}
        filesCount={files.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        uploadStatus={uploadStatus}
        uploadError={uploadError}
        onUploadErrorClear={() => setUploadError(null)}
        onCreateFolder={() => setShowCreateFolderModal(true)}
        onFileUpload={() => fileInputRef.current?.click()}
        onFolderUpload={() => folderInputRef.current?.click()}
        currentFolderId={currentFolderId}
        breadcrumbs={breadcrumbs}
        onBreadcrumbClick={handleBreadcrumbClick}
      />

      {/* File List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isLoading ? (
          <SkeletonLoader />
        ) : filteredFiles.length === 0 ? (
          <EmptyState
            searchQuery={searchQuery}
            onUploadClick={() => fileInputRef.current?.click()}
          />
        ) : viewMode === "list" ? (
          <FileListView
            files={filteredFiles}
            selectedFile={selectedFile}
            onFileClick={handleFileClick}
            onRename={openRenameModal}
            onDelete={handleDeleteFile}
          />
        ) : (
          <FileGridView
            files={filteredFiles}
            selectedFile={selectedFile}
            onFileClick={handleFileClick}
            onRename={openRenameModal}
            onDelete={handleDeleteFile}
          />
        )}
      </div>

      {/* Modals */}
      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onCreate={handleCreateFolder}
        isCreating={isCreating}
      />

      <RenameModal
        isOpen={showRenameModal}
        file={renameTarget}
        onClose={() => { setShowRenameModal(false); setRenameTarget(null); }}
        onRename={handleRename}
        isRenaming={isCreating}
      />

      <ImagePreviewModal
        file={previewImage}
        imageUrl={previewImageUrl}
        onClose={closeImagePreview}
      />
    </div>
  );
}
