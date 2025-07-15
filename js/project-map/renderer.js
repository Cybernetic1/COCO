// UI and rendering functionality for project map
class ProjectMapRenderer {
  constructor(config) {
    this.config = config;
    this.currentLanguage = 'EN';
  }

  switchLanguage() {
    this.currentLanguage = (this.currentLanguage === 'EN') ? 'ZH' : 'EN';
    return this.currentLanguage;
  }

  getColorShade(level) {
    return this.config.getColorShade(level);
  }

  getNodeDisplayLabel(node, language) {
    // Use the data manager's utility function
    return ProjectMapDataManager.getNodeDisplayLabel(node, language || this.currentLanguage);
  }

  renderMap(node, depth = 0, options = {}) {
    const { onNodeEdit, onAddChild, onDeleteNode, onPercentageEdit, selectedNode } = options;
    
    const el = document.createElement('div');
    el.className = 'map-node';
    el.style.background = this.getColorShade(depth);
    
    // Highlight if selected (compare by id)
    if (selectedNode && selectedNode.id === node.id) {
      el.style.border = '4px solid ' + this.config.colors.selectedNodeBorder;
      el.style.background = this.config.colors.selectedNodeBackground;
    }
    
    // Show only one language label at a time
    let label = this.getNodeDisplayLabel(node, this.currentLanguage);

    // Create a node as a container
    const labelDiv = document.createElement('div');
    labelDiv.textContent = label;
    labelDiv.style.display = 'block';
    labelDiv.style.marginBottom = '2px';
    labelDiv.style.paddingRight = '28px'; // Prevent label from overspilling menuBtn
    labelDiv.style.wordBreak = 'break-word'; // Allow wrapping
    el.appendChild(labelDiv);

    // Add dropdown menu button
    const menuBtn = document.createElement('button');
    menuBtn.textContent = '☰';
    menuBtn.title = 'Node options';
    menuBtn.style.position = 'absolute';
    menuBtn.style.top = '4px';
    menuBtn.style.right = '6px';
    menuBtn.style.color = this.config.colors.menuButtonColor;
    menuBtn.style.background = 'transparent';
    menuBtn.style.border = 'none';
    menuBtn.style.cursor = 'pointer';
    menuBtn.style.zIndex = 2;
    
    menuBtn.onclick = (e) => {
      e.stopPropagation();
      this.showNodeMenu(e, node, menuBtn, { onNodeEdit, onAddChild, onDeleteNode, onPercentageEdit });
    };
    el.appendChild(menuBtn);

    // Add percentage number display (for numeric mode)
    if (node.percentage !== undefined && depth > 0) { // Don't show on root node
      const percentageNumber = document.createElement('div');
      percentageNumber.className = 'percentage-number';
      percentageNumber.textContent = (node.percentage || 0).toFixed(1) + '%';
      el.appendChild(percentageNumber);
    }

    // Create percentage/slider display section
    if (node.children && node.children.length > 0) {
      const sliderContainer = this.createSliderContainer(node);
      el.appendChild(sliderContainer);
    }

    // Add a small tube to root node's lower-right corner indicating "money in"
    if (depth === 0) {
      el.style.position = 'relative';
      const protrusion = this.createRootProtrusion(depth);
      el.appendChild(protrusion);
    }

    // Add children (recursive rendering)
    if (node.children && node.children.length > 0) {
      const childrenContainer = document.createElement('div');
      childrenContainer.className = 'map-children';
      
      for (const child of node.children) {
        childrenContainer.appendChild(this.renderMap(child, depth + 1, options));
      }
      el.appendChild(childrenContainer);
    }

    return el;
  }

