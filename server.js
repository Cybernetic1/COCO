// Simple server based on Node.js
// ==============================

const http = require("http");
const fs = require("fs");
const url = require("url");
const path = require("path");
const process = require('process');
const { exec } = require("child_process");
const { readdir } = require("fs/promises");

async function reqHandler(req, res) {

	var fileName = decodeURIComponent(req.url);
	if (fileName === "/")
		fileName = "/index.html";

	// **** Save a JSON file
	if (fileName.startsWith("/saveJSON/")) {
		var fname = path.basename(url.parse(req.url).pathname);

		res.writeHead(200, {
			'Content-Type': 'text/event-stream; charset=utf-8',
			});

		const buffer = [];
		req.on('data', chunk => buffer.push(chunk));
		req.on('end', () => {
			const data = Buffer.concat(buffer);

			// Save to file
			var fs = require('fs');
			var stream = fs.createWriteStream("./projects-data/" + fname, {encoding: 'utf8'});
			stream.once('open', function(fd) {
				stream.write(data);
				stream.end();
				});
			console.log("Saved JSON file:", fname);
			// console.log("log data: " + data);
			// console.log(unescape(encodeURIComponent(data)));
			});
		res.end();
		return;
		}

	// **** load a JSON file
	if (fileName.startsWith("/loadJSON/")) {
		var fname = path.basename(url.parse(req.url).pathname);

		res.writeHead(200, {
			"Content-Type"	: "application/json",
			"Cache-Control"	: "no-cache",
			"Connection"	: "keep-alive"
			});

		fs.readFile("projects-data/" + fname, "utf-8", function (err, data) {
			if (err) {
				console.log(err);
				return err;
				}
			res.end(data, "utf-8");
			console.log("Loaded JSON file:", fname);
			});
		return;
		}

	// **** save a project as a dir-structure, from project graph JSON
	if (fileName.startsWith("/saveDir/")) {
		var rootDirName = path.basename(url.parse(req.url).pathname);

		res.writeHead(200, {
			'Content-Type': 'text/event-stream; charset=utf-8',
			});

		const buffer = [];
		req.on('data', chunk => buffer.push(chunk));
		req.on('end', () => {
			data = JSON.parse(Buffer.concat(buffer));

			// Save to dir -- it should be the same dir every time
			// as there may be other project files in the dirs
			// 1. if root-dir not exist create it:
			if (!fs.existsSync(rootDirName)) {
				fs.mkdirSync(rootDirName);
				}

			// 2. for each node, if not exists create sub-dir
			data.nodes.forEach( node => {
				const subDirName = rootDirName + '/' + node.id.toString();
				if (!fs.existsSync(subDirName)) {
					fs.mkdirSync(subDirName);
					}

				// 3. write node details to "node-data.txt"
				var stream = fs.createWriteStream(`${subDirName}/node-data.txt`, {encoding: 'utf8'});
				stream.once('open', function(fd) {
					// pretty JSON spacing level = 2
					stream.write(JSON.stringify(node, null, 2));
					stream.end();
					});

				} );

			// 4. write edges to "edges-data.json"
			var stream = fs.createWriteStream(`${rootDirName}/edges-data.json`, {encoding: 'utf8'});
			stream.once('open', function(fd) {
				// JSON spacing level = 1
				stream.write(JSON.stringify(data.edges, null, 1));
				stream.end();
				});

			console.log("Saved project graph to directory:", rootDirName);
			});
		res.end();
		return;
		}

	// **** read a project dir and return as JSON file
	// must use synchronous read
	if (fileName.startsWith("/loadDir/")) {
		var rootDirName = path.basename(url.parse(req.url).pathname);

		res.writeHead(200, {
			"Content-Type"	: "application/json",
			"Cache-Control"	: "no-cache",
			"Connection"	: "keep-alive"
			});

		var data = {};
		data.nodes = [];

		// **** Read all nodes from directory and create data.nodes object
		// 1. read root-node file "node-data.txt" and fill in details
		function get1Node(subdir) {
			const details = fs.readFileSync(`${rootDirName}/${subdir}/node-data.txt`, "utf-8");
			const node = JSON.parse(details);
			data.nodes.push(node);
			}

		// 2. for each sub-dir, do the same:
		fs.readdirSync( rootDirName, { withFileTypes: true } )
			.filter(dirent => dirent.isDirectory())
			.map(dirent => get1Node(dirent.name));	// recurse ∀ sub-dirs

		// 3. read edges data file and fill in details
		const edges = fs.readFileSync(`${rootDirName}/edges-data.json`, "utf-8");
		data.edges = JSON.parse(edges);
		
		res.end(JSON.stringify(data), "utf-8");
		console.log("Loaded dir as JSON");
		return;
		}

	// **** Return a list of files in directory
	if (fileName.startsWith("/fileList/")) {
		fs.readdir("./projects-data/", (err, files) => {
			if (err) {
				console.log(err);
				return err;
				}
			console.log("JSON files list =", typeof(files), files);
			res.writeHead(200, {"Content-Type": "application/json"});
			res.end(JSON.stringify(files), "utf-8");
			});
		return;
		}

	// **** Return a list of project directories
	if (fileName.startsWith("/dirList/")) {
		var dirs = (await readdir("./", { withFileTypes: true }))
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name)
			.filter(name => name.endsWith(".data"))
		console.log("Dir list =", dirs);
		res.writeHead(200, {"Content-Type": "application/json"});
		res.end(JSON.stringify(dirs), "utf-8");
		return;
		}

	// **** Return list of authers in a Git repository
	if (fileName.startsWith("/getGitAuthors/")) {
		res.writeHead(200, {
			"Content-Type"	: "text/event-stream; charset=utf-8",
			"Cache-Control"	: "no-cache",
			"Connection"	: "keep-alive"
			});

		const { exec } = require("child_process");

		// git: %an = author name, %ae = author email, %s = commit subject
		exec("git log --pretty='%ae,%an'", (error, stdout, stderr) => {
			if (error) {
				console.log(`error: ${error.message}`);
				return;
			}
			if (stderr) {
				console.log(`stderr: ${stderr}`);
				return;
			}
			res.end(stdout, "utf-8");
			console.log("Extracted Git authors.");
		});
		return;
		}

	// ************* Process the reading of various file types ****************

	fileName = "./" + fileName;

	fileTypes = {
		".html" : ["text/html"				, "utf-8"],
		".css"	: ["text/css"				, "utf-8"],
		".js"   : ["application/javascript" , "utf-8"],
		".map"	: ["application/javascript" , "utf-8"],
		".json" : ["application/json"		, "utf-8"],
		".ogg"  : ["audio/ogg"				, "base64"],
		".wav"  : ["audio/wav"				, "base64"],
		".ico"  : ["image/x-icon"			, "base64"],
		".jpg"  : ["image/jpg"				, "base64"],
		".png"  : ["image/png"				, "base64"],
		".gif"  : ["image/gif"				, "base64"],
		};

	// Remove the cache-preventer suffix that begins with a '?'
	fileName = fileName.split('?')[0];
	// console.log("filename =", fileName);
	var ext = path.extname(fileName);
	if (ext in fileTypes) {
		fs.exists(fileName, function(exists) {
			if (exists) {
				fs.readFile(fileName, fileTypes[ext][1], function(error, content) {
					if (error) {
						res.writeHead(500);
						res.end();
					} else {
						res.writeHead(200, {"Content-Type": fileTypes[ext][0]});
						res.end(content, fileTypes[ext][1]);
						}
					});
			} else {
				res.writeHead(404);
				res.end();
				}
			});
		return; }

	// All failed:
	res.writeHead(404);
	res.end();
	}

const s = http.createServer(reqHandler);

// Determine if server is local or remote
const os = require("os");
var address = "127.0.0.1";
if (os.hostname() == 'VM-12-17-centos')		// Sherry's brother's hostname
	address = "0.0.0.0";

s.listen(8383, address, () => {
	console.log('Server running at', s.address());
	} );

if (address == "127.0.0.1") {
	// Beep sound to signify local server is being started
	var shell = require('child_process').exec;
	shell("beep", function(err, stdout, stderr) {});
	}

/*
// Clean filename of any unwanted chars
// allowing Chinese chars etc to remain
// (This function is unused and has buggy RegEx syntax)
function clean_name(name) {
	const regex = RegExp('[/\\?%*:|\"<>\x7F\x00-\x1F]', 'g');
	var result = "";
		for (let ch of name) {
			if (regex.exec(ch)[0] == null)
				result += ch;
			else
				result += '%' + ('0' + ch.charCodeAt(0).toString(16).toUpperCase()).slice(-2);
	return result;
	}
*/
