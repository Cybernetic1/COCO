// =============== Integer version ===================
// The integer version is deemed less preferable than floating-point version.

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
