import React from "react";
import Image from "next/image";
import { X, Paperclip } from "lucide-react";

interface FilePreviewProps {
  file: File;
  previewUrl: string;
  onRemove: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  previewUrl,
  onRemove,
}) => {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  return (
    <div className="w-full flex items-center gap-4 mb-3 p-2 bg-slate-800/50 rounded-lg border border-slate-700 relative">
      {/* Preview */}
      <div className="relative group shrink-0">
        {isImage ? (
          <Image
            src={previewUrl}
            alt="Podgląd"
            className="h-16 w-16 object-cover rounded-md border border-slate-600 bg-slate-900"
            width={64}
            height={64}
          />
        ) : isVideo ? (
          <video
            src={previewUrl}
            className="h-16 w-16 object-cover rounded-md border border-slate-600 bg-black"
            muted
            playsInline
          />
        ) : (
          <div className="h-16 w-16 flex items-center justify-center bg-slate-700 rounded-md border border-slate-600 text-slate-400">
            <Paperclip size={24} />
          </div>
        )}

        {/* Remove button */}
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors shadow-md z-10"
          title="Usuń plik"
          type="button"
        >
          <X size={12} />
        </button>
      </div>

      {/* File info */}
      <div className="flex-1 overflow-hidden">
        <p className="text-sm font-medium text-slate-200 truncate">
          {file.name}
        </p>
        <p className="text-xs text-slate-400">
          {(file.size / 1024).toFixed(1)} KB
        </p>
      </div>
    </div>
  );
};