  createSliderContainer(node) {
    // Node has children - show sliders for each child
    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'slider-container';
    
    // Create sliders for each child
    node.children.forEach((child, index) => {
      const slidecontainer = document.createElement('div');
      slidecontainer.className = 'slidecontainer';
      
      // Child name
      const nameElement = document.createElement('div');
      nameElement.className = 'slider-name';
      nameElement.textContent = child.labelEN || `Child ${child.id}`;
      slidecontainer.appendChild(nameElement);
      
      // Slider
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = this.config.slider.min.toString();
      slider.max = this.config.slider.max.toString();
      slider.value = (child.percentage || 0) * 10; // Convert from % to 0-1000 scale
      slider.className = 'slider';
      slider.dataset.childIndex = index;
      slider.dataset.nodeId = node.id;
      slidecontainer.appendChild(slider);
      
      // Score display
      const scoreElement = document.createElement('div');
      scoreElement.className = 'slider-score';
      const percentageValue = child.percentage || 0;
      console.log('DEBUG: Displaying percentage for child', child.labelEN, ':', percentageValue);
      scoreElement.textContent = percentageValue.toFixed(1) + '%';
      slidecontainer.appendChild(scoreElement);
      
      sliderContainer.appendChild(slidecontainer);
    });
    
    return sliderContainer;
  }

  createRootProtrusion(depth) {
    const protrusion = document.createElement('div');
    protrusion.style.position = 'absolute';
    protrusion.style.width = '28px';
    protrusion.style.height = '50px';
    protrusion.style.right = '20px';
    protrusion.style.bottom = '-50px';
    protrusion.style.background = this.getColorShade(0);
    protrusion.style.border = '4px solid #CCC';
    protrusion.style.borderTop = '0px';
    protrusion.style.borderBottom = '0px';
    
    // Add bold dollar sign
    const dollar = document.createElement('p');
    dollar.innerHTML = '↑<br>$';
    dollar.style.fontWeight = 'bold';
    dollar.style.fontSize = '1.3em';
    dollar.style.color = '#AAA';
    dollar.style.position = 'absolute';
    dollar.style.bottom = '-12px';
    dollar.style.right = '6px';
    protrusion.appendChild(dollar);
    
    return protrusion;
  }

