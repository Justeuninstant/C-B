// Format monétaire
function formatEuro(val) {
  return parseFloat(val).toFixed(2) + " €";
}

// Ajouter ligne prestation
function ajouterLigne() {
  const container = document.getElementById("prestation-lignes");
  const ligne = document.createElement("div");
  ligne.innerHTML = `
    <input type="datetime-local" placeholder="Date et heure">
    <input type="text" placeholder="Description">

    <select onchange="recalculer()">
      <option value="">-- Formule --</option>
      <option value="ESSENTIEL|600">Mariage : ESSENTIEL - 600 €</option>
      <option value="PRESTIGE|900">Mariage : PRESTIGE - 900 €</option>
      <option value="FEERIE|1300">Mariage : FEERIE - 1300 €</option>
      <option value="GROSSESSE|150">Grossesse - 150 €</option>
      <option value="FAMILLE|120">Famille - 120 €</option>
      <option value="BEBE|180">Bébé - 180 €</option>
    </select>

    <input type="number" placeholder="Montant (€)" step="0.01" min="0" oninput="recalculer()">
  `;
  container.appendChild(ligne);

  // Si une formule est sélectionnée, on met à jour le montant
  const select = ligne.querySelector("select");
  select.addEventListener("change", () => {
    const montantInput = ligne.querySelector('input[type="number"]');
    const value = select.value;
    if (value.includes('|')) {
      const [label, prix] = value.split('|');
      montantInput.value = prix;
      recalculer();
    }
  });
}


// Ajouter ligne tirage
function ajouterLigneTirage() {
  document.getElementById("tirages-fieldset").style.display = "block";
  const container = document.getElementById("tirages-lignes");
  const ligne = document.createElement("div");
  ligne.innerHTML = `
    <input type="date" placeholder="Date">
    <input type="text" placeholder="Description">
    <input type="number" placeholder="Montant (€)" step="0.01" min="0" oninput="recalculer()">
  `;
  container.appendChild(ligne);
}

// Masquer tirages et totaux associés au chargement
window.addEventListener("DOMContentLoaded", () => {
  const fieldset = document.getElementById("tirages-fieldset");
  const titre = document.getElementById("titre-tirages");
  const tableau = document.getElementById("table-tirages");
  const ligneCommandes = document.getElementById("ligne-commandes");
  const ligneFraisPort = document.getElementById("ligne-frais-port");

  // Masquer tous les éléments liés aux tirages
  fieldset.style.display = "none";
  if (titre) titre.style.display = "none";
  if (tableau) tableau.style.display = "none";
  if (ligneCommandes) ligneCommandes.style.display = "none";
  if (ligneFraisPort) ligneFraisPort.style.display = "none";

  // Mettre à jour texte du bouton s’il existe
  const bouton = document.getElementById("toggle-tirages");
  if (bouton) bouton.textContent = "📦 Afficher les tirages";



});


// Recalcul des totaux
function recalculer() {
  let totalServices = 0;
  let totalCommandes = 0;
  const prestations = document.querySelectorAll("#prestation-lignes div");
  const tirages = document.querySelectorAll("#tirages-lignes div");

  const tbodyPrestations = document.querySelector("#table-prestations tbody");
  const tbodyTirages = document.querySelector("#table-tirages tbody");
  tbodyPrestations.innerHTML = "";
  tbodyTirages.innerHTML = "";

    prestations.forEach(ligne => {
    const dateIn     = ligne.querySelector('input[type="datetime-local"]');
    const descIn     = ligne.querySelector('input[type="text"]');
    const selectForm = ligne.querySelector('select');
    const montantIn  = ligne.querySelector('input[type="number"]');

    const val = parseFloat(montantIn.value || 0);
    totalServices += val;

    const libFormule = selectForm.value
        ? selectForm.options[selectForm.selectedIndex].text.split(' - ')[0]  // garde "Mariage : ESSENTIEL"
        : '';

    tbodyPrestations.innerHTML += `
        <tr>
        <td>${dateIn.value}</td>
        <td>${descIn.value}</td>
        <td>${libFormule}</td>
        <td>${formatEuro(val)}</td>
        </tr>`;
    });

     // Récupérer valeurs km et options
    const km = parseFloat(document.getElementById("input-km").value || 0);
    const prixKm = parseFloat(document.getElementById("input-km-prix").value || 0);
    const totalKm = km * prixKm;

    const options = parseFloat(document.getElementById("input-options").value || 0);



  tirages.forEach(ligne => {
    const [date, desc, montant] = ligne.querySelectorAll("input");
    const val = parseFloat(montant.value || 0);
    totalCommandes += val;

    tbodyTirages.innerHTML += `
      <tr>
        <td>${date.value}</td>
        <td>${desc.value}</td>
        <td>${formatEuro(val)}</td>
      </tr>`;
  });

  const fraisPort = parseFloat(document.getElementById("input-frais-port").value || 0);
  document.getElementById("total-options").textContent = formatEuro(options);

  
  const totalTTC = totalServices + totalCommandes + fraisPort + totalKm + options;

    document.getElementById("total-frais-port").textContent = formatEuro(fraisPort);
    document.getElementById("total-commandes").textContent = formatEuro(totalCommandes);
    document.getElementById("total-services").textContent = formatEuro(totalServices);
    document.getElementById("total-ttc").textContent = formatEuro(totalTTC);
    document.getElementById("total-km").textContent = formatEuro(totalKm);
    document.getElementById("total-options").textContent = formatEuro(options);



    const ligneOptions = document.getElementById("ligne-options");
        if (options > 0) {
        ligneOptions.style.display = "table-row";
        } else {
        ligneOptions.style.display = "none";
    }





}

