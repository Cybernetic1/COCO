/**
 * FILE OPERATIONS MODULE
 * 
 * Handles all file I/O operations including JSON persistence, Git integration, 
 * and automatic project loading. Manages communication with the Express.js server
 * for saving and loading project graph data.
 * 
 * RESPONSIBILITIES:
 * - JSON file save/load operations with server endpoints
 * - Git directory integration for version control
 * - Automatic project loading from URL parameters
 * - File listing and management for load/save dialogs
 * - Remote user detection and handling
 * - Project graph persistence and restoration
 * - Network reconstruction after loading data
 * 
 * KEY FEATURES:
 * - Auto-loading: Automatically loads project graphs based on URL ?projectName parameter
 * - Git integration: Save/load graphs as Git directory structures
 * - File management: Lists available JSON files for user selection
 * - Remote support: Detects remote users and enables ID postfix for testing
 * - Network rebuilding: Properly reconstructs network visualization after data load
 * - Error handling: Graceful fallbacks when files are not found
 * 
 * DEPENDENCIES:
 * - Global: network, nodes, edges, data, options, viz (network visualization)
 * - Global: projectName (current project identifier)
 * - jQuery: For AJAX operations ($)
 * - Functions: init_nodes(), update_node_index(), setupNetworkEvents()
 * - Functions: updateChineseNameSectionVisibility() from ui-operations.js
 * - Server endpoints: /saveJSON, /loadJSON, /fileList, /saveGitDir, /loadGitDir
 * - DOM: Modal elements (json_modal, git_modal)
 * 
 * EXPORTS:
 * - autoLoadProjectGraph(): Loads project from URL parameter
 * - initializeAutoLoad(): DOM ready initialization function
 * - listJSONfiles(): Populates file dropdown menus
 * - saveJSONgraph(): Saves current graph to JSON file
 * - loadJSONgraph(): Loads graph from selected JSON file
 * - saveGitDir(): Saves graph as Git directory structure
 * - loadGitDir(): Loads graph from Git directory
 * - ifRemoteUser(): Detects and handles remote users
 * 
 * USAGE:
 * Auto-initializes on DOM ready. Provides file operations for user actions
 * and automatic loading based on URL parameters.
 * 
 * @author Your Name
 * @version 1.0
 * @since 2025-01-13
 */

// Auto-load project graph from URL parameter
function autoLoadProjectGraph() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectNameParam = urlParams.get('projectName');
    
    if (projectNameParam) {
        // Construct the JSON file path
        const jsonFilePath = `/loadJSON/project-graphs/${encodeURIComponent(projectNameParam)}.json`;
        
        // Try to fetch and load the JSON file
        $.ajax({
            method: "GET",
            url: jsonFilePath,
            cache: false,
            success: function(data0) {
                if (data0 && data0.nodes && data0.edges) {
                    // Destroy existing network if it exists
                    if (typeof network !== 'undefined' && network) {
                        network.destroy();
                    }
                    
                    // Load the new data
                    nodes = new vis.DataSet(data0.nodes);
                    edges = new vis.DataSet(data0.edges);
                    data.nodes = nodes;
                    data.edges = edges;
                    init_nodes();
                    // No longer change root node id; only projectId property is set on save
                    network = new vis.Network(viz, data, options);
                    update_node_index();
                    network.once('afterDrawing', function() {
                        setTimeout(function() {
                            if (typeof setupNetworkEvents === 'function') {
                                setupNetworkEvents(network);
                            }
                        }, 100);
                    });
                    
                    // Update project name and UI
                    projectName = projectNameParam;
                    document.title = `${projectName} - Project Graph`;
                    const h1Element = document.getElementsByTagName('h1')[0];
                    if (h1Element) {
                        h1Element.innerHTML = projectName;
                    }
                    
                    console.log(`Auto-loaded project graph: ${projectNameParam}`);
                }
            },
            error: function(xhr, status, error) {
                console.warn(`Could not auto-load project graph for "${projectNameParam}":`, status, error);
                // Fall back to default behavior - empty graph will be shown
            }
        });
    }
}

// Initialize auto-loading and other file operations on DOM ready
function initializeAutoLoad() {
    $(document).ready(function() {
        // Initialize keyboard event listeners first
        if (typeof initializeKeyboardEvents === 'function') {
            initializeKeyboardEvents();
        }
        
        // Then handle auto-loading
        autoLoadProjectGraph();
        
        // Initialize Chinese name section visibility
        updateChineseNameSectionVisibility("");
    });
}

// Make function globally available
window.initializeAutoLoad = initializeAutoLoad;

// Auto-initialize when this module loads
initializeAutoLoad();

