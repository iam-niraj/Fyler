import { useRef, useEffect } from "react";
import { PlusIcon } from "./icons";
import FileUpload from "./FIleUpload";
import { FileItem } from "../types/Index";
import { Heading, Subheading } from "./catalyst/heading";

interface InputAreaProps {
  inputText: string;
  setInputText: (text: string) => void;
  uploadedFiles: FileItem[];
  setUploadedFiles: (files: FileItem[]) => void;
  onSendMessage: () => void;
  onFileSelect: (files: FileItem[]) => void;
  showWelcome?: boolean;
}

const InputArea = ({
  inputText,
  setInputText,
  uploadedFiles,
  setUploadedFiles,
  onSendMessage,
  onFileSelect,
  showWelcome = true,
}: InputAreaProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const MAX_TEXTAREA_HEIGHT = 150; // Approx 6 rows height

  useEffect(() => {
    if (textareaRef.current) {
      handleTextareaInput();
    }
  }, [inputText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const openFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Auto resize textarea with max height limit
  const handleTextareaInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height temporarily to get the correct scrollHeight
      textarea.style.height = "auto";

      // Set height based on scroll height, but limit to MAX_TEXTAREA_HEIGHT
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(scrollHeight, MAX_TEXTAREA_HEIGHT);
      textarea.style.height = `${newHeight}px`;

      // Enable/disable scrolling based on content height
      textarea.style.overflowY =
        scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
    }
  };

  return (
    <div className="mx-4 mb-6">
      <div className="max-w-3xl mx-auto">
        {showWelcome && (
          <div className="text-center mb-5">
            <Heading>How can I help with your files today?</Heading>
            <Subheading>
              Upload files to process, convert, or analyze
            </Subheading>
          </div>
        )}

        <div className="rounded-2xl floating-textarea shadow-lg relative overflow-hidden">
          <div className="pl-3 pt-3 pb-0">
            <FileUpload
              onFileSelect={onFileSelect}
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
              fileInputRef={fileInputRef}
            />
          </div>

          <form className="relative">
            <div className="rounded-3xl px-1">
              <label htmlFor="comment" className="sr-only">
                Ask about your files
              </label>
              <textarea
                id="comment"
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask anything about your files..."
                className="block w-full resize-none bg-transparent border-0 px-4 py-3 text-[#F2F2F2] placeholder-[#A5A5A5] focus:outline-none input-scrollbar rounded-3xl no-focus-outline"
                style={{
                  minHeight: "44px",
                  maxHeight: `${MAX_TEXTAREA_HEIGHT}px`,
                  overflowY: inputText.length > 80 ? "auto" : "hidden",
                  marginBottom: "2px",
                }}
              />

              {/* Spacer element */}
              <div aria-hidden="true" className="py-2">
                <div className="py-px">
                  <div className="h-9" />
                </div>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pr-3 pl-4">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={openFileUpload}
                  className="-m-2.5 flex size-10 items-center justify-center rounded-full text-[#CCCCCC] hover:text-[#F2F2F2]"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span className="sr-only">Upload a file</span>
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={onSendMessage}
                  disabled={
                    inputText.trim() === "" && uploadedFiles.length === 0
                  }
                  className={`inline-flex items-center rounded-xl px-3 py-2 text-sm font-semibold text-[#F2F2F2] shadow-xs ${
                    inputText.trim() === "" && uploadedFiles.length === 0
                      ? "bg-[#595959] cursor-not-allowed opacity-60"
                      : "bg-[#7F7F7F] hover:bg-[#A5A5A5]"
                  }`}
                >
                  Send
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InputArea;
