// Simple server based on Node.js
// ==============================

var http = require("http");
var fs = require("fs");
var url = require("url");
var path = require("path");

function reqHandler(req, res) {

	var fileName = decodeURIComponent(req.url);
	if (fileName === "/")
		fileName = "/index.html";

	// **** Save a JSON file to server's directory
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

	// **** Read a JSON file
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

	// **** Return list of authers in a Git repository
	if (fileName.startsWith("/getGitAuthors/")) {
		res.writeHead(200, {
			"Content-Type"	: "text; charset=utf-8",
			"Cache-Control"	: "no-cache",
			"Connection"	: "keep-alive"
			});

		const { exec } = require("child_process");

		// git: %an = author name, %ae = author email, %s = commit subject
		// exec("git log --pretty='%ae,%an' | uniq", (error, stdout, stderr) => {
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
			console.log("Extracted Git authors:", stdout);
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

var s = http.createServer(reqHandler);
s.listen(8383, "127.0.0.1");

// Beep sound to signify server is being started
var shell = require('child_process').exec;
shell("beep", function(err, stdout, stderr) {});

console.log("Server running at http://127.0.0.1:8383/");