// Populate dropdown menu with JSON file found in directory
function listJSONfiles() {
    let dropDown = document.getElementById("JSONdropDown");
    dropDown.replaceChildren();		// clear all options

    function addOption(value, text) {
        const option = document.createElement("option");
        option.value = value;
        option.text = text;
        dropDown.appendChild(option);
        }

    addOption("none", "---");
    $.ajax({
        method: "GET",
        url: "/fileList/",
        success: function (files) {
            // console.log(typeof(files), files);
            files.forEach( file => {
                if (!file.endsWith('.json'))
                    return;
                file = file.slice(0,-5);
                addOption(file, file);
                } );
            } });
    }

// Check if user is local or remote
function ifRemoteUser() {
    if (location.hostname === "localhost" ||
        location.hostname === "127.0.0.1")
        return;
    const div = document.getElementById("remote-user");
    div.style.display = "block";
    div.childNodes[1].innerText = "You're on machine: " + location.hostname;
    }

async function saveJSONgraph() {

    // Enforce convention: add projectId property to root node (id: 0)
    let projectId = typeof projectName !== 'undefined' ? projectName : (window.projectName || 'project-graph');
    let allNodes = nodes.get();
    let rootNode = allNodes.find(n => n.id === 0);
    if (rootNode) {
        // Add or update projectId property
        rootNode.projectId = projectId;
        nodes.update(rootNode);
    }

    // For all nodes:
    var str = "{\"nodes\":[";
    nodes.forEach(function(n) {
        const nodeCopy = Object.assign({}, n);
        delete nodeCopy['label']; // only save labelEN and labelZH
        str += JSON.stringify(nodeCopy);
        str += ",";
    });
    str = str.slice(0,-1) + "],";

    // For all edges:
    str += "\"edges\":[";
    edges.forEach(function(e) {
        const edgeCopy = Object.assign({}, e);
        // Keep the edge ID and color information
        str += JSON.stringify(edgeCopy);
        str += ",";
    });
    str = str.slice(0,-1) + "]}";

    // Open modal window and ask for filename
    json_modal.style.display = "block";
    techClick2.play();
    listJSONfiles(); // Direct call - simple and clear
    ifRemoteUser();
    document.getElementById("json_modal_OK").onclick = function() {
        var name = document.getElementById("JSONdropDown").value;
        if (name === "none")
            name = document.getElementById("JSONfileName").value;

        const remoteUser = document.querySelector(
            'input[name="remoteUser"]:checked');
        const tag = remoteUser ? remoteUser.value : "";
        if (name.endsWith(".json"))
            name = name.slice(0,-5) + tag + ".json";
        else if (name.endsWith(tag))
            name = name + ".json";
        else
            name = name + tag + ".json";
        console.log("Saving file:", name);
        fetch('/saveJSON', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filename: "project-graphs/" + name,
                data: JSON.parse(str)
            })
        })
        .then(r => {
            if (r.ok) {
                alert('File saved successfully!');
                return r.json();
            } else {
                return r.text().then(t => { throw new Error(t); });
            }
        })
        .then(resp => {
            console.log("Save successful:", resp);
        })
        .catch(error => {
            console.error("Save failed:", error);
            alert("Save failed: " + error);
        });

        json_modal.style.display = "none";		// close window
        techClick2.play();
        };
    
    // Also handle Enter key in filename input
    document.getElementById("JSONfileName").addEventListener('keyup', function(event) {
        if (event.key === "Enter") {
            document.getElementById("json_modal_OK").click();
        }
    });
    }

async function loadJSONgraph() {
    // Open modal window and ask for filename
    json_modal.style.display = "block";
    techClick2.play();
    listJSONfiles(); // Direct call - simple and clear
    ifRemoteUser();
    
    // Set up the OK button to handle loading
    document.getElementById("json_modal_OK").onclick = function() {
        var name = document.getElementById("JSONdropDown").value;
        if (name === "none")
            name = document.getElementById("JSONfileName").value;

        const remoteUser = document.querySelector(
            'input[name="remoteUser"]:checked');
        const tag = remoteUser ? remoteUser.value : "";
        if (name.endsWith(".json"))
            name = name.slice(0,-5) + tag + ".json";
        else if (name.endsWith(tag))
            name = name + ".json";
        else
            name = name + tag + ".json";
        
        console.log("Loading file:", name);
        $.ajax({
            method: "GET",
            url: "/loadJSON/project-graphs/" + name,
            cache: false,
            success: function(data0) {
                network.destroy();
                nodes = new vis.DataSet(data0.nodes);
                edges = new vis.DataSet(data0.edges);
                data.nodes = nodes;
                data.edges = edges;
                init_nodes();
                network = new vis.Network(viz, data, options);
                update_node_index();
                network.once('afterDrawing', function() {
                    setTimeout(function() {
                        if (typeof setupNetworkEvents === 'function') {
                            setupNetworkEvents(network);
                        }
                    }, 100);
                });

                // Update project name from loaded filename
                const filenameWithoutExt = name.replace(/\.[^/.]+$/, "").replace(/-[a-zA-Z0-9]+$/, ""); // Remove extension and user tag
                projectName = filenameWithoutExt || 'project-graph';
                document.title = `${projectName} - Project Graph`;
                const h1Element = document.getElementsByTagName('h1')[0];
                if (h1Element) {
                  h1Element.innerHTML = projectName;
                }

                json_modal.style.display = "none";
                techClick2.play();
            },
            error: function(xhr, status, error) {
                console.error("Load failed:", status, error, xhr.responseText);
                alert("Load failed: " + error);
            }
        });
    };
    
    // Also handle Enter key in filename input
    document.getElementById("JSONfileName").addEventListener('keyup', function(event) {
        if (event.key === "Enter") {
            document.getElementById("json_modal_OK").click();
        }
    });
}

