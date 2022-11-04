const names = ["Claris", "Abeer", "Pete", "Eric"];

const radioButtons2 = document.querySelectorAll('input[name="person2"]');

for (const radioButton of radioButtons2) {
	radioButton.addEventListener('change', showPerson2);
	}

function showPerson2(e) {
	// console.log(e);
	if (this.checked) {
		document.getElementById("PersonPic2").src = "images/" + names[this.value] + ".png";
		document.getElementById("PersonStats2").innerHTML = "Name: " + names[this.value] + "<br>Tokens: 10,000";

		/* Unfinished */
		}
	}
