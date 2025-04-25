import { useState } from "react";
import ChatArea from "./components/ChatArea";
import InputArea from "./components/InputArea";
import Header from "./components/Header";
import { FileItem, Message } from "./types/Index";
import {
  analyzePrompt,
  downloadFile,
  getProcessedFilename,
  processFile,
} from "./utils/api";

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([]);

  const handleSendMessage = async () => {
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
    setIsLoading(true);

    try {
      let responseText = "";

      if (uploadedFiles.length > 0) {
        // Log file information to help with debugging
        console.log(
          "Processing files:",
          uploadedFiles.map((file) => ({
            name: file.name,
            type: file.type,
            size: file.size,
          }))
        );

        // Analyze the prompt to determine the operation
        const operation = analyzePrompt(
          inputText,
          uploadedFiles as unknown as File[]
        );
        console.log("Selected operation:", operation);

        // Set constraints based on prompt (e.g., target size for compression)
        const constraints: any = {};
        if (operation === "compress" && inputText.includes("size")) {
          // Extract target size if mentioned (e.g., "compress to 500KB")
          const sizeMatch = inputText.match(/(\d+)\s*[kK][bB]/);
          if (sizeMatch) {
            constraints.maxSize = parseInt(sizeMatch[1]);
          }
        }

        try {
          // Process the file with the backend
          const result = await processFile(
            uploadedFiles as unknown as File[],
            operation,
            constraints
          );

          // Generate appropriate filename
          const filename = getProcessedFilename(
            uploadedFiles[0].name,
            operation
          );

          // Trigger download
          downloadFile(result, filename);

          // Generate response text based on operation
          switch (operation) {
            case "compress":
              responseText = `I've compressed your ${uploadedFiles.length} file(s). The optimized version has been downloaded.`;
              break;
            case "merge":
              responseText = `I've merged your ${uploadedFiles.length} files. The combined PDF has been downloaded.`;
              break;
            case "split":
              responseText = `I've split your PDF into separate pages. The ZIP file containing all pages has been downloaded as "${filename}". The pages inside have been decrypted and are ready to use.`;
              break;
            case "imgCompressor":
              responseText = `I've compressed your image. The optimized version has been downloaded as "${filename}".`;
              break;
            default:
              responseText = `I've processed your ${uploadedFiles.length} file(s). The result has been downloaded.`;
          }
        } catch (error: any) {
          console.error("Error during file processing:", error);

          if (error.message && error.message.includes("padding")) {
            responseText = `I encountered an encryption error. This might be due to an incompatible file format or corrupted file. Please try with a different file.`;
          } else if (error.message && error.message.includes("Server error")) {
            responseText = `The server encountered an error while processing your file. ${error.message}`;
          } else {
            responseText = `Sorry, I encountered an error while processing your request: ${error.message}. Please try again.`;
          }
        }
      } else {
        responseText = `I can help with that! If you'd like to process files, please upload them using the attachment button, then let me know what you'd like to do with them.`;
      }

      // Add assistant response
      const assistantMessage: Message = {
        id: Date.now() + 1,
        text: responseText,
        sender: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error processing files:", error);

      // Add error message
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: `Sorry, I encountered an error while processing your request. Please try again.`,
        sender: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setUploadedFiles([]);
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
