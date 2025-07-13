// Modal management for node editing
class ProjectMapModalManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.initializeModalEvents();
  }

  initializeModalEvents() {
    // Set up modal event listeners when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
      const saveBtn = document.getElementById('modal-save-btn');
      const cancelBtn = document.getElementById('modal-cancel-btn');
      const overlay = document.getElementById('modal-overlay');

      if (saveBtn) {
        saveBtn.onclick = () => this.saveModalChanges();
      }
      
      if (cancelBtn) {
        cancelBtn.onclick = () => this.hideNodeModal();
      }
      
      if (overlay) {
        overlay.onclick = () => this.hideNodeModal();
      }
    });
  }

  showNodeModal(node) {
    const modal = document.getElementById('node-modal');
    const labelInput = document.getElementById('modal-node-label');
    const overlay = document.getElementById('modal-overlay');
    
    if (!modal || !labelInput || !overlay) {
      console.error('Modal elements not found');
      return;
    }

    labelInput.value = node.label || '';
    modal.style.display = 'block';
    modal.dataset.nodeId = node.id;
    overlay.style.display = 'block';
    
    // Focus on the input field
    setTimeout(() => labelInput.focus(), 100);
  }

  hideNodeModal() {
    const modal = document.getElementById('node-modal');
    const overlay = document.getElementById('modal-overlay');
    
    if (modal) modal.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
  }

  saveModalChanges() {
    const modal = document.getElementById('node-modal');
    const labelInput = document.getElementById('modal-node-label');
    
    if (!modal || !labelInput) {
      console.error('Modal elements not found for saving');
      return;
    }

    const nodeId = parseInt(modal.dataset.nodeId);
    const newLabel = labelInput.value.trim();
    
    if (!newLabel) {
      alert('Node label cannot be empty');
      return;
    }

    // Find the node and update its label
    const node = this.dataManager.findNodeById(window.projectMapRoot, nodeId);
    if (node) {
      node.label = newLabel;
      node.labelEN = newLabel; // Also update English label
      
      this.hideNodeModal();
      
      // Trigger re-render if available
      if (typeof renderCurrentMap === 'function') {
        renderCurrentMap();
      }
      
      // Mark as changed for save indication
      if (typeof markProjectMapChanged === 'function') {
        markProjectMapChanged();
      } else if (typeof updateSaveButtonState === 'function') {
        updateSaveButtonState();
      }
    } else {
      console.error('Node not found for ID:', nodeId);
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
        node.percentage = Math.round(numValue * 10) / 10; // Round to 1 decimal
        
        // Trigger re-render if available
        if (typeof renderCurrentMap === 'function') {
          renderCurrentMap();
        }
        
        // Mark as changed for save indication
        if (typeof updateSaveButtonState === 'function') {
          updateSaveButtonState();
        }
      } else {
        alert('Please enter a valid percentage between 0 and 100');
      }
    }
  }
}

// Export for use in main project-map.js
window.ProjectMapModalManager = ProjectMapModalManager;
