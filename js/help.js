// When user clicks help button:
async function help() {
	techClick2.play();
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
	snowDrawing();
	}

function snowDrawing() {
	const img1 = new Image(); img1.src = 'images/tree2.png';
	const img2 = new Image(); img2.src = 'images/tree1.png';
	const img3 = new Image(); img3.src = 'images/cloud.png';
	const img4 = new Image(); img4.src = 'images/rabbit.png';

	setTimeout(() => {
	const canvas = document.getElementById("helpCanvas");
	const ctx = canvas.getContext("2d");
	const helpDiv = document.getElementById("helpDiv");
	helpDiv.style.backgroundColor = "transparent";
	const width = helpDiv.offsetWidth - 4;
	const height = helpDiv.offsetHeight - 4;
	canvas.style.width = width + 'px';
	canvas.style.height = height + 'px';
	const scale = 3; //window.devicePixelRatio; 1 would be blurry.
	canvas.width = width * scale;
	canvas.height = height * scale;
	ctx.scale(scale, scale);

	ctx.fillStyle = "#c8dcdd";	// 天空
	ctx.fillRect(0, 0, helpDiv.offsetWidth, helpDiv.offsetHeight);

	const sd = 50;			// 制造随机波动
	function gitter(x) {
		return x + Math.floor(Math.random() * sd * 2) - sd;
		}

	ctx.drawImage(img3, gitter(0.3*width), gitter(10));	// 云

	ctx.beginPath();		// 地平线，啡色
	ctx.moveTo(0, gitter(150));
	ctx.lineTo(0, height);
	ctx.lineTo(width, height);
	ctx.lineTo(width, gitter(170));
	ctx.quadraticCurveTo(gitter(280), gitter(100), gitter(200), gitter(150));
	ctx.quadraticCurveTo(gitter(100), gitter(160), 0, gitter(150));
	ctx.fillStyle = "#deeaea";
	ctx.fill();

	ctx.drawImage(img2, gitter(0.8*width), gitter(100)); // 树2
	ctx.drawImage(img1, gitter(0.9*width), gitter(95));  // 树1

	ctx.beginPath();		// 地平线，白色
	ctx.moveTo(0, gitter(175));
	ctx.lineTo(0, height);
	ctx.lineTo(width, height);
	ctx.lineTo(width, gitter(160));
	ctx.quadraticCurveTo(gitter(380), gitter(170), gitter(330), gitter(180));
	ctx.quadraticCurveTo(gitter(075), gitter(140), 0, gitter(175));
	ctx.fillStyle = "#FFF";
	ctx.fill();

	ctx.fillStyle = "#FFF";	// 落雪
	for (var i = 0; i < 15; ++i) {
		var x = Math.floor(Math.random() * width);
		var y = Math.floor(Math.random() * 190);
		ctx.moveTo(x, y);
		ctx.arc(x, y, 5, 0, Math.PI * 2, true);
		ctx.fill();
		}

	ctx.drawImage(img4, gitter(0.7*width), gitter(160));	// 兔子
	}, 2000);
	}

// This is called on iFrame loading
function resizeIframe(obj) {
	obj.style.height = 0;
	// console.log("height:", obj.contentWindow.document.body.scrollHeight);
	obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
}
