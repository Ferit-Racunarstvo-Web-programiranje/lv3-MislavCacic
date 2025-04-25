let sviPodaci = [];
let kosarica = JSON.parse(localStorage.getItem("kosarica")) || [];

document.addEventListener("DOMContentLoaded", () => {
	fetch("temperature.csv")
		.then((res) => res.text())
		.then((csv) => {
			const result = Papa.parse(csv, {
				header: true,
				skipEmptyLines: true,
			});

			sviPodaci = result.data.map((data) => ({
				id: data.ID,
				temperatura: Number(data["Temperature"]),
				sezona: data["Season"],
				lokacija: data["Location"],
				vrijeme: data["Weather Type"],
			}));

			prikaziPodatke(sviPodaci);
			osvjeziKosaricu();
		})
		.catch((error) => console.error("Greška pri dohvaćanju CSV-a:", error));

	document
		.querySelectorAll(
			"#filterSeason, #filterLocation, #filterWeather, #filterTemp"
		)
		.forEach((el) => {
			el.addEventListener("input", filtriraj);
		});

	document.getElementById("filterTemp").addEventListener("input", () => {
		const val = document.getElementById("filterTemp").value;
		document.getElementById("tempValue").textContent = `≤ ${val}°C`;
	});

	document.getElementById("potvrdi-kosaricu").addEventListener("click", () => {
		if (kosarica.length === 0) {
			alert("Košarica je prazna!");
		} else {
			alert(
				`Uspješno ste dodali ${kosarica.length} zapisa u svoju košaricu za vikend analizu!`
			);
			kosarica = [];
			localStorage.removeItem("kosarica");
			osvjeziKosaricu();
		}
	});

	// toggle prikaz košarice
	document.getElementById("kosarica-toggle").addEventListener("click", () => {
		document.getElementById("kosarica-container").classList.toggle("prikazi");
	});
});

function prikaziPodatke(podaci) {
	const tbody = document.querySelector("#temperatureTable tbody");
	tbody.innerHTML = "";

	podaci.forEach((data, index) => {
		const tr = document.createElement("tr");

		tr.innerHTML = `
      <td>${data.id}</td>
      <td>${data.temperatura}</td>
      <td>${data.sezona}</td>
      <td>${data.lokacija}</td>
      <td>${data.vrijeme}</td>
      <td><button class="dodaj-btn" data-index="${index}">Dodaj</button></td>
    `;

		tbody.appendChild(tr);
	});

	document.querySelectorAll(".dodaj-btn").forEach((btn) => {
		btn.addEventListener("click", () => {
			const index = btn.dataset.index;
			dodajUKosaricu(sviPodaci[index]);
		});
	});
}

function filtriraj() {
	const sezona = document.getElementById("filterSeason").value;
	const lokacija = document.getElementById("filterLocation").value;
	const vrijeme = document.getElementById("filterWeather").value;
	const maxTemp = Number(document.getElementById("filterTemp").value);

	const filtrirani = sviPodaci.filter(
		(p) =>
			(sezona === "" || p.sezona === sezona) &&
			(lokacija === "" || p.lokacija === lokacija) &&
			(vrijeme === "" || p.vrijeme === vrijeme) &&
			p.temperatura <= maxTemp
	);

	prikaziPodatke(filtrirani);
}

function dodajUKosaricu(podatak) {
	if (!kosarica.find((p) => p.id === podatak.id)) {
		kosarica.push(podatak);
		localStorage.setItem("kosarica", JSON.stringify(kosarica));
		osvjeziKosaricu();
	} else {
		alert("Taj zapis je već u košarici!");
	}
}

function ukloniIzKosarice(index) {
	kosarica.splice(index, 1);
	localStorage.setItem("kosarica", JSON.stringify(kosarica));
	osvjeziKosaricu();
}

function osvjeziKosaricu() {
	const lista = document.getElementById("lista-kosarice");
	lista.innerHTML = "";

	kosarica.forEach((p, index) => {
		const li = document.createElement("li");
		li.textContent = `${p.id} | ${p.temperatura}°C | ${p.sezona}, ${p.lokacija}, ${p.vrijeme}`;

		const btn = document.createElement("button");
		btn.textContent = "Ukloni";
		btn.addEventListener("click", () => ukloniIzKosarice(index));
		li.appendChild(btn);

		lista.appendChild(li);
	});

	document.getElementById("kosarica-broj").textContent = kosarica.length;
}
