// Vote Slider -- Javascript to force sum of votes = 100%
// =============== Non-integer version ===================

const sliders = document.getElementsByClassName("slider");
const outputs = document.getElementsByClassName("score");

var scores = [];
const n = sliders.length;

// **** Initialize sliders values
if (!window.votes || window.votes.length == 0) {
	window.votes = new Array();
	for (j = 0; j < n; ++j) {
		scores[j] = window.votes[j] = 1000.0 / n;
		sliders[j].value = Math.round(scores[j]);
		outputs[j].innerHTML = (scores[j] / 10.0).toFixed(2);
		}
	}
else
	for (j = 0; j < n; ++j) {
		sliders[j].value = window.votes[j];
		scores[j] = window.votes[j];
		outputs[j].innerHTML = (scores[j] / 10.0).toFixed(2);
		}

var total = 0.0;
for (const score of scores)
	total += score;
// console.log("total =", total / 10.0);
document.getElementById("total").innerHTML = (total / 10.0).toFixed(2);

// **** Update the current slider value (each time you drag the slider handle)
[...sliders].forEach( function (slider, k) {
	// console.log("added slider:", k);
	slider.addEventListener("input", function() {
		scores[k] = window.votes[k] = parseFloat(this.value);
		outputs[k].innerHTML = parseFloat(scores[k] / 10.0);

		// Calculate surplus value
		var subtotal = 0;
		for (const score of scores)
			subtotal += score;
		// console.log("subtotal = " + subtotal.toString());
		var surplus = 1000.0 - subtotal;
		// console.log("surplus = " + surplus.toString());
		var adjustment = surplus / (n - 1);
		// console.log("adjustment = " + adjustment.toString());

		// ***** Distribute surplus to all members,
		//	except the moved one (which has to remain in that position)
		var remainder = surplus;			// This will eventually be the rounding error
		const h = n - 1;
		const b = subtotal - scores[k];
		for (j = 0; j < n; ++j) {
			if (j != k) {
				if (b < 1e-5)
					adjustment = (1000.0 - scores[k]) / h;
				else
					// The below formula is correct because ∑_k scores[k] / b = 1
					adjustment = surplus * scores[j] / b;
				remainder -= adjustment;
				scores[j] += adjustment;
				}
			}
		// console.log("remainder = ", remainder);

		// update the HTML elements
		for (j = 0; j < n; ++j) {
			if (j != k) {
				window.votes[j] = scores[j];
				sliders[j].value = Math.round(scores[j]);
				outputs[j].innerHTML = parseFloat(scores[j] / 10.0).toFixed(2);
				}
			}

		// **** Display finalized total
		var total = 0.0;
		for (const score of scores)
			total += score;
		const result = document.getElementById("total");
		result.innerHTML = parseFloat(total / 10.0).toFixed(2);
		result.click();		// signify to other scripts that votes have changed
		}, false);	// end of click handler function
	} );
