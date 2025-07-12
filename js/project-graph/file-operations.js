// File Operations Module
// All file I/O operations (save/load graphs, Git operations)
//
// Functions to move here:
// - listJSONfiles()
// - ifRemoteUser()
// - saveJSONgraph()
// - loadJSONgraph()
// - saveGitDir()
// - loadGitDir()
// - saveJSONmap()

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
    // console.log(str);

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
        $.ajax({
            method: "POST",
            url: "/saveJSON/project-graphs/" + name,
            data: str,
            contentType: "application/json",
            success: function(resp) {
                console.log("Save successful:", resp);
                alert("File saved successfully!");
            },
            error: function(xhr, status, error) {
                console.error("Save failed:", status, error, xhr.responseText);
                alert("Save failed: " + error);
            }
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
                network.once('stabilized', function() {
                    setupNetworkEvents(network);
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

    fetch(`/saveJSON/project-maps/${encodeURIComponent(filename)}.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonStr
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
            network.once('stabilized', function() {
                setupNetworkEvents(network);
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
        const saveResponse = await fetch(`/saveJSON/project-graphs/${encodeURIComponent(filename)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: graphData
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