// Mise à jour des infos client/facture
const champs = [
  { id: "input-date", target: "facture-date", format: val => `Date : ${val}` },
  { id: "input-numero", target: "facture-date", append: true, format: val => `<br>N° Facture : ${val}` },
  { id: "input-client-nom", target: "client-nom" },
  { id: "input-client-adresse", target: "client-adresse" },
  { id: "input-client-tel", target: "client-tel" },
  { id: "input-client-email", target: "client-email" },
];

champs.forEach(champ => {
  document.getElementById(champ.id).addEventListener("input", e => {
    const target = document.getElementById(champ.target);
    if (champ.append) {
      target.innerHTML = target.innerHTML.split("<br>")[0] + champ.format(e.target.value);
    } else {
      target.textContent = champ.format ? champ.format(e.target.value) : e.target.value;
    }
  });
  document.getElementById("input-frais-port").addEventListener("input", recalculer);
  // Recalcul si les champs km, prix par km ou options changent
    document.getElementById("input-km").addEventListener("input", recalculer);
    document.getElementById("input-km-prix").addEventListener("input", recalculer);
    document.getElementById("input-options").addEventListener("input", recalculer);

});

function toggleTirages() {
  const fieldset = document.getElementById("tirages-fieldset");
  const titre = document.getElementById("titre-tirages");
  const tableau = document.getElementById("table-tirages");
  const bouton = document.getElementById("toggle-tirages");
  const ligneCommandes = document.getElementById("ligne-commandes");
  const ligneFraisPort = document.getElementById("ligne-frais-port");

  const visible = fieldset.style.display === "block";

  // Affiche ou masque les sections tirages
  fieldset.style.display = visible ? "none" : "block";
  titre.style.display = visible ? "none" : "block";
  tableau.style.display = visible ? "none" : "table";
  bouton.textContent = visible ? "📦 Afficher les tirages" : "📦 Masquer les tirages";

  // Affiche ou masque les lignes totaux Commandes et Frais de port
  ligneCommandes.style.display = visible ? "none" : "table-row";
  ligneFraisPort.style.display = visible ? "none" : "table-row";
}



// Générer PDF


document.getElementById("download-pdf").addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const contentStartY = 30;

  const facture = document.getElementById("facture-preview");

  // === Étape 1 : Tenter de charger le logo ===
  let logoData = null;
  try {
    const logoUrl = "logo.png";
    const response = await fetch(logoUrl);
    if (!response.ok) throw new Error("Logo introuvable");
    const blob = await response.blob();
    logoData = await new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn("Logo non chargé :", e.message);
  }

  // === Étape 2 : Capture HTML en image ===
  const canvas = await html2canvas(facture, {
    scale: 2,
    useCORS: true
  });
  const imgData = canvas.toDataURL("image/png");

  // === Étape 3 : Ajouter le logo (si dispo) ===
  if (logoData) {
    const logoW = 40;
    const logoH = 40;
    pdf.addImage(logoData, "PNG", margin, 0, logoW, logoH);
  }

  // === Étape 4 : Ajouter la capture ===
  const imgW = pageW - margin * 2;
  const imgH = (canvas.height * imgW) / canvas.width;

  if (imgH + contentStartY <= pageH - margin) {
    pdf.addImage(imgData, "PNG", margin, contentStartY, imgW, imgH);
  } else {
    let y = 0;
    const pxPerMm = canvas.height / imgH;
    const sliceHeightMm = pageH - margin - contentStartY;
    const sliceHeightPx = sliceHeightMm * pxPerMm;

    const pageCanvas = document.createElement("canvas");
    const ctx = pageCanvas.getContext("2d");
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeightPx;

    let pageNum = 0;

    while (y < canvas.height) {
      ctx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(canvas, 0, y, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);
      const sliceData = pageCanvas.toDataURL("image/png");

      if (pageNum > 0) {
        pdf.addPage();
      }
      pdf.addImage(sliceData, "PNG", margin, pageNum === 0 ? contentStartY : margin, imgW, sliceHeightMm);

      y += sliceHeightPx;
      pageNum++;
    }
  }

  pdf.save("facture-photo.pdf");
});



// Générer PDF
// document.getElementById("download-pdf").addEventListener("click", async () => {
//   const pdf = new jsPDF("p", "mm", "a4");
//   const pageWidth = pdf.internal.pageSize.getWidth();
//   const pageHeight = pdf.internal.pageSize.getHeight();
//   const canvas = await html2canvas(facture, {
//     scale: 2, // double résolution
//     useCORS: true
//   });

//   const imgWidth = pageWidth - 20; // 10mm de marge de chaque côté
//   const imgHeight = (canvas.height * imgWidth) / canvas.width;

//   pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight); // marges 10mm
//   pdf.save("facture-photo.pdf");
  

// });


window.addEventListener("DOMContentLoaded", recalculer);