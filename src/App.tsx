import { useState } from "react";
import ChatArea from "./components/ChatArea";
import InputArea from "./components/InputArea";
import Header from "./components/Header";
import { FileItem, Message } from "./types/Index";

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([]);

  const handleSendMessage = () => {
    if (inputText.trim() === "" && uploadedFiles.length === 0) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      files: uploadedFiles,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setUploadedFiles([]);
    setIsLoading(true);

    // Generate assistant response immediately without delay
    const assistantMessage: Message = {
      id: Date.now() + 1,
      text: generateResponse(inputText, uploadedFiles),
      sender: "assistant",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const generateResponse = (text: string, files: FileItem[]): string => {
    if (files.length > 0) {
      const fileTypes = files.map((f) => f.type || "unknown").join(", ");

      if (text.toLowerCase().includes("compress")) {
        return `I've compressed your ${files.length} file(s). The optimized versions are ready for download.`;
      } else if (text.toLowerCase().includes("convert")) {
        return `I've converted your ${files.length} file(s) as requested. The new format is ready for download.`;
      } else if (text.toLowerCase().includes("extract")) {
        return `I've extracted text from your document(s). Here's what I found: [Example extracted content would appear here]`;
      } else {
        return `I've processed your ${files.length} file(s) (${fileTypes}). Let me know if you need anything specific done with them.`;
      }
    } else {
      return `I can help with that! If you'd like to process files, please upload them using the attachment button, then let me know what you'd like to do with them.`;
    }
  };

  const handleFileSelect = (files: FileItem[]) => {
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  // Show welcome message only when there are no messages
  const showWelcome = messages.length === 0;

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-[#F2F2F2] overflow-hidden">
      <Header />

      {/* Main content with message area and input */}
      <div className="flex-1 flex flex-col overflow-hidden relative pt-14 md:pt-16 xl:pt-0">
        {/* Chat content area that scrolls and passes through navbar on large screens */}
        <div className="flex-1 overflow-hidden relative">
          <div className="h-full w-full md:max-w-[70%] xl:max-w-[70%] md:mx-auto">
          <ChatArea messages={messages} isLoading={isLoading} />
          </div>
        </div>

        {/* Input area that stays at bottom or center depending on state */}
        <div
          className={`w-full transition-all duration-300 ${
            messages.length === 0
              ? "absolute top-1/2 left-0 transform -translate-y-1/3"
              : "relative"
          }`}
        >
          <div className="md:max-w-[70%] xl:max-w-[70%] md:mx-auto">
          <InputArea
            inputText={inputText}
            setInputText={setInputText}
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
            onSendMessage={handleSendMessage}
            onFileSelect={handleFileSelect}
            showWelcome={showWelcome}
          />
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="px-3 py-2 text-center text-xs text-[#A5A5A5]">
        Files are processed securely. No data is permanently stored.
      </div>
    </div>
  );
}

export default App;
