import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useChatStore } from '../../store/chatStore';
import { useThemeStore } from '../../store/themeStore';
import { FileData } from '../../store/chatStore';
import { faDownload, faFileImage, faFile } from '@fortawesome/free-solid-svg-icons';

interface SelectedFile {
  name: string;
  file: File;
}

/**
 * Props for the ChatView component
 * @interface ChatViewProps
 */
interface ChatViewProps {
  /** Callback function to be called when the menu button is clicked */
  onMenuClick: () => void;
}

/**
 * Main chat interface component that displays messages and handles user input
 * 
 * @component
 * @param {ChatViewProps} props - Component props
 * @returns {JSX.Element} The rendered chat interface
 * 
 * @example
 * ```tsx
 * <ChatView onMenuClick={() => setSidebarVisible(!sidebarVisible)} />
 * ```
 */
const ChatView = ({ onMenuClick }: ChatViewProps) => {
  // Access chat store state and actions
  const { activeWebhook, messages, isLoading, sendMessage, setActiveWebhook } = useChatStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  
  // Local state for input field and files
  const [inputValue, setInputValue] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  
  // References
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Initialize chat with welcome message when no webhook is selected
   */
  useEffect(() => {
    setActiveWebhook(null);
  }, [setActiveWebhook]);

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Handles form submission for sending messages
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() && selectedFiles.length === 0) return;

    const messageContent = inputValue.trim();
    const files = selectedFiles.map(sf => sf.file);
    
    // Clear input and files immediately
    setInputValue('');
    setSelectedFiles([]);

    try {
      await sendMessage(messageContent, files);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  /**
   * Handles textarea input changes and auto-resizing
   * @param {React.ChangeEvent<HTMLTextAreaElement>} e - Textarea change event
   */
  /**
   * Handles file download when a user clicks the download button
   * @param {FileData} fileData - The file data to download
   */
  const handleFileDownload = (fileData: FileData) => {
    // Create a blob from the base64 data
    const byteCharacters = atob(fileData.data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: fileData.mimeType });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileData.fileName;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setInputValue(textarea.value);
    
    // Auto-adjust height
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 250);
    textarea.style.height = newHeight + 'px';
    
    // Add multiline class if text contains line breaks or height is larger than one line
    const lineCount = Math.ceil(newHeight / 20); // Assuming line-height is about 20px
    textarea.classList.toggle('multiline', lineCount > 10);
  };

  /**
   * Formats a date object into a time string (HH:MM)
   * @param {Date} date - The date to format
   * @returns {string} Formatted time string
   */
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className={`main-content ${isDarkMode ? 'dark' : ''}`}>
      <div className="chat-header">
        <div className="flex items-center gap-4">
          <button className="menu-button" onClick={onMenuClick}>
            <FontAwesomeIcon icon="bars" />
          </button>
          <h1 className="webhook-title">
            {activeWebhook ? activeWebhook.name : 'Chat Agent'}
          </h1>
        </div>
        <button className="theme-toggle" onClick={toggleTheme}>
          <FontAwesomeIcon icon={isDarkMode ? 'sun' : 'moon'} />
        </button>
      </div>
      
      <div className="chat-messages">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.isUser ? 'outgoing' : 'incoming'}`}>
            <div className="avatar">
              <FontAwesomeIcon icon="user" />
            </div>
            <div>
              <div className="message-content">
                {message.content}
                {message.data && Object.entries(message.data).map(([key, fileData]) => (
                  <div key={key} className="file-container">
                    {(fileData.fileType === "image" || fileData.mimeType.startsWith("image/")) ? (
                      <div className="image-preview-container">
                        <img 
                          src={`data:${fileData.mimeType};base64,${fileData.data}`}
                          alt={fileData.fileName}
                          className="image-preview"
                        />
                        {!message.isUser && (
                          <button 
                            className="file-info"
                            onClick={() => handleFileDownload(fileData)}
                            title="Download image"
                          >
                            <span className="file-name">{fileData.fileName}</span>
                            <FontAwesomeIcon icon={faDownload} className="download-icon" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <button 
                        className="file-download"
                        onClick={() => handleFileDownload(fileData)}
                      >
                        <div className="file-icon">
                          <FontAwesomeIcon icon={faFile} />
                        </div>
                        <span className="file-name">{fileData.fileName}</span>
                        <span className="file-size">({fileData.fileSize})</span>
                        <div className="download-icon">
                          <FontAwesomeIcon icon={faDownload} />
                        </div>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="timestamp">{formatTime(message.timestamp)}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message incoming">
            <div className="avatar">
              <FontAwesomeIcon icon="user" />
            </div>
            <div>
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            const newFiles = files.map(file => ({
              name: file.name,
              file: file
            }));
            setSelectedFiles(prev => [...prev, ...newFiles]);
            // Reset input value to allow selecting the same file again
            e.target.value = '';
          }}
        />
        {selectedFiles.length > 0 && (
          <div className="selected-files">
            {selectedFiles.map((file, index) => (
              <div key={index} className="selected-file">
                <span className="file-name">{file.name}</span>
                <button
                  type="button"
                  className="remove-file"
                  onClick={() => {
                    setSelectedFiles(files => files.filter((_, i) => i !== index));
                  }}
                >
                  <FontAwesomeIcon icon="times" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="chat-input-controls">
          <div className="input-actions">
            <FontAwesomeIcon 
              icon="plus-circle" 
              style={{ fontSize: '24px', color: '#555', cursor: 'pointer' }} 
              onClick={() => fileInputRef.current?.click()}
            />
          </div>
          <textarea 
            className="input-field"
            placeholder="Message"
            rows={1}
            value={inputValue}
            onChange={handleTextareaChange}
            style={{ resize: 'none', overflow: 'auto', maxHeight: '250px' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div style={{ color: '#555' }}>
            <FontAwesomeIcon icon="microphone" style={{ fontSize: '24px' }} />
          </div>
          <button type="submit" className="send-button" disabled={((!inputValue.trim() && selectedFiles.length === 0) || isLoading)}>
            <FontAwesomeIcon icon="arrow-right" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatView;