  showNodeMenu(event, node, menuBtn, callbacks) {
    const { onNodeEdit, onAddChild, onDeleteNode, onPercentageEdit } = callbacks;
    
    // Remove any existing menus first
    const existingMenus = document.querySelectorAll('.node-context-menu');
    existingMenus.forEach(menu => {
      if (document.body.contains(menu)) {
        document.body.removeChild(menu);
      }
    });
    
    // Show dropdown menu
    let menu = document.createElement('div');
    menu.className = 'node-context-menu'; // Add class for easier cleanup
    menu.style.position = 'absolute';
    menu.style.background = '#fff';
    menu.style.border = '1px solid #ccc';
    menu.style.zIndex = 1000;
    menu.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    menu.style.padding = '4px 0';
    menu.style.minWidth = '140px';
    menu.style.borderRadius = '4px';
    
    // Position menu near button
    const rect = menuBtn.getBoundingClientRect();
    menu.style.left = (rect.right + window.scrollX) + 'px';
    menu.style.top = (rect.bottom + window.scrollY) + 'px';

    // Add 'Add Child Node' option
    const addChild = document.createElement('div');
    addChild.textContent = 'Add Child Node';
    addChild.style.padding = '4px 4px';
    addChild.style.cursor = 'pointer';
    addChild.style.borderBottom = '1px solid #eee';
    addChild.onmouseover = () => addChild.style.background = '#f0f0f0';
    addChild.onmouseout = () => addChild.style.background = '';
    addChild.onclick = () => {
      this.removeContextMenu(menu);
      if (onAddChild) onAddChild(node);
    };
    menu.appendChild(addChild);

    // Add 'Edit Node' option
    const editNode = document.createElement('div');
    editNode.textContent = 'Edit Node Label';
    editNode.style.padding = '4px 4px';
    editNode.style.cursor = 'pointer';
    editNode.style.borderBottom = '1px solid #eee';
    editNode.onmouseover = () => editNode.style.background = '#f0f0f0';
    editNode.onmouseout = () => editNode.style.background = '';
    editNode.onclick = () => {
      console.log('Edit Node clicked for node:', node);
      this.removeContextMenu(menu);
      if (onNodeEdit) {
        console.log('Calling onNodeEdit callback');
        onNodeEdit(node);
      } else {
        console.error('onNodeEdit callback not provided');
      }
    };
    menu.appendChild(editNode);

    // Add 'Edit Percentage' option
    const editPercent = document.createElement('div');
    editPercent.textContent = 'Edit Percentage';
    editPercent.style.padding = '4px 4px';
    editPercent.style.cursor = 'pointer';
    editPercent.style.borderBottom = '1px solid #eee';
    editPercent.onmouseover = () => editPercent.style.background = '#f0f0f0';
    editPercent.onmouseout = () => editPercent.style.background = '';
    editPercent.onclick = () => {
      this.removeContextMenu(menu);
      if (onPercentageEdit) onPercentageEdit(node);
    };
    menu.appendChild(editPercent);

    // Add 'Open Node's Page' option
    const openNodePage = document.createElement('div');
    openNodePage.textContent = 'Open Node\'s Page';
    openNodePage.style.padding = '4px 4px';
    openNodePage.style.cursor = 'pointer';
    openNodePage.style.borderBottom = '1px solid #eee';
    openNodePage.onmouseover = () => openNodePage.style.background = '#f0f0f0';
    openNodePage.onmouseout = () => openNodePage.style.background = '';
    openNodePage.onclick = () => {
      this.removeContextMenu(menu);
      // Save current map data to localStorage as projectData before opening node-page
      try {
        const projectId = (typeof projectMapRoot.projectId !== 'undefined') ? projectMapRoot.projectId : (projectMapRoot.id || 'project-map');
        const projectData = {
          dataType: 'map',
          projectId: projectId,
          data: projectMapRoot
        };
        localStorage.setItem('projectData', JSON.stringify(projectData));
      } catch (e) { console.error('Failed to save projectData before opening node-page:', e); }
      window.open(`node-page.html?id=${node.id}`, '_blank');
    };
    menu.appendChild(openNodePage);

    // Add 'Delete Node' option (if not root)
    if (node.id !== 0) {
      const deleteNode = document.createElement('div');
      deleteNode.textContent = 'Delete Node';
      deleteNode.style.padding = '4px 4px';
      deleteNode.style.cursor = 'pointer';
      deleteNode.style.color = '#d00';
      deleteNode.onmouseover = () => deleteNode.style.background = '#f0f0f0';
      deleteNode.onmouseout = () => deleteNode.style.background = '';
      deleteNode.onclick = () => {
        this.removeContextMenu(menu);
        if (onDeleteNode) onDeleteNode(node);
      };
      menu.appendChild(deleteNode);
    }

    // Store reference for cleanup
    menu.dataset.menuId = Date.now();

    // Function to remove menu when clicking elsewhere
    const removeMenuHandler = (ev) => {
      if (menu && !menu.contains(ev.target) && !menuBtn.contains(ev.target)) {
        this.removeContextMenu(menu);
        document.removeEventListener('click', removeMenuHandler);
      }
    };
    
    // Add click listener after a short delay to prevent immediate closing
    setTimeout(() => {
      document.addEventListener('click', removeMenuHandler);
    }, 10);

    // Add escape key handler
    const escapeHandler = (ev) => {
      if (ev.key === 'Escape') {
        this.removeContextMenu(menu);
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);

    document.body.appendChild(menu);
  }

  // Helper method to properly remove context menu
  removeContextMenu(menu) {
    if (menu && document.body.contains(menu)) {
      try {
        document.body.removeChild(menu);
        console.log('Context menu removed successfully');
      } catch (error) {
        console.warn('Error removing context menu:', error);
      }
    }
  }

  renderCurrentMap(projectMapRoot, containerId, options = {}) {
    console.log('DEBUG renderer.renderCurrentMap: Project name:', projectMapRoot["project-name"]);
    console.log('DEBUG renderer.renderCurrentMap: Children count:', projectMapRoot.children?.length);
    
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Container not found:', containerId);
      return;
    }
    
    container.innerHTML = '';
    container.appendChild(this.renderMap(projectMapRoot, 0, options));
  }
}

// Export for use in main project-map.js
window.ProjectMapRenderer = ProjectMapRenderer;
