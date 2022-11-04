// Vote Slider -- Javascript to force sum of votes = 100%
// =============== Non-integer version ===================

var sliders2 = document.getElementsByClassName("slider2");
var outputs2 = document.getElementsByClassName("score2");

var scores2 = [];
var max_j = 6;

// **** Initialize sliders values
for (var j = 0; sliders2[j]; j++) {
	scores2[j] = 1000.0 / max_j;
	sliders2[j].value = Math.round(scores2[j]);
	outputs2[j].innerHTML = (scores2[j] / 10.0).toFixed(2);
}

var total2 = 0.0;
for (var j = 0; j < max_j; j++)
	total2 += scores2[j];
// console.log("total2 =", total2 / 10.0);
document.getElementById("total2").innerHTML = (total2 / 10.0).toFixed(2);

// **** Update the current slider value (each time you drag the slider handle)
for (const s of sliders2)
	s.oninput = function() {
		var k = parseInt(this.id)				// get slider number
		scores2[k] = parseFloat(this.value);
		outputs2[k].innerHTML = parseFloat(scores2[k] / 10.0);

		// Calculate surplus value
		var subtotal = 0;
		for (var j = 0; j < max_j; j++)
			subtotal += scores2[j];
		// console.log("subtotal = " + subtotal.toString());
		var surplus = 1000.0 - subtotal;
		// console.log("surplus = " + surplus.toString());
		var adjustment = surplus / (max_j - 1);
		// console.log("adjustment = " + adjustment.toString());

		// ***** Distribute surplus to all members,
		//	except the moved one (which has to remain in that position)
		var remainder = surplus;			// This will eventually be the rounding error
		const h = max_j - 1;
		const b = subtotal - scores2[k];
		for (var j = 0; j < max_j; j++)
			if (j != k) {
				if (b < 1e-5)
					adjustment = (1000.0 - scores2[k]) / h;
				else
					// The below formula is correct because ∑_k scores[k] / b = 1
					adjustment = surplus * scores2[j] / b;
				remainder -= adjustment;
				scores2[j] += adjustment;
				}
		// console.log("remainder = ", remainder);

		// update the HTML elements
		for (var j = 0; j < max_j; j++) {
			if (j != k) {
				sliders2[j].value = Math.round(scores2[j]);
				outputs2[j].innerHTML = parseFloat(scores2[j] / 10.0).toFixed(2);
				}
			}

		// **** Display finalized total
		var total = 0.0;
		for (var j = 0; j < max_j; j++)
			total += scores2[j];
		document.getElementById("total2").innerHTML = parseFloat(total / 10.0).toFixed(2);
		};