// --- Save project data as a JSON "map" file in tree format to server-side project-maps/ directory ---
function saveJSONmap() {
    // Convert graph format to tree format for project-map.js
    
    // 1. Build children map from edges (only non-auxiliary edges)
    const childrenMap = {};
    edges.forEach(function(edge) {
        const dashes = edge.dashes === true;
        if (!dashes) { // Only include tree edges, not auxiliary edges
            if (!childrenMap[edge.to]) childrenMap[edge.to] = [];
            childrenMap[edge.to].push(edge.from);
        }
    });
    
    // 2. Find root node (should be id: 0)
    const rootNode = nodes.get(0);
    if (!rootNode) {
        alert('Error: No root node found (id: 0)');
        return;
    }
    
    // 3. Convert to tree structure recursively
    function convertToTree(nodeId) {
        const node = nodes.get(nodeId);
        if (!node) return null;
        
        const treeNode = {
            id: node.id,
            label: node.labelEN || node.label || `Node ${node.id}`,
            percentage: 0 // Default percentage for project-map.js
        };
        
        // Add bilingual support
        if (node.labelEN) treeNode.labelEN = node.labelEN;
        if (node.labelZH) treeNode.labelZH = node.labelZH;
        
        // Add other properties if they exist
        if (node.status) treeNode.status = node.status;
        if (node.details) treeNode.details = node.details;
        
        // Add children recursively
        const childIds = childrenMap[nodeId] || [];
        treeNode.children = childIds.map(childId => convertToTree(childId)).filter(Boolean);
        
        return treeNode;
    }
    
    // 4. Convert starting from root - this becomes the top-level object
    const treeData = convertToTree(0);
    if (!treeData) {
        alert('Error: Could not convert graph to tree format');
        return;
    }
    
    const filename = prompt('Enter filename for the map (without .json):', 'project-name');
    if (!filename) return;
    const jsonStr = JSON.stringify(treeData, null, 2);

    fetch('/saveJSON', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            filename: `project-graphs/${filename}.json`,
            data: JSON.parse(jsonStr)
        })
    })
    .then(r => r.ok ? alert('Map saved to server in tree format!') : r.text().then(t => alert('Error: ' + t)))
    .catch(e => alert('Network error: ' + e));
}


async function saveGitDir() {
    // Currently disallow remote users to write directly to global Git dir
    if (!(location.hostname === "localhost" ||
             location.hostname === "127.0.0.1"))
        return;

    // For all nodes:
    var str = "{\"nodes\":[";
    nodes.forEach(function(n) {
        const nodeCopy = Object.assign({}, n);
        delete nodeCopy['label'];		// only save labelEN and labelZH
        str += JSON.stringify(nodeCopy);
        str += ",";
        });
    str = str.slice(0,-1) + "],";

    // For all edges:
    str += "\"edges\":[";
    edges.forEach(function(e) {
        const edgeCopy = Object.assign({}, e);
        // Keep the edge ID and color information
        str += JSON.stringify(edgeCopy);
        str += ",";
        });
    str = str.slice(0,-1) + "]}";
    console.log(str);
    techClick2.play();

    // Open modal window and ask for filename
    git_modal.style.display = "block";
    document.getElementById("git_modal_OK").onclick = function() {
        var name = document.getElementById("gitDropDown").value;
        if (name == "none")
            name = document.getElementById("gitFileName").value;
        $.ajax({
            method: "POST",
            url: "/saveDir/" + name,
            data: str,
            success: function(resp) {}
            });

        git_modal.style.display = "none";		// close window
        techClick2.play();
        };
    }

