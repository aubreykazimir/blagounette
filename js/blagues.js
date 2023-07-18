// Modèle (Model)
const modeleBlagues = {
  blaguesParPage: 5,
  pageCourante: 1,
  donneesBlagues: [],
  ageUtilisateur: 0,

  chargerBlagues: function (urlBlagues) {
    return fetch(urlBlagues)
      .then((response) => response.json())
      .then((data) => {
        this.donneesBlagues = data;
      });
  },

  getNombreBlaguesVisibles: function (listBlague) {
    let count = 0;
    listBlague.forEach((blague) => {
      if (!blague.restreint || (blague.restreint && this.estMajeur())) {
        count++;
      }
    });
    return count;
  },

  estMajeur: function () {
    if (this.ageUtilisateur === 0) {
      return false;
    }
    if (this.ageUtilisateur >= 18) {
      return true;
    }
    return false;
  },

  passerALaPageSuivante: function () {
    if (
      this.pageCourante <
      Math.ceil(this.getNombreBlaguesVisibles() / this.blaguesParPage)
    ) {
      this.pageCourante++;
    }
  },

  passerALaPagePrecedente: function () {
    if (this.pageCourante > 1) {
      this.pageCourante--;
    }
  },
};

// Vue (View)
const vueBlagues = {
  afficherBlagues: function (blagues) {
    const conteneurBlagues = document.getElementById("blagues");
    conteneurBlagues.innerHTML = "";

    blagues.forEach((blague) => {
      const carteBlague = this.creerCarteBlague(blague);
      conteneurBlagues.appendChild(carteBlague);
    });
  },

  creerCarteBlague: function (blague) {
    const { titre, contenu, categorie } = blague;

    const carteHtml = `
      <div class="card mb-3">
        <div class="card-body">
          <h5 class="card-title">${titre}</h5>
          <p class="card-text">${contenu}</p>
          <p class="card-text text-muted">Catégorie: ${categorie}</p>
        </div>
      </div>
    `;

    const elementCarte = document.createElement("div");
    elementCarte.innerHTML = carteHtml.trim();

    return elementCarte.firstChild;
  },

  afficherPagination: function (totalPages) {
    const conteneurPagination = document.getElementById("pagination");
    conteneurPagination.innerHTML = "";

    if (totalPages <= 1) {
      return;
    }

    const elementPagePrecedente = this.creerElementPagination(
      "Précédent",
      "element-page",
      "precedent"
    );
    conteneurPagination.appendChild(elementPagePrecedente);

    for (let page = 1; page <= totalPages; page++) {
      const elementPage = this.creerElementPagination(page, "element-page");
      if (page === modeleBlagues.pageCourante) {
        elementPage.classList.add("actif");
      }
      conteneurPagination.appendChild(elementPage);
    }

    const elementPageSuivante = this.creerElementPagination(
      "Suivant",
      "element-page",
      "suivant"
    );
    conteneurPagination.appendChild(elementPageSuivante);
  },

  creerElementPagination: function (texte, classeCss, pageCible = null) {
    const elementListe = document.createElement("li");
    elementListe.classList.add(classeCss);
    const lien = document.createElement("a");
    lien.classList.add("lien-page");
    lien.href = "#";
    lien.textContent = texte;
    elementListe.appendChild(lien);

    if (pageCible) {
      elementListe.addEventListener("click", () => {
        controleurBlagues.gererClicElementPagination(pageCible);
      });
    }

    return elementListe;
  },

  mettreAJourBoutonsNavigation: function() {
    const boutonPrecedent = document.getElementById('boutonPrecedent');
    const boutonSuivant = document.getElementById('boutonSuivant');

    if (modeleBlagues.pageCourante === 1) {
      boutonPrecedent.disabled = true;
    } else {
      boutonPrecedent.disabled = false;
    }

    if (modeleBlagues.pageCourante === Math.ceil(modeleBlagues.getNombreBlaguesVisibles() / modeleBlagues.blaguesParPage)) {
      boutonSuivant.disabled = true;
    } else {
      boutonSuivant.disabled = false;
    }
  },

  afficherBlaguesEtPagination: function (blaguesFiltre) {
    const startIndex =
      (modeleBlagues.pageCourante - 1) * modeleBlagues.blaguesParPage;
    const endIndex = startIndex + modeleBlagues.blaguesParPage;
    const listBlague =  blaguesFiltre === undefined ? modeleBlagues.donneesBlagues : blaguesFiltre;
    const blagues = listBlague.slice(startIndex, endIndex);

    console.log(listBlague.length);
    vueBlagues.afficherBlagues(blagues);
    const totalPages = Math.ceil(
      modeleBlagues.getNombreBlaguesVisibles(listBlague) / modeleBlagues.blaguesParPage
    );
    vueBlagues.afficherPagination(totalPages);
    this.mettreAJourBoutonsNavigation();
  },

  afficherOptionsCategories: function () {
    const categories = controleurBlagues.recupererCategories();
    const selectElement = document.getElementById("categorieSelect");
    selectElement.innerHTML = "";

    categories.forEach((categorie) => {
      const optionElement = document.createElement("option"); 
      optionElement.value = categorie;
      optionElement.textContent = categorie;
      selectElement.appendChild(optionElement);
    });
  },
};

// Contrôleur (Controller)
const controleurBlagues = {
  init: function () {
    const urlBlagues = "./json/blague.json"; // Remplacez par le chemin de votre fichier JSON

    document.getElementById('categorieSelect').addEventListener('change', () => {
      this.filtrerBlaguesParCategorie();
    });

    modeleBlagues
      .chargerBlagues(urlBlagues)
      .then(() => {
        vueBlagues.afficherOptionsCategories();
        vueBlagues.afficherBlaguesEtPagination();
      })
      .catch((error) => {
        console.error(
          "Une erreur s'est produite lors du chargement des blagues :",
          error
        );
      });
  },

  filtrerBlaguesParCategorie: function () {
    const selectElement = document.getElementById("categorieSelect");
    const categorieSelectionnee = selectElement.value;
    const blaguesFiltrees = modeleBlagues.donneesBlagues.filter((blague) => {
      if (categorieSelectionnee === "Toutes") {
        return (
          !blague.restreint || (blague.restreint && modeleBlagues.estMajeur())
        );
      } else {
        return (
          (!blague.restreint ||
            (blague.restreint && modeleBlagues.estMajeur())) &&
          blague.categorie === categorieSelectionnee
        );
      }
    });

    modeleBlagues.pageCourante = 1; // Réinitialise la page courante après le filtrage
    vueBlagues.afficherBlaguesEtPagination(blaguesFiltrees);
  },

  recupererCategories: function () {
    const categories = ["Toutes"];
    modeleBlagues.donneesBlagues.forEach((blague) => {
      if (blague.categorie && !categories.includes(blague.categorie)) {
        categories.push(blague.categorie);
      }
    });
    return categories;
  },

  

  gererClicElementPagination: function(pageCible) {
    if (pageCible === 'precedent') {
      modeleBlagues.passerALaPagePrecedente();
    } else if (pageCible === 'suivant') {
      modeleBlagues.passerALaPageSuivante();
    } else {
      modeleBlagues.pageCourante = pageCible;
    }

    vueBlagues.afficherBlaguesEtPagination();
  },
};
