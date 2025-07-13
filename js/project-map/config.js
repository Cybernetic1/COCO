/**
 * PROJECT MAP CONFIGURATION MODULE
 * 
 * Centralized configuration and constants for the project map application.
 * Contains color schemes, visual parameters, and settings.
 * 
 * @module project-map/config
 */

const ProjectMapConfig = {
  // Visual Configuration
  colors: {
    // Color generation for nodes at different depths
    maxLightness: 95,
    minLightness: 40,
    maxSaturation: 70,
    minSaturation: 20,
    hue: 180, // Cyan hue
    
    // UI colors
    selectedNodeBorder: '#f00',
    selectedNodeBackground: '#fee',
    menuButtonColor: '#AAA',
    deleteOptionColor: '#b00',
    deleteOptionHoverBg: '#fee'
  },
  
  // Slider Configuration
  slider: {
    min: 0,
    max: 1000,
    decimalPlaces: 1,
    redistributionThreshold: 0.01 // Minimum surplus to trigger redistribution
  },
  
  // Audio Configuration
  audio: {
    enabled: true,
    files: {
      techClick2: 'sounds/tech-click2.wav'
    }
  },
  
  // Chat Configuration
  chat: {
    pollInterval: 5000, // 5 seconds
    messageLimit: 100
  },
  
  // Local Storage Keys
  storage: {
    projectMapRoot: 'projectMapRoot',
    currentUserId: 'currentUserId'
  },
  
  // Default Values
  defaults: {
    projectName: 'project-map',
    userId: 'user-default',
    rootNodePercentage: 100,
    newNodePercentage: 0
  },
  
  // File Extensions
  fileTypes: {
    json: {
      extensions: ['.json'],
      mimeType: 'application/json'
    }
  },
  
  // API Configuration
  api: {
    endpoints: {
      chat: '/api/chat',
      percentages: '/api/percentages',
      saveAllPercentages: '/api/save-all-percentages',
      saveJSON: '/saveJSON/project-maps/'
    }
  },
  
  // UI Text and Labels
  text: {
    nodeOptions: {
      addChild: 'Add Child Node',
      editProjectName: 'Edit Project Name',
      deleteNode: 'Delete Node',
      renameNode: 'Rename Node',
      editChineseLabel: 'Edit Chinese Label',
      moveNode: 'Move Node (Change Order)',
      editPercentage: 'Edit Percentage',
      openPage: 'Open Page'
    },
    prompts: {
      newNodeLabel: 'Enter label for new node:',
      newNodeLabelEN: 'Enter new label (EN) for this node:',
      newNodeLabelZH: '输入中文标签 (Chinese label) for this node:',
      newPosition: 'Enter new position for this node (1-{max}):',
      percentage: 'Enter percentage (0-100):',
      projectName: 'Enter project name for saving (will be used as filename):',
      editProjectName: 'Enter new project name:'
    },
    errors: {
      invalidPercentage: 'Please enter a number between 0 and 100.',
      invalidJSON: 'Invalid JSON map file!',
      unrecognizedFormat: 'Unrecognized JSON map format: root node must have id:0 and children array',
      percentageManagerInit: 'Error: Could not initialize percentage manager',
      noChangesToSave: 'No percentage changes to save.',
      unsavedChanges: 'You have unsaved percentage changes. Are you sure you want to leave?'
    },
    success: {
      savedToServer: 'Saved to server: project-maps/',
      savedToDownload: 'Saved to local download folder as ',
      percentagesSaved: 'Successfully saved percentages for {count} node(s).',
      noNodesToSave: 'No nodes with children found to save percentages for.',
      autoSaved: 'Auto-saved percentages using sendBeacon'
    }
  }
};

// Utility function to get color shade for a given depth level
ProjectMapConfig.getColorShade = function(level) {
  const { maxLightness, minLightness, maxSaturation, minSaturation, hue } = this.colors;
  
  const lightness = Math.max(minLightness, maxLightness - (level * 8));
  const saturation = Math.min(maxSaturation, minSaturation + (level * 8));
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Make config available globally (for backwards compatibility during transition)
window.ProjectMapConfig = ProjectMapConfig;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProjectMapConfig;
}
