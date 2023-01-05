async function help() {
	techClick2.play();
	help_modal.style.display = "block";
	const frame = document.getElementById('helpFrame');
	frame.contentWindow.location.reload();
	}

function resizeIframe(obj) {
	obj.style.height = 0;
	console.log("height:", obj.contentWindow.document.body.scrollHeight);
	obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
}

