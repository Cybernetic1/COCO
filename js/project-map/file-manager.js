// File I/O operations for project maps
class ProjectMapFileManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
  }

  readJSONMap() {
    // Prompt for file (simple file input dialog)
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        let raw = e.target.result;
        try {
          const json = JSON.parse(raw);
          this.loadProjectFromJSON(json, file.name);
        } catch (err) {
          alert('Invalid JSON map file!\n' + err);
          // Play failure sound for JSON parsing errors
          if (typeof techFail === 'object' && techFail.play) {
            techFail.play().catch(() => {}); // Ignore audio errors
          }
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  loadProjectFromJSON(json, filename = '') {
    // Assume json is exactly the tree structure (ProjectMapRoot)
    if (typeof json === 'object' && json.id === 0 && Array.isArray(json.children)) {
      // Update both global and window references
      window.projectMapRoot = json;
      
      // Clean up any 'label' properties to keep data structure lean
      if (typeof ProjectMapDataManager !== 'undefined' && ProjectMapDataManager.cleanupNodeLabels) {
        console.log('Cleaning up label properties from loaded data...');
        ProjectMapDataManager.cleanupNodeLabels(window.projectMapRoot);
      }
      
      // Determine project name with proper precedence:
      // 1. JSON's project-name property (highest precedence)
      // 2. filename (extracted from filename)
      // 3. Default fallback
      const filenameWithoutExt = filename.replace(/\.[^/.]+$/, "");
      window.projectName = window.projectMapRoot["project-name"] || filenameWithoutExt || 'project-map';
      
      // If JSON doesn't have project-name but we got it from filename, store it
      if (!window.projectMapRoot["project-name"] && filenameWithoutExt) {
        window.projectMapRoot["project-name"] = filenameWithoutExt;
      }
      
      window.selected_node = null;
      
      // Update page title and header immediately
      document.title = `${window.projectName} - Project Map`;
      const h1Element = document.getElementsByTagName('h1')[0];
      if (h1Element) {
        h1Element.innerHTML = window.projectName;
      }
      
      // Force a complete re-render by triggering the main render function
      console.log('DEBUG loadProjectFromJSON: About to call renderCurrentMap');
      console.log('DEBUG loadProjectFromJSON: New project name:', window.projectName);
      console.log('DEBUG loadProjectFromJSON: New children count:', window.projectMapRoot.children?.length);
      
      if (typeof renderCurrentMap === 'function') {
        renderCurrentMap();
      } else {
        console.warn('renderCurrentMap function not available');
      }
      
      // Save to localStorage as backup
      this.saveMapToLocalStorage();
      
      // Mark as saved since we just loaded fresh data
      if (typeof markProjectMapSaved === 'function') {
        markProjectMapSaved();
      }
      
      // Play sound effect for successful map load
      if (typeof techClick2 === 'object' && techClick2.play) {
        techClick2.play().catch(() => {}); // Ignore audio errors
      }
    } else {
      throw new Error('Unrecognized JSON map format: root node must have id:0 and children array');
    }
  }

  saveJSONMap(filename) {
    console.log('saveJSONMap called with filename:', filename);
    console.log('Current window.projectMapRoot:', window.projectMapRoot);
    
    // Always use projectMapRoot as the data to save
    let defaultName = window.projectName || 
                     window.projectMapRoot["project-name"] || 
                     window.projectMapRoot.labelEN || 
                     'project-map';
    
    console.log('Default name determined:', defaultName);
    
    let saveName = prompt('Enter project name for saving (will be used as filename):', defaultName);
    if (!saveName) {
      console.log('Save cancelled by user');
      return;
    }
    
    console.log('User entered save name:', saveName);
    
    // Sanitize filename
    saveName = saveName.replace(/[^a-zA-Z0-9-_]/g, '_');
    window.projectName = saveName; // Update global projectName
    
    // Store the project name in the root node's project-name property
    window.projectMapRoot["project-name"] = saveName;
    
    const fileName = `${saveName}.json`;
    console.log('Sanitized filename:', fileName);
    
    try {
      const jsonStr = JSON.stringify(window.projectMapRoot, null, 2);
      console.log('JSON serialization successful, length:', jsonStr.length);

      // Debug: log what we're actually saving
      console.log('DEBUG: About to save projectMapRoot:', window.projectMapRoot);
      if (window.projectMapRoot.children && window.projectMapRoot.children.length > 0) {
        console.log('DEBUG: First child before save:', window.projectMapRoot.children[0]);
        console.log('DEBUG: First child percentage before save:', window.projectMapRoot.children[0].percentage);
      }
      console.log('DEBUG: JSON string first 200 chars:', jsonStr.substring(0, 200));

      // Try to save to project-maps/ via server if possible
      console.log('Attempting to save to server...');
      fetch('/saveJSON', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: fileName,
          data: window.projectMapRoot
        })
      })
        .then(r => {
          console.log('Server response status:', r.status, r.statusText);
          if (r.ok) {
            alert('Saved to server: project-maps/' + fileName);
            // Mark as saved when successfully saved to server
            if (typeof markProjectMapSaved === 'function') {
              markProjectMapSaved();
            }
            // Play success sound for successful save
            if (typeof techClick2 === 'object' && techClick2.play) {
              techClick2.play().catch(() => {}); // Ignore audio errors
            }
          } else {
            return r.text().then(t => {
              console.error('Server error response:', t);
              
              // Play failure sound BEFORE showing alert
              if (typeof techFail === 'object' && techFail.play) {
                techFail.play().catch(() => {}); // Ignore audio errors
              }
              
              // Clean up error message - extract meaningful text from HTML response
              let errorMsg = t;
              if (t.includes('<pre>')) {
                // Extract text from HTML error page
                const match = t.match(/<pre>(.*?)<\/pre>/s);
                if (match) {
                  errorMsg = match[1].trim();
                }
              }
              
              alert('Server Error: ' + errorMsg);
            });
          }
        })
        .catch(e => {
          console.log('Network/fetch error:', e);
          
          // Play failure sound for network errors
          if (typeof techFail === 'object' && techFail.play) {
            techFail.play().catch(() => {}); // Ignore audio errors
          }
          
          alert('Network Error: ' + e.message);
        });
    } catch (error) {
      console.error('JSON serialization failed:', error);
      alert('Error: Failed to serialize project data - ' + error.message);
      return;
    }
    
    // Update page title after save
    document.title = window.projectName + ' - Project Map';
    
    // Mark as saved
    if (typeof updateSaveButtonState === 'function') {
      updateSaveButtonState();
    }
  }

  downloadJSON(jsonStr, fileName) {
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    }, 0);
    alert('Saved to local download folder as ' + fileName);
    
    // Mark as saved after download
    if (typeof markProjectMapSaved === 'function') {
      markProjectMapSaved();
    }
    
    // Play success sound for successful download save
    if (typeof techClick2 === 'object' && techClick2.play) {
      techClick2.play().catch(() => {}); // Ignore audio errors
    }
  }

  saveMapToLocalStorage() {
    try {
      localStorage.setItem('projectMapData', JSON.stringify(window.projectMapRoot));
    } catch (err) {
      console.warn('Failed to save to localStorage:', err);
    }
  }

  loadMapFromLocalStorage() {
    try {
      const data = localStorage.getItem('projectMapData');
      if (data) {
        const parsed = JSON.parse(data);
        if (this.dataManager.validateProjectMapData(parsed)) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to load from localStorage:', err);
    }
    return null;
  }

  // Auto-load project map from URL parameter if specified
  autoLoadProjectMap() {
    const urlParams = new URLSearchParams(window.location.search);
    const autoLoad = urlParams.get('autoLoad');
    
    if (autoLoad) {
      // Try to load the specified project
      fetch(`/project-maps/${autoLoad}.json`)
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Project not found');
          }
        })
        .then(json => {
          this.loadProjectFromJSON(json, autoLoad);
        })
        .catch(error => {
          console.warn('Auto-load failed:', error);
          alert(`Failed to auto-load project "${autoLoad}": ${error.message}`);
          // Play failure sound for auto-load errors
          if (typeof techFail === 'object' && techFail.play) {
            techFail.play().catch(() => {}); // Ignore audio errors
          }
        });
    }
  }
}

// Export for use in main project-map.js
window.ProjectMapFileManager = ProjectMapFileManager;