// **** read Project Graph from current Git directory
async function loadGitDir() {
    // Open modal window and ask for filename
    git_modal.style.display = "block";
    // Populate dropdown menu with JSON filenames:
    let dropDown = document.getElementById("gitDropDown");
    dropDown.replaceChildren();		// clear all options
    $.ajax({
        method: "GET",
        url: "/dirList/",
        success: function (dirs) {
            // console.log(typeof(files), files);
            dirs.forEach( dir => {
                var option = document.createElement("option");
                option.value = dir;
                option.text = dir;
                dropDown.appendChild(option);
                } );
            } });
    techClick2.play();
    // Wait for modal window to be clicked OK, then do:
    document.getElementById("git_modal_OK").onclick = function () {

        var dir = document.getElementById("gitDropDown").value;
        if (dir == "none")
            dir = document.getElementById("gitFileName").value;

        $.ajax({
                method: "GET",
                url: "/loadDir/" + dir,
                cache: false,
                success: function(data0) {

            network.destroy();
            nodes = new vis.DataSet(data0.nodes);
            edges = new vis.DataSet(data0.edges);
            data.nodes = nodes;
            data.edges = edges;
            init_nodes();		// set lang, colors, ... from existing data
            network = new vis.Network(viz, data, options);
            update_node_index();
            network.once('afterDrawing', function() {
                setTimeout(function() {
                    if (typeof setupNetworkEvents === 'function') {
                        setupNetworkEvents(network);
                    }
                }, 100);
            });

            git_modal.style.display = "none";		// close window
            techClick2.play();
            } });
        };
    }


// Save graph to database as a new project
async function saveGraphToDatabase() {
    // Check if user is authenticated
    try {
        const userResponse = await fetch('/user-info');
        const userInfo = await userResponse.json();
        if (!userInfo.loggedIn) {
            alert('You must be logged in to save projects to the database.');
            return;
        }
    } catch (error) {
        alert('Error checking authentication. Please try again.');
        return;
    }

    // Get project name (using current global projectName as default)
    const defaultName = projectName || 'Untitled Project';
    const projectNameInput = prompt('Enter project name:', defaultName);
    if (!projectNameInput || !projectNameInput.trim()) {
        return; // User cancelled or entered empty name
    }
    
    const finalProjectName = projectNameInput.trim();
    
    // Get optional description
    const description = prompt('Enter project description (optional):', '') || '';
    
    // Create JSON data from current graph
    var graphData = "{\"nodes\":[";
    nodes.forEach(function(n) {
        const nodeCopy = Object.assign({}, n);
        delete nodeCopy['label']; // only save labelEN and labelZH
        graphData += JSON.stringify(nodeCopy);
        graphData += ",";
    });
    graphData = graphData.slice(0,-1) + "],";

    graphData += "\"edges\":[";
    edges.forEach(function(e) {
        const edgeCopy = Object.assign({}, e);
        graphData += JSON.stringify(edgeCopy);
        graphData += ",";
    });
    graphData = graphData.slice(0,-1) + "]}";
    
    // Generate filename for the JSON file
    const sanitizedName = finalProjectName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filename = `${sanitizedName}.json`;
    
    try {
        // Step 1: Save JSON file to project-graphs directory
        console.log('Saving JSON file:', filename);
        const saveResponse = await fetch('/saveJSON', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filename: `project-graphs/${filename}`,
                data: JSON.parse(graphData)
            })
        });
        
        if (!saveResponse.ok) {
            throw new Error(`Failed to save JSON file: ${saveResponse.status} ${saveResponse.statusText}`);
        }
        
        console.log('JSON file saved successfully');
        
        // Step 2: Create project entry in database
        console.log('Creating project in database');
        const projectResponse = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                name: finalProjectName,
                description: description,
                sourceFilename: filename
            })
        });
        
        if (!projectResponse.ok) {
            const errorText = await projectResponse.text();
            throw new Error(`Failed to create project: ${projectResponse.status} ${errorText}`);
        }
        
        const projectResult = await projectResponse.json();
        console.log('Project created successfully:', projectResult);
        
        // Update global project name
        projectName = finalProjectName;
        document.title = `${projectName} - Project Graph`;
        const h1Element = document.getElementsByTagName('h1')[0];
        if (h1Element) {
            h1Element.innerHTML = projectName;
        }
        
        // Success message
        alert(`Project "${finalProjectName}" saved successfully!\n\n` +
              `- JSON file: project-graphs/${filename}\n` +
              `- Database ID: ${projectResult.id}\n\n` +
              `The project is now available in "My Projects" and can be joined by other users.`);
        
        techClick2.play().catch(() => {}); // Play success sound
        
    } catch (error) {
        console.error('Error saving project to database:', error);
        alert(`Error saving project: ${error.message}\n\nPlease try again.`);
        techFail.play().catch(() => {}); // Play error sound
    }
}

// Make functions global
window.saveGraphToDatabase = saveGraphToDatabase;
