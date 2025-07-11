/**
 * PERCENTAGE MANAGER
 * 
 * Handles saving and loading user-specific percentage assignments for project nodes.
 * Provides basic persistence with localStorage and server API integration.
 * 
 * Features:
 * - User-specific percentage storage
 * - Graph version tracking
 * - Basic orphaned data detection
 * - Graceful fallback to current state
 */

class PercentageManager {
    constructor(projectId, userId) {
        this.projectId = projectId;
        this.userId = userId;
        this.apiBaseUrl = '/api'; // Configure as needed
        this.localStorageKey = `percentages_${projectId}_${userId}`;
        this.currentGraphVersion = this.generateGraphVersion();
    }

    /**
     * Generate a simple graph version based on current graph structure
     */
    generateGraphVersion() {
        try {
            const graphData = JSON.stringify(window.projectMapRoot);
            // Simple hash of graph structure
            let hash = 0;
            for (let i = 0; i < graphData.length; i++) {
                const char = graphData.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            return `v${Math.abs(hash)}`;
        } catch (error) {
            return `v${Date.now()}`;
        }
    }

    /**
     * Save percentages for a specific node's children
     */
    async savePercentages(nodeId, childPercentages) {
        const percentageData = {
            userId: this.userId,
            projectName: this.projectId,
            nodeId: nodeId,
            childPercentages: childPercentages,
            graphVersion: this.currentGraphVersion,
            timestamp: Date.now()
        };

        try {
            // Save to server API first
            const serverSuccess = await this.saveToServer(percentageData);
            
            if (serverSuccess) {
                // Also save to localStorage as backup
                this.saveToLocalStorage(nodeId, percentageData);
                console.log('Percentages saved to server for node:', nodeId);
                return true;
            } else {
                throw new Error('Server save failed');
            }
            
        } catch (error) {
            console.error('Failed to save percentages to server:', error);
            
            // Fallback to localStorage only
            try {
                this.saveToLocalStorage(nodeId, percentageData);
                console.log('Percentages saved to localStorage (fallback) for node:', nodeId);
                alert('Warning: Saved to local storage only. Server connection failed.');
                return true;
            } catch (localError) {
                console.error('Failed to save to localStorage too:', localError);
                this.preserveCurrentState(nodeId, childPercentages);
                alert('Error: Failed to save percentages. Data preserved locally.');
                return false;
            }
        }
    }

    /**
     * Load percentages for a specific node
     */
    async loadPercentages(nodeId) {
        try {
            // Try to load from server first
            const serverData = await this.loadFromServer(nodeId);
            if (serverData && serverData.found) {
                // Check if graph version matches
                if (serverData.graphVersion !== this.currentGraphVersion) {
                    console.warn('Graph version mismatch detected for node:', nodeId);
                    
                    // TODO: Implement recovery logic
                    const recoveredData = await this.attemptRecovery(nodeId, serverData);
                    if (recoveredData) {
                        return recoveredData.childPercentages;
                    }
                    
                    // Fallback: alert user and use current state
                    this.alertVersionMismatch(nodeId);
                    return this.getCurrentNodePercentages(nodeId);
                }
                
                return serverData.childPercentages;
            }
            
            // Fallback to localStorage if server fails
            const localData = this.loadFromLocalStorage(nodeId);
            if (localData) {
                console.log('Loaded percentages from localStorage (fallback) for node:', nodeId);
                
                // Check version mismatch for local data too
                if (localData.graphVersion !== this.currentGraphVersion) {
                    this.alertVersionMismatch(nodeId);
                    return this.getCurrentNodePercentages(nodeId);
                }
                
                return localData.childPercentages;
            }
            
            // Final fallback to current percentages in the graph
            return this.getCurrentNodePercentages(nodeId);
            
        } catch (error) {
            console.error('Failed to load percentages:', error);
            
            // Try localStorage as final fallback
            const localData = this.loadFromLocalStorage(nodeId);
            if (localData) {
                console.log('Using localStorage as final fallback for node:', nodeId);
                return localData.childPercentages;
            }
            
            // Preserve current state and alert user
            const currentPercentages = this.getCurrentNodePercentages(nodeId);
            alert('Warning: Could not load saved percentages. Using current values.');
            return currentPercentages;
        }
    }

    /**
     * Save to localStorage
     */
    saveToLocalStorage(nodeId, percentageData) {
        try {
            let allPercentages = {};
            const existing = localStorage.getItem(this.localStorageKey);
            if (existing) {
                allPercentages = JSON.parse(existing);
            }
            
            allPercentages[nodeId] = percentageData;
            localStorage.setItem(this.localStorageKey, JSON.stringify(allPercentages));
            
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            throw error;
        }
    }

    /**
     * Load from localStorage
     */
    loadFromLocalStorage(nodeId) {
        try {
            const data = localStorage.getItem(this.localStorageKey);
            if (!data) return null;
            
            const allPercentages = JSON.parse(data);
            return allPercentages[nodeId] || null;
            
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return null;
        }
    }

    /**
     * Get current percentages from the graph structure
     */
    getCurrentNodePercentages(nodeId) {
        try {
            const node = this.findNodeById(window.projectMapRoot, parseInt(nodeId));
            if (!node || !node.children) return [];
            
            return node.children.map(child => ({
                childId: child.id.toString(),
                percentage: child.percentage || 0
            }));
            
        } catch (error) {
            console.error('Failed to get current percentages:', error);
            return [];
        }
    }

    /**
     * Find node by ID in the tree
     */
    findNodeById(node, targetId) {
        if (node.id === targetId) return node;
        
        if (node.children) {
            for (const child of node.children) {
                const found = this.findNodeById(child, targetId);
                if (found) return found;
            }
        }
        
        return null;
    }

    /**
     * Preserve current state when save fails
     */
    preserveCurrentState(nodeId, childPercentages) {
        try {
            const fallbackData = {
                nodeId: nodeId,
                childPercentages: childPercentages,
                preservedAt: Date.now(),
                graphVersion: this.currentGraphVersion
            };
            
            localStorage.setItem(`fallback_${this.localStorageKey}_${nodeId}`, JSON.stringify(fallbackData));
            console.log('Current state preserved for node:', nodeId);
            
        } catch (error) {
            console.error('Failed to preserve current state:', error);
        }
    }

    /**
     * Alert user about version mismatch
     */
    alertVersionMismatch(nodeId) {
        const message = `Warning: The project structure has changed since percentages were last saved for node ${nodeId}. Using current values. Please review and re-save if needed.`;
        alert(message);
        console.warn('Version mismatch for node:', nodeId);
    }

    /**
     * Get all saved percentages for the current project/user
     */
    getAllSavedPercentages() {
        try {
            const data = localStorage.getItem(this.localStorageKey);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Failed to get all saved percentages:', error);
            return {};
        }
    }

    /**
     * Clear all saved percentages for the current project/user
     */
    clearAllPercentages() {
        try {
            localStorage.removeItem(this.localStorageKey);
            console.log('All percentages cleared for project:', this.projectId);
            return true;
        } catch (error) {
            console.error('Failed to clear percentages:', error);
            return false;
        }
    }

    // ===========================================
    // TODO: RECOVERY AND SERVER API METHODS
    // ===========================================

    /**
     * TODO: Attempt to recover percentages after graph structure change
     */
    async attemptRecovery(nodeId, oldData) {
        // TODO: Implement recovery logic
        // - Try to match nodes by path
        // - Try to match nodes by content similarity
        // - Provide user with recovery options
        console.log('TODO: Implement recovery for node:', nodeId, 'with data:', oldData);
        return null;
    }

    /**
     * Save percentages to server
     */
    async saveToServer(percentageData) {
        try {
            const response = await fetch('/api/percentages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectName: percentageData.projectName,
                    nodeId: percentageData.nodeId,
                    childPercentages: percentageData.childPercentages,
                    graphVersion: percentageData.graphVersion
                })
            });
            
