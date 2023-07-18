function afficherBlagues(cheminFichierJSON) {
    function recupererBlagues() {
      return fetch(cheminFichierJSON)
        .then(reponse => reponse.json())
        .then(donnees => {
            console.log(donnees);
          return donnees;
        })
        .catch(erreur => {
          console.error('Une erreur s\'est produite lors de la récupération du fichier JSON :', erreur);
        });
    }
  
    function genererCarteBlague(blague) {
      return `'
        <div class="card mb-3">
          <div class="card-header">${blague.titre}</div>
          <div class="card-body">
            <p class="card-text">${blague.contenu}</p>
            <span class="badge badge-primary bg-primary">${blague.categorie}</span>
          </div>
        </div>'`
      ;
    }
  
    function insererBlaguesDansHTML(blagues) {
      var mainElement = document.querySelector('main');
      var htmlGenere = '';
  
      blagues.forEach(function(blague) {
        htmlGenere += genererCarteBlague(blague);
      });
  
      mainElement.innerHTML = htmlGenere;
    }
  
    // Appel de la fonction pour récupérer les blagues
    recupererBlagues()
      .then(blagues => {
        insererBlaguesDansHTML(blagues);
      });
  }