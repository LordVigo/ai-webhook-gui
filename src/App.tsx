import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/Chat/ChatView';
import { useThemeStore } from './store/themeStore';
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faBars, faComment, faMapMarkerAlt, faCommentDots, 
  faPlus, faUser, faPlay, faImage, faPlusCircle, 
  faMicrophone, faArrowRight, faTimes, faTrash, faFile,
  faSun, faMoon
} from '@fortawesome/free-solid-svg-icons';
import WebhookForm from './components/WebhookForm';

// Add all icons to the library for easy use throughout the application
library.add(
  faBars, faComment, faMapMarkerAlt, faCommentDots, 
  faPlus, faUser, faPlay, faImage, faPlusCircle, 
  faMicrophone, faArrowRight, faTimes, faTrash, faFile,
  faSun, faMoon
);

/**
 * Main application component that manages the layout and state of the UI
 * 
 * This component is responsible for:
 * - Managing the sidebar visibility
 * - Handling the webhook form modal
 * - Organizing the main layout structure
 * 
 * @component
 * @returns {JSX.Element} The rendered application
 */
const App = () => {
  const { isDarkMode } = useThemeStore();
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  /**
   * State for controlling webhook form modal visibility
   * @type {boolean}
   */
  const [isWebhookFormOpen, setIsWebhookFormOpen] = useState(false);

  /**
   * Toggles the sidebar visibility
   */
  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  /**
   * Opens the webhook form modal
   */
  const handleAddWebhook = () => {
    setIsWebhookFormOpen(true);
  };


  return (
    <div id="root" className={`flex ${isDarkMode ? 'dark' : ''}`}>
      <div className={`sidebar-container ${isSidebarVisible ? 'visible' : ''}`}>
        <Sidebar 
          onAddClick={handleAddWebhook} 
          isVisible={isSidebarVisible}
          onHide={() => window.innerWidth <= 768 && setIsSidebarVisible(false)}
        />
      </div>
      {isSidebarVisible && window.innerWidth <= 768 && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsSidebarVisible(false)}
        />
      )}
      <div className="flex-1">
        <ChatView onMenuClick={toggleSidebar} />
      </div>
      {isWebhookFormOpen && (
        <WebhookForm onClose={() => setIsWebhookFormOpen(false)} />
      )}
    </div>
  );
};

export default App;