            if (!response.ok) {
                throw new Error(`Server response: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('Server save result:', result);
            return result.success;
            
        } catch (error) {
            console.error('Server save error:', error);
            return false;
        }
    }

    /**
     * Load percentages from server
     */
    async loadFromServer(nodeId) {
        try {
            const url = `/api/percentages?projectName=${encodeURIComponent(this.projectId)}&nodeId=${encodeURIComponent(nodeId)}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`Server response: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('Server load result for node', nodeId, ':', result);
            return result;
            
        } catch (error) {
            console.error('Server load error:', error);
            return null;
        }
    }

    /**
     * Sync local data with server
     */
    async syncWithServer() {
        try {
            // Get all saved percentages from server
            const url = `/api/percentages/all?projectName=${encodeURIComponent(this.projectId)}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`Server response: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('Server sync result:', result);
            
            // Update localStorage with server data
            if (result.percentages && result.percentages.length > 0) {
                let allPercentages = {};
                
                result.percentages.forEach(nodeData => {
                    const percentageData = {
                        userId: this.userId,
                        projectName: this.projectId,
                        nodeId: nodeData.nodeId,
                        childPercentages: nodeData.childPercentages,
                        graphVersion: nodeData.graphVersion,
                        timestamp: new Date(nodeData.updatedAt).getTime()
                    };
                    allPercentages[nodeData.nodeId] = percentageData;
                });
                
                localStorage.setItem(this.localStorageKey, JSON.stringify(allPercentages));
                console.log('Local storage updated with server data');
            }
            
            return true;
            
        } catch (error) {
            console.error('Sync error:', error);
            return false;
        }
    }
}

// Export for use in other modules
window.PercentageManager = PercentageManager;
