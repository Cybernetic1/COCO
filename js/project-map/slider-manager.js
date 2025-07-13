// Slider management for percentage voting
class ProjectMapSliderManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
  }

  initializeSliders() {
    const sliders = document.querySelectorAll('.slider');
    
    sliders.forEach(slider => {
      slider.addEventListener('input', (event) => {
        this.handleSliderChange(event);
      });
    });
  }

  handleSliderChange(event) {
    const slider = event.target;
    const nodeId = parseInt(slider.dataset.nodeId);
    const childIndex = parseInt(slider.dataset.childIndex);
    const newValue = parseFloat(slider.value);
    
    // Find the node in the tree
    const node = this.dataManager.findNodeById(window.projectMapRoot, nodeId);
    if (!node || !node.children || !node.children[childIndex]) {
      return;
    }
    
    const children = node.children;
    const n = children.length;
    
    // Update the changed child's percentage (convert from 0-1000 to 0-100 and round to 1 decimal)
    const newPercentage = Math.round((newValue / 10.0) * 10) / 10;
    children[childIndex].percentage = newPercentage;
    
    // Calculate what needs to be redistributed
    let currentTotal = 0;
    for (const child of children) {
      currentTotal += (child.percentage || 0);
    }
    
    const surplus = currentTotal - 100.0;
    
    if (n > 1 && Math.abs(surplus) > 0.01) { // Only redistribute if there's a meaningful surplus
      // Calculate total of other children (excluding the one we just changed)
      let otherChildrenTotal = 0;
      for (let j = 0; j < n; j++) {
        if (j !== childIndex) {
          otherChildrenTotal += (children[j].percentage || 0);
        }
      }
      
      // Redistribute proportionally among other children
      for (let j = 0; j < n; j++) {
        if (j !== childIndex) {
          if (otherChildrenTotal > 0.01) {
            // Proportional reduction/increase
            const proportion = (children[j].percentage || 0) / otherChildrenTotal;
            const adjustment = surplus * proportion;
            children[j].percentage = Math.max(0, Math.round((children[j].percentage - adjustment) * 10) / 10);
          } else {
            // If other children are all zero, distribute the surplus equally
            children[j].percentage = Math.max(0, Math.round(((100.0 - newPercentage) / (n - 1)) * 10) / 10);
          }
        }
      }
    }
    
    // Update all sliders and score displays for this node
    this.updateNodeSliders(nodeId);
    
    // Mark as changed for save indication
    if (typeof markProjectMapChanged === 'function') {
      markProjectMapChanged();
    } else if (typeof updateSaveButtonState === 'function') {
      updateSaveButtonState();
    }
  }

  updateNodeSliders(nodeId) {
    const node = this.dataManager.findNodeById(window.projectMapRoot, nodeId);
    if (!node || !node.children) return;
    
    // Update sliders and score displays
    const sliders = document.querySelectorAll(`[data-node-id="${nodeId}"]`);
    sliders.forEach((slider, index) => {
      const childIndex = parseInt(slider.dataset.childIndex);
      if (childIndex < node.children.length) {
        const percentage = node.children[childIndex].percentage || 0;
        slider.value = Math.round(percentage * 10); // Convert to 0-1000 scale
        
        // Update score display with 1 decimal place
        const scoreElement = slider.parentElement.querySelector('.slider-score');
        if (scoreElement) {
          scoreElement.textContent = percentage.toFixed(1) + '%';
        }
      }
    });
  }

  // Update all sliders after data changes (e.g., after loading a file)
  updateAllSliders() {
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => {
      const nodeId = parseInt(slider.dataset.nodeId);
      this.updateNodeSliders(nodeId);
    });
  }
}

// Export for use in main project-map.js
window.ProjectMapSliderManager = ProjectMapSliderManager;
