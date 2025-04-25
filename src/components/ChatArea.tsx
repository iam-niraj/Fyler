import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DocumentIcon,
  PDFIcon,
  ImageIcon,
  AudioIcon,
  VideoIcon,
  ZipIcon,
  CodeIcon,
} from "./icons";
import { Message } from "../types/Index";

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
}

const ChatArea = ({ messages, isLoading }: ChatAreaProps) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Smooth scroll to maximum scroll position
  const scrollToBottom = (duration = 1200) => {
    const container = chatContainerRef.current;
    if (!container) return;

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      const targetPosition = container.scrollHeight;
      const startPosition = container.scrollTop;
      const distance = targetPosition - startPosition;

      // Return early if already at bottom or almost at bottom
      if (distance < 10) return;

      let startTime: number | null = null;

      const animateScroll = (currentTime: number) => {
        if (startTime === null) startTime = currentTime;
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        // Ease out quartic function for even smoother deceleration
        const easeOutQuartic = 1 - Math.pow(1 - progress, 4);

        if (container) {
          container.scrollTop = startPosition + distance * easeOutQuartic;
        }

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      };

      requestAnimationFrame(animateScroll);
    });
  };

  // Scroll when messages change or loading state changes
  useEffect(() => {
    // Wait a tiny bit for DOM to update before scrolling
    const timeoutId = setTimeout(() => scrollToBottom(), 50);
    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

  // Also handle window resize which can affect layout and scroll position
  useEffect(() => {
    const handleResize = () => scrollToBottom(600); // Shorter duration for resize events
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const initialInstructions = messages.length === 0;

  const getFileIcon = (file: File) => {
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

  const renderMessage = (message: Message) => (
    <div
      className={`flex flex-col ${
        message.sender === "user" ? "items-end" : "items-start"
      }`}
    >
      {message.files && message.files.length > 0 && (
        <div className="mb-2 flex flex-nowrap overflow-x-auto gap-2 scrollbar-none">
          {message.files.map((file, idx) => (
            <span
              key={idx}
              className="bg-[#595959] rounded-xl px-3 py-2 text-sm inline-flex items-center gap-2 flex-shrink-0"
            >
              {getFileIcon(file)}
              <span className="max-w-[120px] truncate text-[#F2F2F2]">
                {file.name}
              </span>
            </span>
          ))}
        </div>
      )}
      <div
        className={`${
          message.sender === "user"
            ? "bg-[#595959] text-[#F2F2F2]"
            : "text-[#F2F2F2]"
        } rounded-2xl px-5 py-4`}
        style={{ maxWidth: "85%" }}
      >
        <div className="whitespace-pre-wrap">{message.text}</div>
      </div>
    </div>
  );

  return (
    <div
      ref={chatContainerRef}
      className="absolute inset-0 overflow-y-auto custom-scrollbar px-4 pt-2 pb-4 chat-scroll-container md:pt-2 xl:pt-0 flex flex-col items-center"
    >
      {!initialInstructions && (
        <div className="w-full max-w-3xl mx-auto xl:pt-20">
          {/* Message listing */}
          <div className="space-y-8">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onAnimationComplete={
                  index === messages.length - 1
                    ? () => scrollToBottom(1500)
                    : undefined
                }
              >
                {renderMessage(message)}
              </motion.div>
            ))}
          </div>

          {/* Spacer at the bottom for better visual experience */}
          <div className="h-16 mb-8"></div>

          {/* Add space at the bottom for positioning */}
          <div className="h-[50vh]"></div>
        </div>
      )}
    </div>
  );
};

export default ChatArea;
