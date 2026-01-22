import { useState, useRef, useCallback } from "react";

export const useFileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // HANDLE FILE SELECTION
  // ============================================================================

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
      // Reset input value żeby można było wybrać ten sam plik ponownie
      e.target.value = "";
    },
    []
  );

  // ============================================================================
  // REMOVE FILE
  // ============================================================================

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  // ============================================================================
  // TRIGGER FILE PICKER
  // ============================================================================

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // ============================================================================
  // RESET - przydatne po wysłaniu wiadomości
  // ============================================================================

  const reset = useCallback(() => {
    removeFile();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [removeFile]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    selectedFile,
    previewUrl,
    fileInputRef,
    handleFileChange,
    removeFile,
    openFilePicker,
    reset,
  };
};
