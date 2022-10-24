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

// =============== Integer version ===================

var sliders = document.getElementsByClassName("slider");
var outputs = document.getElementsByClassName("score");

var scores = [];
var max_i = 6;

// **** Initialize sliders values
for (var i = 0; sliders[i]; i++) {
	sliders[i].value = 100 / max_i;
	outputs[i].innerHTML = sliders[i].value;
	scores[i] = parseInt(sliders[i].value);
}

var total = 0;
for (var i = 0; i < max_i; i++)
	total += parseInt(sliders[i].value);
document.getElementById("total").innerHTML = total.toString();

// **** Update the current slider value (each time you drag the slider handle)
for (const s of sliders) {
	s.oninput = function() {
		var k = parseInt(this.id)				// get slider number
		outputs[k].innerHTML = this.value;		// get slider value
		scores[k] = parseInt(this.value);

		// 计算盈馀
		var subtotal = 0;
		for (var i = 0; i < max_i; i++)
			subtotal += scores[i];
		// console.log("subtotal = " + subtotal.toString());
		var surplus = 100 - subtotal;
		// var adjustment = surplus / (max_i - 1);
		// console.log("adjustment = " + adjustment.toString());

		// **** 将盈馀分配给各会员
		var remainder = surplus;				// This will eventually be the rounding error
		for (var i = 0; i < max_i; i++)
			if (i != k) {
				// The below formula is correct because ∑_k scores[k] / subtotal = 1
				var adjustment = Math.floor(surplus * scores[i] / subtotal);
				// surplus is an integer, but there may be rounding errors introduced by the division
				// If we "floor" the adjustment, this will accumlate a rounding error
				// We need to give the rounding error to someone, but to whom?
				remainder -= adjustment;
				scores[i] += adjustment;
				}

		// **** 分配 rounding error 给各会员, randomly and without repeat
		// **** This step may be unnecessary if fractional denominations are allowed.
		// console.log("remainder = ", remainder);
		// This condition should always hold:  number of members >= remainder
		mems = Array.from(Array(max_i).keys());						// create list of members
		while (remainder > 0) {
			const k = Math.floor(Math.random() * mems.length);		// pick random member from list
			mems.splice(k, 1);										// remove the member
			scores[k] += 1;
			--remainder;
			}

		// update 之
		for (var i = 0; i < max_i; i++) {
			sliders[i].value = scores[i].toString();
			outputs[i].innerHTML = sliders[i].value;
			}

		// **** Display finalized total
		var total = 0;
		for (var i = 0; i < max_i; i++)
			total += parseInt(sliders[i].value);
		document.getElementById("total").innerHTML = total.toString();
		}
	}
