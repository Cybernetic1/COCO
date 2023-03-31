// **** When user clicks help button:
async function help() {
	help_modal.style.display = "block";
	// Important to reload it, to get correct height and language:
	const frame = document.getElementById('helpFrame');
	// console.log("current src=", frame.src);
	// **** If you want the original help0 page be restored after
	// navigating away from it... the following works:
	// frame.src += "";
	// **** But if you want to stay in the current help sub-page,
	// use this instead:
	frame.contentWindow.location.reload();
	}

// **** This is called on iFrame loading
function resizeIframe(obj) {
	techClick2.play().catch(function (error) {
		// console.log("cannot play sound without user click first");
		});
	obj.style.height = 0;
	// console.log("height:", obj.contentWindow.document.body.scrollHeight);
	obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
	snowDrawing();
}

const tree1 = new Image(); tree1.src = 'images/tree1.png';
const tree2 = new Image(); tree2.src = 'images/tree2.png';
const cloud = new Image(); cloud.src = 'images/cloud.png';
const rabbit = new Image(); rabbit.src = 'images/rabbit.png';

// **** This function is purely for decoration and entertainment
function snowDrawing() {
	const canvas = document.getElementById("helpCanvas");
	const ctx = canvas.getContext("2d");
	const helpDiv = document.getElementById("helpDiv");
	helpDiv.style.backgroundColor = "transparent";
	const W = helpDiv.offsetWidth - 4;		// width
	const H = helpDiv.offsetHeight - 4;		// height
	canvas.style.width = W + 'px';
	canvas.style.height = H + 'px';
	const scale = 3; //window.devicePixelRatio; 1 would be blurry.
	canvas.width = W * scale;
	canvas.height = H * scale;
	ctx.scale(scale, scale);

	ctx.fillStyle = "#c8dcdd";	// Sky, blue-greyish
	ctx.fillRect(0, 0, helpDiv.offsetWidth, helpDiv.offsetHeight);

	// create random gitter, sd ≈ deviation
	function r(x, sd = 100) {
		return x + Math.floor(Math.random() * sd * 2) - sd;
		}

	const chance = Math.random();
	if (chance > 0.5)
		ctx.drawImage(cloud, r(0.4*W, 400), r(0,50)); // cloud

	ctx.beginPath();		// land horizon, brown
	ctx.lineTo(0, H);		// starts @ lower-left corner
	ctx.lineTo(W, H);
	ctx.lineTo(W, r(0.5*H,10));
	ctx.quadraticCurveTo(r(0.4*W), r(0.5*H,10), r(0.3*W), r(0.5*H,10));
	ctx.quadraticCurveTo(r(0.2*W), r(0.5*H,10), 0, r(0.5*H,10));
	ctx.fillStyle = "#deeaea";
	ctx.fill();

	if (chance < 0.5) {
		ctx.drawImage(tree2, r(0.6*W), r(0.5*H,50)); // tree 2
		ctx.drawImage(tree1, r(0.8*W), r(0.5*H,50)); // tree 1
		}

	ctx.beginPath();		// snow horizon, white
	ctx.lineTo(0, H);		// starts @ lower-left corner
	ctx.lineTo(W, H);
	ctx.lineTo(W, r(.85*H,10));
	ctx.quadraticCurveTo(r(.8*W), r(.9*H,10), r(.6*W), r(.9*H,10));
	ctx.quadraticCurveTo(r(0.1*W), r(0.85*H,5), 0, r(.85*H,10));
	ctx.fillStyle = "#FFF";
	ctx.fill();

	ctx.fillStyle = "#FFF";	// snow fall
	for (var i = 0; i < 20; ++i) {
		var x = Math.floor(Math.random() * W);
		var y = Math.floor(Math.random() * 0.7*H);
		ctx.moveTo(x, y);
		ctx.arc(x, y, 5, 0, Math.PI * 2, true);
		ctx.fill();
		}

	// rabbit
	ctx.drawImage(rabbit, r(0.7*W, 500), r(.8*H));
	}
