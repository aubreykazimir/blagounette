// Modèle (Model)
const modeleBlagues = {
  blaguesParPage: 5,
  pageCourante: 1,
  donneesBlagues: [],
  donneesBlaguesFiltre: [],
  ageUtilisateur: 0,

  chargerBlagues: function (urlBlagues) {
    return fetch(urlBlagues)
      .then((response) => response.json())
      .then((data) => {
        this.donneesBlagues = data;
        this.donneesBlaguesFiltre = this.donneesBlagues;
      });
  },

  getNombreBlaguesVisibles: function () {
    let count = 0;
    this.donneesBlaguesFiltre.forEach((blague) => {
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
        <div class="card-body" id="colorBlague">
          <h5 class="card-title" id="colorTitle">${titre}</h5>
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
    elementPagePrecedente.children[0].id = "boutonPrecedent";

    const elementPageSuivante = this.creerElementPagination(
      "Suivant",
      "element-page",
      "suivant"
    );
    elementPageSuivante.children[0].id = "boutonSuivant";

    conteneurPagination.appendChild(elementPagePrecedente);
    // min-width: 768px
    if(screen.width >= 768){
      for (let page = 1; page <= totalPages; page++) {
        const elementPage = this.creerElementPagination(
          page,
          "element-page",
          page
        );
        if (page === modeleBlagues.pageCourante) {
          elementPage.classList.add("actif");
        }
        conteneurPagination.appendChild(elementPage);
      }
    } else {
      const element = this.creerElementPagination(`Page ${modeleBlagues.pageCourante}/${totalPages}`, "element-page");
      conteneurPagination.appendChild(element);
    }

    
    conteneurPagination.appendChild(elementPageSuivante);
  },

  creerElementPagination: function (texte, classeCss, pageCible = null) {
    const elementListe = document.createElement("li");
    elementListe.classList.add(classeCss);

    // Utilisation d'un seul élément <a> pour tout l'élément <li>
    const lien = document.createElement("a");
    lien.classList.add("lien-page");
    lien.href = "#pagination";
    elementListe.appendChild(lien);

    // Utilisation de l'icône de Font Awesome
    if (pageCible === "precedent") {
      lien.innerHTML = '<i class="fas fa-chevron-left">Précédent</i>';
    } else if (pageCible === "suivant") {
      lien.innerHTML = '<i class="fas fa-chevron-right">Suivant</i>';
    } else {
      lien.textContent = texte;
    }

    if (pageCible) {
      elementListe.addEventListener("click", () => {
        controleurBlagues.gererClicElementPagination(pageCible);
      });
    }

    return elementListe;
  },

  mettreAJourBoutonsNavigation: function () {
    const boutonPrecedent = document.getElementById("boutonPrecedent");
    const boutonSuivant = document.getElementById("boutonSuivant");
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
    modeleBlagues.blaguesFiltrees =
      blaguesFiltre === undefined
        ? modeleBlagues.donneesBlagues
        : blaguesFiltre;
    const blagues = modeleBlagues.blaguesFiltrees.slice(startIndex, endIndex);
    vueBlagues.afficherBlagues(blagues);
    const totalPages = Math.ceil(
      modeleBlagues.getNombreBlaguesVisibles() / modeleBlagues.blaguesParPage
    );
    vueBlagues.afficherPagination(totalPages);
    vueBlagues.mettreAJourBoutonsNavigation();
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

    document
      .getElementById("categorieSelect")
      .addEventListener("change", () => {
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

  gererClicElementPagination: function (pageCible) {
    if (pageCible === "precedent") {
      modeleBlagues.passerALaPagePrecedente();
    } else if (pageCible === "suivant") {
      modeleBlagues.passerALaPageSuivante();
    } else {
      modeleBlagues.pageCourante = pageCible;
    }

    vueBlagues.afficherBlaguesEtPagination();
  },
};

window.addEventListener("resize", (event) => {
  vueBlagues.afficherBlaguesEtPagination(modeleBlagues.donneesBlaguesFiltre);
})
