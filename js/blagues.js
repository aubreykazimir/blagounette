// Modèle (Model)
const modeleBlagues = {
  blaguesParPage: 5,
  pageCourante: 1,
  donneesBlagues: [],
  ageUtilisateur: 0,

  chargerBlagues: function(urlBlagues) {
    return fetch(urlBlagues)
      .then(response => response.json())
      .then(data => {
        this.donneesBlagues = data;
      });
  },

  getNombreBlaguesVisibles: function() {
    let count = 0;
    this.donneesBlagues.forEach(blague => {
      if (!blague.restreint || (blague.restreint && this.estMajeur())) {
        count++;
      }
    });
    return count;
  },

  estMajeur: function() {
    if (this.ageUtilisateur === 0) {
      return false;
    }
    if (this.ageUtilisateur >= 18) {
      return true;
    }
    return false;
  },

  passerALaPageSuivante: function() {
    if (this.pageCourante < Math.ceil(this.getNombreBlaguesVisibles() / this.blaguesParPage)) {
      this.pageCourante++;
    }
  },

  passerALaPagePrecedente: function() {
    if (this.pageCourante > 1) {
      this.pageCourante--;
    }
  }
};

// Vue (View)
const vueBlagues = {
  afficherBlagues: function(blagues) {
    const conteneurBlagues = document.getElementById('blagues');
    conteneurBlagues.innerHTML = '';

    blagues.forEach(blague => {
      const carteBlague = this.creerCarteBlague(blague);
      conteneurBlagues.appendChild(carteBlague);
    });
  },

  creerCarteBlague: function(blague) {
    const { titre, contenu, categorie } = blague;

    const carteHtml = `
      <div class="carte mb-3">
        <div class="carte-corps">
          <h5 class="carte-titre">${titre}</h5>
          <p class="carte-texte">${contenu}</p>
          <p class="carte-texte text-muted">Catégorie: ${categorie}</p>
        </div>
      </div>
    `;

    const elementCarte = document.createElement('div');
    elementCarte.innerHTML = carteHtml.trim();

    return elementCarte.firstChild;
  },

  afficherPagination: function(totalPages) {
    const conteneurPagination = document.getElementById('pagination');
    conteneurPagination.innerHTML = '';

    if (totalPages <= 1) {
      return;
    }

    const elementPagePrecedente = this.creerElementPagination('Précédent', 'element-page', 'precedent');
    conteneurPagination.appendChild(elementPagePrecedente);

    for (let page = 1; page <= totalPages; page++) {
      const elementPage = this.creerElementPagination(page, 'element-page');
      if (page === modeleBlagues.pageCourante) {
        elementPage.classList.add('actif');
      }
      conteneurPagination.appendChild(elementPage);
    }

    const elementPageSuivante = this.creerElementPagination('Suivant', 'element-page', 'suivant');
    conteneurPagination.appendChild(elementPageSuivante);
  },

  creerElementPagination: function(texte, classeCss, pageCible = null) {
    const elementListe = document.createElement('li');
    elementListe.classList.add(classeCss);
    const lien = document.createElement('a');
    lien.classList.add('lien-page');
    lien.href = '#';
    lien.textContent = texte;
    elementListe.appendChild(lien);

    if (pageCible) {
      elementListe.addEventListener('click', () => {
        controleurBlagues.gererClicElementPagination(pageCible);
      });
    }

    return elementListe;
  }
};

// Contrôleur (Controller)
const controleurBlagues = {
  init: function() {
    const urlBlagues = 'chemin/vers/votre/fichier.json'; // Remplacez par le chemin de votre fichier JSON

    modeleBlagues.chargerBlagues(urlBlagues)
      .then(() => {
        this.afficherBlaguesEtPagination();
      })
      .catch(error => {
        console.error('Une erreur s\'est produite lors du chargement des blagues :', error);
      });
  },

  afficherBlaguesEtPagination: function() {
    const startIndex = (modeleBlagues.pageCourante - 1) * modeleBlagues.blaguesParPage;
    const endIndex = startIndex + modeleBlagues.blaguesParPage;
    const blagues = modeleBlagues.donneesBlagues.slice(startIndex, endIndex);

    vueBlagues.afficherBlagues(blagues);

    const totalPages = Math.ceil(modeleBlagues.getNombreBlaguesVisibles() / modeleBlagues.blaguesParPage);
    vueBlagues.afficherPagination(totalPages);

    this.mettreAJourBoutonsNavigation();
  },

  gererClicElementPagination: function(pageCible) {
    if (pageCible === 'precedent') {
      modeleBlagues.passerALaPagePrecedente();
    } else if (pageCible === 'suivant') {
      modeleBlagues.passerALaPageSuiv
