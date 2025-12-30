import { FileListViewProps } from "../types";
import { formatFileSize, formatDate, isImageFile } from "../utils";
import FileIcon from "./FileIcon";

export default function FileListView({
  files,
  selectedFile,
  onFileClick,
  onRename,
  onDelete,
}: FileListViewProps) {
  return (
    <div className="space-y-0.5">
      {files.map((file) => {
        const isImage = isImageFile(file);
        return (
          <div
            key={file.id}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer group ${
              selectedFile?.id === file.id ? "bg-gray-100" : "hover:bg-gray-50"
            }`}
            onClick={() => onFileClick(file)}
          >
            {/* Icon */}
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {isImage && file.file_url ? (
                <img
                  src={file.file_url}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <FileIcon file={file} size="md" />
              )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 truncate">{file.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {file.file_size ? formatFileSize(file.file_size) : ""}
                {file.file_size && " · "}
                {formatDate(file.created_at)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
              <button
                onClick={(e) => { e.stopPropagation(); onRename(file); }}
                className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(file); }}
                className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
