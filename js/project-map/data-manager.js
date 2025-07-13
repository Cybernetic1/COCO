/**
 * PROJECT MAP DATA MANAGER MODULE
 * 
 * Handles core data operations for the project map tree structure.
 * Manages CRUD operations, tree traversal, and data persistence.
 * 
 * CRITICAL: LABEL PROPERTY STRUCTURE
 * ==================================
 * - ONLY use labelEN and labelZH properties
 * - labelEN: English label (required)
 * - labelZH: Chinese label (optional)
 * - NO 'label' property should exist - keep data structure lean!
 * 
 * @module project-map/data-manager
 */

const ProjectMapDataManager = {
  
  /**
   * Find a node by ID in the tree structure
   * @param {Object} node - Root node to search from
   * @param {number|string} targetId - ID to search for
   * @returns {Object|null} Found node or null
   */
  findNodeById(node, targetId) {
    // Convert both to numbers for comparison to handle string/number mismatch
    const nodeIdNum = typeof node.id === 'string' ? parseInt(node.id, 10) : node.id;
    const targetIdNum = typeof targetId === 'string' ? parseInt(targetId, 10) : targetId;
    
    if (nodeIdNum === targetIdNum) return node;
    
    if (node.children) {
      for (const child of node.children) {
        const found = this.findNodeById(child, targetId);
        if (found) return found;
      }
    }
    
    return null;
  },
  
  /**
   * Find parent and index of a specific node
   * @param {Object} root - Root node to search from
   * @param {number|string} targetId - ID of node to find parent for
   * @returns {Object|null} {parent, index} or null if not found
   */
  findParentAndIndex(root, targetId) {
    if (!root.children) return null;
    
    const idx = root.children.findIndex(child => child.id === targetId);
    if (idx !== -1) return { parent: root, index: idx };
    
    for (let child of root.children) {
      const result = this.findParentAndIndex(child, targetId);
      if (result) return result;
    }
    
    return null;
  },
  
  /**
   * Add a child node to a parent
   * @param {Object} parentNode - Parent node to add child to
   * @param {string} label - English label for the new node
   * @returns {Object} The newly created node
   */
  addChildNode(parentNode, label) {
    if (!parentNode.children) {
      parentNode.children = [];
    }
    
    const newNode = {
      id: Date.now(),
      labelEN: label, // Only use labelEN, no 'label' property
      percentage: ProjectMapConfig.defaults.newNodePercentage,
      children: []
    };
    
    parentNode.children.push(newNode);
    return newNode;
  },
  
  /**
   * Delete a node and reassign its children to parent
   * @param {Object} root - Root of the tree
   * @param {number|string} nodeId - ID of node to delete
   * @returns {boolean} True if node was found and deleted
   */
  deleteNode(root, nodeId) {
    function findAndDelete(parent) {
      if (!parent.children) return false;
      
      const idx = parent.children.findIndex(child => child.id === nodeId);
      if (idx !== -1) {
        // Move node's children to parent
        const nodeToDelete = parent.children[idx];
        if (nodeToDelete.children && nodeToDelete.children.length > 0) {
          parent.children.splice(idx, 1, ...nodeToDelete.children);
        } else {
          parent.children.splice(idx, 1);
        }
        return true;
      }
      
      for (let child of parent.children) {
        if (findAndDelete(child)) return true;
      }
      return false;
    }
    
    return findAndDelete(root);
  },
  
  /**
   * Move a node to a new position within its parent
   * @param {Object} root - Root of the tree
   * @param {number|string} nodeId - ID of node to move
   * @param {number} newPosition - New position (0-based index)
   * @returns {boolean} True if move was successful
   */
  moveNode(root, nodeId, newPosition) {
    const result = this.findParentAndIndex(root, nodeId);
    if (!result) return false;
    
    const { parent, index } = result;
    const maxPos = parent.children.length - 1;
    
    if (newPosition < 0 || newPosition > maxPos || newPosition === index) {
      return false;
    }
    
    // Remove node from current position
    const [movingNode] = parent.children.splice(index, 1);
    // Insert node at new position
    parent.children.splice(newPosition, 0, movingNode);
    
    return true;
  },
  
  /**
   * Update node labels
   * @param {Object} node - Node to update
   * @param {string} labelEN - English label
   * @param {string} labelZH - Chinese label (optional)
   */
  updateNodeLabels(node, labelEN, labelZH = null) {
    if (labelEN) {
      node.label = labelEN;
      node.labelEN = labelEN;
    }
    if (labelZH) {
      node.labelZH = labelZH;
    }
  },
  
  /**
   * Update node percentage
   * @param {Object} node - Node to update
   * @param {number} percentage - New percentage value
   */
  updateNodePercentage(node, percentage) {
    if (percentage >= 0 && percentage <= 100) {
      node.percentage = percentage;
      return true;
    }
    return false;
  },
  
  /**
   * Get the display label for a node based on current language
   * @param {Object} node - Node to get label from
   * @param {string} language - Current language ('EN' or 'ZH')
   * @returns {string} Display label
   */
  getNodeDisplayLabel(node, language = 'EN') {
    if (language === 'ZH' && node.labelZH) {
      return node.labelZH;
    } else if (node.labelEN) {
      return node.labelEN;
    } else {
      // No fallback to 'label' property - only use labelEN/labelZH
      return '';
    }
  },
  
  /**
   * Save project map to localStorage
   * @param {Object} projectMapRoot - Root data to save
   */
  saveToLocalStorage(projectMapRoot) {
    try {
      localStorage.setItem(ProjectMapConfig.storage.projectMapRoot, JSON.stringify(projectMapRoot));
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  },
  
  /**
   * Load project map from localStorage
   * @returns {Object|null} Loaded project map or null
   */
  loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem(ProjectMapConfig.storage.projectMapRoot);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
    return null;
  },
  
  /**
   * Validate project map data structure
   * @param {Object} data - Data to validate
   * @returns {boolean} True if valid
   */
  validateProjectMapData(data) {
    return (
      typeof data === 'object' && 
      data !== null &&
      data.id === 0 && 
      Array.isArray(data.children)
    );
  },
  
  /**
   * Get project name with proper precedence
   * @param {Object} projectMapRoot - Root node
   * @param {string} urlParam - URL parameter value
   * @param {string} fallback - Fallback name
   * @returns {string} Project name
   */
  getProjectName(projectMapRoot, urlParam = null, fallback = null) {
    return projectMapRoot["project-name"] || 
           urlParam || 
           fallback || 
           ProjectMapConfig.defaults.projectName;
  },
  
  /**
   * Set project name in the root node
   * @param {Object} projectMapRoot - Root node
   * @param {string} projectName - New project name
   */
  setProjectName(projectMapRoot, projectName) {
    projectMapRoot["project-name"] = projectName;
  },
  
  /**
   * Walk through all nodes in the tree (depth-first)
   * @param {Object} node - Starting node
   * @param {Function} callback - Function to call for each node (node, depth)
   * @param {number} depth - Current depth (internal use)
   */
  walkNodes(node, callback, depth = 0) {
    callback(node, depth);
    
    if (node.children) {
      for (const child of node.children) {
        this.walkNodes(child, callback, depth + 1);
      }
    }
  },
  
  /**
   * Create a deep copy of the project map data
   * @param {Object} projectMapRoot - Root to copy
   * @returns {Object} Deep copy of the data
   */
  deepCopy(projectMapRoot) {
    return JSON.parse(JSON.stringify(projectMapRoot));
  },
  
  /**
   * Clean up node data by removing 'label' properties to keep structure lean
   * @param {Object} node - Node to clean
   */
  cleanupNodeLabels(node) {
    // Remove 'label' property if it exists - we only want labelEN/labelZH
    if (node.hasOwnProperty('label')) {
      console.log('Removing label property from node ID:', node.id, 'label was:', node.label);
      delete node.label;
    }
    
    // Recursively clean children
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => this.cleanupNodeLabels(child));
    }
  },
};

// Make data manager available globally (for backwards compatibility during transition)
if (typeof window !== 'undefined') {
  window.ProjectMapDataManager = ProjectMapDataManager;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProjectMapDataManager;
}
