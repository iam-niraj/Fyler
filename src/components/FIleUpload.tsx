import { RefObject } from "react";
import { motion } from "framer-motion";
import { FileItem } from "../types/Index";
import {
  DocumentIcon,
  XMarkIcon,
  PDFIcon,
  ImageIcon,
  AudioIcon,
  VideoIcon,
  ZipIcon,
  CodeIcon,
} from "./icons";

interface FileUploadProps {
  onFileSelect: (files: FileItem[]) => void;
  uploadedFiles: FileItem[];
  setUploadedFiles: (files: FileItem[]) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
}

const FileUpload = ({
  onFileSelect,
  uploadedFiles,
  setUploadedFiles,
  fileInputRef,
}: FileUploadProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as FileItem[];
      if (files.length > 0) {
        onFileSelect(files);
        // Reset the input to allow selecting the same file again
        e.target.value = "";
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: FileItem) => {
    const type = file.type;
    if (type.includes("pdf")) {
      return <PDFIcon className="h-5 w-5 text-[#CCCCCC]" />;
    } else if (type.includes("image")) {
      return <ImageIcon className="h-5 w-5 text-[#CCCCCC]" />;
    } else if (type.includes("audio")) {
      return <AudioIcon className="h-5 w-5 text-[#CCCCCC]" />;
    } else if (type.includes("video")) {
      return <VideoIcon className="h-5 w-5 text-[#CCCCCC]" />;
    } else if (
      type.includes("zip") ||
      type.includes("x-tar") ||
      type.includes("x-rar") ||
      type.includes("x-7z")
    ) {
      return <ZipIcon className="h-5 w-5 text-[#CCCCCC]" />;
    } else if (
      type.includes("text") ||
      type.includes("javascript") ||
      type.includes("json") ||
      type.includes("html") ||
      type.includes("css")
    ) {
      return <CodeIcon className="h-5 w-5 text-[#CCCCCC]" />;
    } else {
      return <DocumentIcon className="h-5 w-5 text-[#CCCCCC]" />;
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="file-upload-button hidden"
        multiple
      />
      {uploadedFiles.length > 0 && (
        <div className="flex flex-nowrap overflow-x-auto pr-3 gap-2 pb-2 scrollbar-none">
          {uploadedFiles.map((file, index) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key={index}
              className="bg-[#7F7F7F] hover:bg-[#A5A5A5] rounded-xl px-3 py-2 text-sm flex-shrink-0 flex items-center gap-2 file-preview"
            >
              {getFileIcon(file)}
              <span className="max-w-[120px] truncate text-[#F2F2F2]">
                {file.name}
              </span>
              <button
                onClick={() => removeFile(index)}
                className="text-[#CCCCCC] hover:text-[#F2F2F2]"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
