// Modal management for node editing
// 
// CRITICAL: LABEL PROPERTY HANDLING
// =================================
// - ONLY use labelEN and labelZH properties
// - labelEN: English label (required)
// - labelZH: Chinese label (optional)  
// - NO 'label' property should exist - keep data structure lean!
//
class ProjectMapModalManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.initializeModalEvents();
  }

  initializeModalEvents() {
    // Set up modal event listeners immediately
    const setupEvents = () => {
      console.log('Setting up modal event listeners...');
      
      const saveBtn = document.getElementById('modal-save-btn');
      const cancelBtn = document.getElementById('modal-cancel-btn');
      const overlay = document.getElementById('modal-overlay');
      const labelInput = document.getElementById('modal-node-label');

      if (saveBtn) {
        console.log('Binding save button');
        // Remove any existing listeners first
        saveBtn.onclick = null;
        saveBtn.onclick = () => {
          console.log('Save button clicked');
          this.saveModalChanges();
        };
      } else {
        console.warn('Save button not found');
      }
      
      if (cancelBtn) {
        console.log('Binding cancel button');
        cancelBtn.onclick = null;
        cancelBtn.onclick = () => {
          console.log('Cancel button clicked');
          this.hideNodeModal();
        };
      } else {
        console.warn('Cancel button not found');
      }
      
      if (overlay) {
        console.log('Binding overlay click');
        // Remove existing onclick to avoid conflicts
        overlay.onclick = null;
        overlay.onclick = () => {
          console.log('Overlay clicked');
          this.hideNodeModal();
        };
      } else {
        console.warn('Overlay not found');
      }
      
      // Add Enter key support for the input field
      if (labelInput) {
        console.log('Binding input key events');
        // Remove existing listeners
        labelInput.onkeypress = null;
        labelInput.onkeydown = null;
        
        labelInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            console.log('Enter key pressed in input');
            this.saveModalChanges();
          }
        });
        
        labelInput.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            console.log('Escape key pressed in input');
            this.hideNodeModal();
          }
        });
      } else {
        console.warn('Label input not found');
      }
    };

    // If DOM is already loaded, set up events immediately
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupEvents);
    } else {
      setupEvents();
    }
  }

  showNodeModal(node) {
    console.log('showNodeModal called for node:', node);
    console.log('Node ID:', node.id, 'Type:', typeof node.id);
    console.log('Node labelEN:', node.labelEN);
    
    const modal = document.getElementById('node-modal');
    const labelInput = document.getElementById('modal-node-label');
    const overlay = document.getElementById('modal-overlay');
    
    if (!modal || !labelInput || !overlay) {
      console.error('Modal elements not found:', { modal: !!modal, labelInput: !!labelInput, overlay: !!overlay });
      
      // Fallback to simple prompt if modal elements are missing
      const newLabel = prompt('Enter new node label:', node.labelEN || '');
      if (newLabel && newLabel.trim()) {
        // Only update labelEN property - no 'label' property should exist
        node.labelEN = newLabel.trim();
        
        // Trigger re-render if available
        if (typeof renderCurrentMap === 'function') {
          renderCurrentMap();
        }
        
        // Mark as changed for save indication
        if (typeof markProjectMapChanged === 'function') {
          markProjectMapChanged();
        }
        
        // Play success sound
        if (typeof techClick2 === 'object' && techClick2.play) {
          techClick2.play().catch(() => {}); // Ignore audio errors
        }
      }
      return;
    }

    console.log('Setting modal values and showing...');
    // Only use labelEN - no fallback to 'label' property
    labelInput.value = node.labelEN || '';
    modal.style.display = 'block';
    modal.dataset.nodeId = String(node.id); // Ensure it's a string
    overlay.style.display = 'block';
    
    console.log('Modal dataset nodeId set to:', modal.dataset.nodeId);
    
    // Focus on the input field
    setTimeout(() => {
      labelInput.focus();
      labelInput.select(); // Select all text for easy editing
    }, 100);
    
    console.log('Modal should now be visible');
  }

  hideNodeModal() {
    console.log('hideNodeModal called');
    
    const modal = document.getElementById('node-modal');
    const overlay = document.getElementById('modal-overlay');
    const labelInput = document.getElementById('modal-node-label');
    
    if (modal) {
      modal.style.display = 'none';
      modal.dataset.nodeId = ''; // Clear the node ID
      console.log('Modal hidden');
    }
    
    if (overlay) {
      overlay.style.display = 'none';
      console.log('Overlay hidden');
    }
    
    if (labelInput) {
      labelInput.value = ''; // Clear the input
      console.log('Input cleared');
    }
  }

  saveModalChanges() {
    console.log('saveModalChanges called');
    
    const modal = document.getElementById('node-modal');
    const labelInput = document.getElementById('modal-node-label');
    
    if (!modal || !labelInput) {
      console.error('Modal elements not found for saving:', { modal: !!modal, labelInput: !!labelInput });
      return;
    }

    const nodeIdStr = modal.dataset.nodeId;
    const nodeId = parseInt(nodeIdStr, 10);
    const newLabel = labelInput.value.trim();
    
    console.log('Modal dataset nodeId:', nodeIdStr, 'Parsed nodeId:', nodeId, 'Type:', typeof nodeId);
    console.log('Attempting to save node', nodeId, 'with new label:', newLabel);
    console.log('Current window.projectMapRoot:', window.projectMapRoot);
    
    if (isNaN(nodeId)) {
      console.error('Invalid node ID:', nodeIdStr);
      alert('Error: Invalid node ID');
      return;
    }
    
    if (!newLabel) {
      alert('Node label cannot be empty');
      // Play failure sound for validation error
      if (typeof techFail === 'object' && techFail.play) {
        techFail.play().catch(() => {}); // Ignore audio errors
      }
      return;
    }

    // Find the node and update its label
    const node = this.dataManager.findNodeById(window.projectMapRoot, nodeId);
    console.log('Search result for node ID', nodeId, ':', node);
    
    if (node) {
      console.log('Found node, updating labelEN from', node.labelEN, 'to', newLabel);
      
      const oldLabel = node.labelEN;
      
      // Only update labelEN property - no 'label' property should exist
      node.labelEN = newLabel;
      
      console.log('Node updated successfully. Old:', oldLabel, 'New labelEN:', node.labelEN);
      
      console.log('Node updated successfully. Old:', oldLabel, 'New:', node.labelEN);
      
      // Hide modal first
      this.hideNodeModal();
      
      // Play success sound
      if (typeof techClick2 === 'object' && techClick2.play) {
        techClick2.play().catch(() => {}); // Ignore audio errors
      }
      
      // Mark as changed for save indication
      if (typeof markProjectMapChanged === 'function') {
        markProjectMapChanged();
        console.log('Project marked as changed');
      } else if (typeof updateSaveButtonState === 'function') {
        updateSaveButtonState();
        console.log('Save button state updated');
      }
      
      // Trigger re-render - try multiple ways to ensure it works
      console.log('Triggering re-render...');
      if (typeof renderCurrentMap === 'function') {
        renderCurrentMap();
        console.log('renderCurrentMap called');
      }
      
      // Also trigger global re-render if available
      if (window.renderCurrentMap && typeof window.renderCurrentMap === 'function') {
        window.renderCurrentMap();
        console.log('window.renderCurrentMap called');
      }
      
      // Force update the display
      const mapContainer = document.getElementById('map-container');
      if (mapContainer) {
        console.log('Forcing map container refresh');
        // Trigger a small visual update to force re-render
        mapContainer.style.opacity = '0.99';
        setTimeout(() => {
          mapContainer.style.opacity = '1';
        }, 10);
      } else {
        console.warn('map-container element not found');
      }
      
      console.log('Node label updated successfully and UI should be refreshed');
    } else {
      console.error('Node not found for ID:', nodeId);
      console.log('Available nodes in root:');
      if (window.projectMapRoot) {
        console.log('Root node ID:', window.projectMapRoot.id);
        if (window.projectMapRoot.children) {
          window.projectMapRoot.children.forEach((child, index) => {
            console.log(`Child ${index}: ID=${child.id}, label=${child.label}`);
          });
        }
      }
      alert('Error: Could not find node to update');
      
      // Play failure sound
      if (typeof techFail === 'object' && techFail.play) {
        techFail.play().catch(() => {}); // Ignore audio errors
      }
    }
  }

  // Show percentage edit modal/prompt
  showPercentageModal(node) {
    const currentPercentage = node.percentage != null ? node.percentage : 0;
    const newValue = prompt(
      ProjectMapConfig.text.prompts.percentage, 
      currentPercentage
    );
    
    if (newValue !== null) {
      const numValue = parseFloat(newValue);
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
        const oldPercentage = node.percentage || 0;
        node.percentage = Math.round(numValue * 10) / 10; // Round to 1 decimal
        
        // Rescale sibling nodes to maintain 100% total
        this.rescaleSiblingPercentages(node, oldPercentage, node.percentage);
        
        // Mark as changed for save indication
        if (typeof markProjectMapChanged === 'function') {
          markProjectMapChanged();
        }
        
        // Trigger re-render if available
        if (typeof renderCurrentMap === 'function') {
          renderCurrentMap();
        }
        
        // Update save button state
        if (typeof updateSaveButtonState === 'function') {
          updateSaveButtonState();
        }
      } else {
        alert('Please enter a valid percentage between 0 and 100');
        // Play failure sound for validation error
        if (typeof techFail === 'object' && techFail.play) {
          techFail.play().catch(() => {}); // Ignore audio errors
        }
      }
    }
  }

  /**
   * Rescale sibling node percentages to maintain 100% total
   * @param {Object} editedNode - The node that was edited
   * @param {number} oldPercentage - Previous percentage value
   * @param {number} newPercentage - New percentage value
   */
  rescaleSiblingPercentages(editedNode, oldPercentage, newPercentage) {
    // Find the parent and siblings
    const parentInfo = this.dataManager.findParentAndIndex(window.projectMapRoot, editedNode.id);
    if (!parentInfo || !parentInfo.parent.children || parentInfo.parent.children.length <= 1) {
      return; // No siblings to rescale
    }
    
    const siblings = parentInfo.parent.children;
    const otherSiblings = siblings.filter(sibling => sibling.id !== editedNode.id);
    
    // Calculate current total of other siblings
    let otherSiblingsTotal = otherSiblings.reduce((sum, sibling) => sum + (sibling.percentage || 0), 0);
    
    // Calculate the remaining percentage for other siblings
    const remainingPercentage = 100 - newPercentage;
    
    if (remainingPercentage < 0) {
      // If new percentage is > 100, set others to 0
      otherSiblings.forEach(sibling => {
        sibling.percentage = 0;
      });
      return;
    }
    
    if (remainingPercentage === 0) {
      // If new percentage is 100, set all others to 0
      otherSiblings.forEach(sibling => {
        sibling.percentage = 0;
      });
      return;
    }
    
    if (otherSiblingsTotal === 0) {
      // If all other siblings were 0, distribute remaining equally
      const equalShare = remainingPercentage / otherSiblings.length;
      otherSiblings.forEach(sibling => {
        sibling.percentage = Math.round(equalShare * 10) / 10;
      });
    } else {
      // Proportionally rescale other siblings
      const scaleFactor = remainingPercentage / otherSiblingsTotal;
      otherSiblings.forEach(sibling => {
        const currentPercentage = sibling.percentage || 0;
        sibling.percentage = Math.round(currentPercentage * scaleFactor * 10) / 10;
      });
    }
    
    console.log(`Rescaled siblings: edited node ${editedNode.id} from ${oldPercentage}% to ${newPercentage}%, remaining ${remainingPercentage}% distributed among ${otherSiblings.length} siblings`);
  }
}

// Export for use in main project-map.js
window.ProjectMapModalManager = ProjectMapModalManager;
