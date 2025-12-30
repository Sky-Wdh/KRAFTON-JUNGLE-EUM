"use client";

import { useState, useEffect } from "react";
import { CreateFolderModalProps, RenameModalProps, ImagePreviewModalProps } from "../types";
import { formatFileSize } from "../utils";

// 새 폴더 생성 모달
export function CreateFolderModal({ isOpen, onClose, onCreate, isCreating }: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState("");

  useEffect(() => {
    if (!isOpen) setFolderName("");
  }, [isOpen]);

  const handleCreate = async () => {
    if (!folderName.trim() || isCreating) return;
    await onCreate(folderName.trim());
    setFolderName("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-sm mx-4 shadow-xl">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-base font-medium text-gray-900">새 폴더</h2>
        </div>
        <div className="p-4">
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="폴더 이름"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-300"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
        </div>
        <div className="px-4 pb-4 flex gap-2 justify-end">
          <button
            onClick={() => { onClose(); setFolderName(""); }}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
          >
            취소
          </button>
          <button
            onClick={handleCreate}
            disabled={!folderName.trim() || isCreating}
            className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {isCreating ? "생성 중..." : "만들기"}
          </button>
        </div>
      </div>
    </div>
  );
}

// 이름 변경 모달
export function RenameModal({ isOpen, file, onClose, onRename, isRenaming }: RenameModalProps) {
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (file) setNewName(file.name);
    else setNewName("");
  }, [file]);

  const handleRename = async () => {
    if (!newName.trim() || isRenaming) return;
    await onRename(newName.trim());
  };

  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-sm mx-4 shadow-xl">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-base font-medium text-gray-900">이름 변경</h2>
        </div>
        <div className="p-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="새 이름"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-300"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
          />
        </div>
        <div className="px-4 pb-4 flex gap-2 justify-end">
          <button
            onClick={() => { onClose(); setNewName(""); }}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
          >
            취소
          </button>
          <button
            onClick={handleRename}
            disabled={!newName.trim() || isRenaming}
            className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {isRenaming ? "변경 중..." : "변경"}
          </button>
        </div>
      </div>
    </div>
  );
}

// 이미지 미리보기 모달
export function ImagePreviewModal({ file, imageUrl, onClose }: ImagePreviewModalProps) {
  if (!file) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* File Name */}
      <div className="absolute top-4 left-4 text-white/90 text-sm font-medium max-w-[60%] truncate">
        {file.name}
      </div>

      {/* Image Container */}
      <div
        className="max-w-[90vw] max-h-[85vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={file.name}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
          />
        ) : (
          <div className="flex items-center justify-center w-32 h-32 bg-white/10 rounded-lg">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 text-sm text-white/70">
        {file.file_size && (
          <span>{formatFileSize(file.file_size)}</span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (imageUrl) {
              window.open(imageUrl, "_blank");
            }
          }}
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          새 탭에서 열기
        </button>
      </div>
    </div>
  );
}
