/**
 * Class representing a restaurant
 */
class Restaurant {
   /**
    * Create a restaurant
    * @param {number} id 
    * @param {string} restaurantName 
    * @param {string} address 
    * @param {image} icon 
    * @param {number} lat 
    * @param {number} long 
    * @param {object} location 
    * @param {number} rating 
    * @param {string} place_id 
    * @param {array} reviews 
    */
   constructor(id, restaurantName, address, icon, lat, long, location, rating, place_id, reviews) {
      this.id = id;
      this.restaurantName = restaurantName;
      this.address = address;
      this.icon = icon;
      this.lat = lat;
      this.long = long;
      this.location = location;
      this.rating = rating;
      this.place_id = place_id;
      this.reviews = reviews;
   }

   /**
    * Retrieve restaurants from the google places API with reviews
    * @param {object} position - Latitude and longitude
    * @param {object} map - Google Maps
    * @param {string} radius - search radius restaurant
    */
   getRestaurantsListWithReviews(position, map, radius) {
      const requestRestaurant = {
         location: position,
         radius: radius,
         type: ['restaurant']
      };

      const service = new google.maps.places.PlacesService(map);
      service.nearbySearch(requestRestaurant, (results, status) => {
         if (status == google.maps.places.PlacesServiceStatus.OK) {
            results.forEach((restaurant) => {
               this.getGooglePlacesReviews(restaurant, map);
            });
            console.log(restaurantsList);
         } else {
         alert("Le status de la requête est " + status + ", merci d'essayer à nouveau ultérieurement.");
         }
      });
   }

   /**
    * Retrieves the reviews from the google places API for each restaurant
    * @param {object} restaurant - each restaurant
    * @param {object} map - Google Maps
    */
   getGooglePlacesReviews(restaurant, map) {
      const requestReview = {
         placeId: restaurant.place_id,
         fields: ['review']
      };

      const service = new google.maps.places.PlacesService(map);
      service.getDetails(requestReview, (place, status) => {
         if (status == google.maps.places.PlacesServiceStatus.OK) {
            this.populateRestaurantsListGooglePlaces(restaurant, place);
         } else {
            alert('Aucun avis client.' + "Le status de la requête est " + status);
         }
      });
   }

   /**
    * Populate the table of the restaurant list with the information from the google places API
    * @param {object} restaurant - each restaurant
    * @param {object} place 
    */
   populateRestaurantsListGooglePlaces(restaurant, place) {
      const newRestaurant = new Restaurant(
         restaurantsList.length + 1,
         restaurant.name,
         restaurant.vicinity,
         restaurant.icon,
         restaurant.geometry.location.lat(),
         restaurant.geometry.location.lng(),
         restaurant.geometry.location,
         restaurant.rating,
         restaurant.place_id,
         []
      );

      restaurantsList.push(newRestaurant);

      place.reviews.forEach(review => {
         const newReview = new Review(
            review.author_name,
            review.profile_photo_url,
            review.rating,
            review.text,
            restaurant.place_id,
            review.relative_time_description
         );

         restaurantsList.forEach(element => {
            if (element.place_id == restaurant.place_id) {
               element.reviews.push(newReview);
            }
         });
      });
   }

   /**
    * Retrieve restaurants with reviews from a json file
    */
   /*getLocalRestaurantList() {
      fetch('js/data.json')
         .then(response => response.json())
         .then(function(results) {
            results.forEach(restaurant => {
               const reviews = restaurant.ratings.map(rating => new Review(
                  "Utilisateur anonyme",
                  "https://cdn3.iconfinder.com/data/icons/glyphicon/64/profil-512.png",
                  rating.stars,
                  rating.comment,
                  undefined,
                  "Date de publication non renseignée"
               ));
      
               const newRestaurantLocal = new Restaurant(
                  restaurantsList.length + 1,
                  restaurant.restaurantName,
                  restaurant.address,
                  "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/restaurant-71.png",
                  restaurant.lat,
                  restaurant.long,
                  undefined,
                  undefined,
                  undefined,
                  reviews
               );
               restaurantsList.push(newRestaurantLocal);
            });
         });
      console.log(restaurantsList);
   }*/

   /**
    * Displays the list of restaurants with their "view reviews" and "write a review" buttons on the HTML page
    * @param {array} arrayRestaurant - Restaurant array
    */
   displayResults(arrayRestaurant) {
      this.createListResults(arrayRestaurant);
      this.createButtonConsultReviewResults(arrayRestaurant);
      this.createButtonWriteReviewResults(arrayRestaurant);
   }

   /**
    * Create the list of restaurants with their information on the HTML page
    * @param {array} arrayRestaurant - Restaurant array
    */
   createListResults(arrayRestaurant) {
      for (let restaurant of arrayRestaurant) {
         $('<div>').appendTo($("#restaurantsList")).attr({id: restaurant.id, class:"restaurantInfo text-left"});
         $('<h5>').appendTo($("#" + restaurant.id)).attr({class:"restaurantName", id:"restaurantName" + restaurant.id}).html(restaurant.restaurantName);
         $('<img>').prependTo($("#restaurantName" + restaurant.id)).attr("src", restaurant.icon).css({width:"20px", height:"20px", marginRight:"0.5em"});
         $('<p>').appendTo($("#" + restaurant.id)).attr({class:"RestaurantAddress", id:"RestaurantAddress" + restaurant.id}).html(restaurant.address).css({fontSize:"small", cursor:"pointer"});
         $('<i>').prependTo($("#RestaurantAddress" + restaurant.id)).addClass("fas fa-map-marker-alt");

         this.getAverageRating(restaurant);

         if (isNaN(restaurant.rating)) {
            $('<p>').appendTo($("#" + restaurant.id)).attr("id", "review" + restaurant.id).html("Aucun avis et aucune note laissés pour restaurant").css({color:"red", fontWeight:"bolder", fontSize:"small"});
            } else {
            $('<p>').appendTo($("#" + restaurant.id)).attr("id", "review" + restaurant.id).html("Note moyenne : " + restaurant.rating.toFixed(1) + " / 5").css({color:"#0a3d62", fontWeight:"bolder", fontSize:"small"});
         }
      }
   }
   
   /**
    * Calculates the average rating of reviews left by users
    * @param {object} restaurant - each restaurant
    */
   getAverageRating(restaurant) {
      let totalStars = restaurant.reviews.reduce(function (sum, reviews) {
         return sum + reviews.stars;
      }, 0);
      let average = totalStars / restaurant.reviews.length;
      restaurant.rating = average;
   }

   /**
    * Creates the HTML button to view user reviews
    * @param {array} arrayRestaurant - Restaurant array
    */
   createButtonConsultReviewResults(arrayRestaurant) {
      for (let restaurant of arrayRestaurant) {
         $('<button>').appendTo($('#' + restaurant.id)).html("Voir les avis").attr({type: "button", class: "btn btn-warning btn-sm", id: "buttonConsultReview" + restaurant.id}).attr("data-toggle", "modal").attr("data-target", "#consultReview" + restaurant.id).css({fontSize: "small", border: "0.5px solid black", fontWeight: "bolder", backgroundColor: "#82ccdd", color: "black"});
         if (restaurant.reviews.length === 0) {
            $("#buttonConsultReview" + restaurant.id).attr("disabled", "true");
         }
         $('<div>').insertAfter($('#buttonConsultReview' + restaurant.id)).attr({class: 'modal fade', id: "consultReview" + restaurant.id, tabindex: "-1"}).attr('aria-labelledby', "consultReview" + restaurant.id + "Label").attr('aria-hidden', 'true');
         $('<div>').appendTo($('#consultReview' + restaurant.id)).attr({class: "modal-dialog", id: "modal-dialog-consultReview" + restaurant.id});
         $('<div>').appendTo($('#modal-dialog-consultReview' + restaurant.id)).attr({class: "modal-content", id: "modal-content-consultReview" + restaurant.id});
         
         $('<div>').appendTo($('#modal-content-consultReview' + restaurant.id)).attr({class: "modal-header", id: "modal-header-consultReview" + restaurant.id});
         $('<h4>').appendTo($("#modal-header-consultReview" + restaurant.id)).attr({class: "modal-title animate__animated animate__fadeInRight animate__delay-0.5s", id: "consultReview" + restaurant.id + "Label"}).html(restaurant.restaurantName);
         $('<img>').appendTo($("#modal-header-consultReview" + restaurant.id)).attr({class:"streetView", src:"https://maps.googleapis.com/maps/api/streetview?size=200x150&location=" + restaurant.lat + "," + restaurant.long + "&heading=151.78&pitch=-0.76&key=AIzaSyC4fKHC9oHDR8F0Zban3gY6M8LGYrIDlpc"});
         
         $('<div>').appendTo($("#modal-content-consultReview" + restaurant.id)).attr({class:"modal-body", id:"modal-body-consultReview" + restaurant.id});
         $('<h5>').appendTo($("#modal-body-consultReview" + restaurant.id)).addClass("titleReviews text-center").html("Commentaires et notes des clients").css({fontWeight: "bolder", borderBottom: "1px solid black", marginBottom: "2em", color:"red"});

         for  (let review = 0; review < restaurant.reviews.length; review++) {
            $('<div>').appendTo($("#modal-body-consultReview" + restaurant.id)).attr("id", "blocReview" + review + "Restaurant" + restaurant.id).css({border:"2px inset black", marginBottom:"1em", padding:"0.5em", borderRadius:"5px", backgroundColor:"#3c6382", color:"white"});
            $('<p>').appendTo($("#blocReview" + review + "Restaurant" + restaurant.id)).attr({id: "author" + review + "Restaurant" + restaurant.id, class: "author"}).html(restaurant.reviews[review].author).css("color", "#82ccdd");
            $('<i>').prependTo($("#author" + review + "Restaurant" + restaurant.id)).addClass("fas fa-user-edit").css({color:"orange", marginRight:"0.5em"});
            $('<img>').appendTo($("#author" + review + "Restaurant" + restaurant.id)).attr({src: restaurant.reviews[review].author_profil_picture, class:"author_profil_picture"}).css({float: "right", width:"40px", height:"40px"});
            $('<p>').appendTo($("#blocReview" + review + "Restaurant" + restaurant.id)).html("Commentaire :").css({marginBottom: "0.5em", textDecoration:"underline", fontSize:"small", color:"black"});
            if (restaurant.reviews[review].comment == "") {
            $('<p>').appendTo($("#blocReview" + review + "Restaurant" + restaurant.id)).attr({id: "comment" + "Restaurant" + restaurant.id, class: "comment"}).html("Pas de commentaire laissé");
            } else {
            $('<p>').appendTo($("#blocReview" + review + "Restaurant" + restaurant.id)).attr({id: "comment" + "Restaurant" + restaurant.id, class: "comment"}).html(restaurant.reviews[review].comment);
            }
            $('<p>').appendTo($("#blocReview" + review + "Restaurant" + restaurant.id)).attr({id: "stars" + "Restaurant" + restaurant.id, class: "stars text-right"}).html("Note : " + restaurant.reviews[review].stars + " / 5").css({marginBottom: "0", color:"#82ccdd"});
            $('<p>').appendTo($("#blocReview" + review + "Restaurant" + restaurant.id)).addClass("relative_time_description").html("- " + restaurant.reviews[review].relative_time_description).css({color:"black", fontStyle:"italic", fontSize:"small"});
         }
         
         $('<div>').appendTo($("#modal-content-consultReview" + restaurant.id)).attr({class:"modal-footer", id:"modal-footer-consultReview" + restaurant.id});
         $('<button>').appendTo($("#modal-footer-consultReview" + restaurant.id)).attr({type:"button", class:"btn btn-secondary btn-sm"}).attr("data-dismiss", "modal").css("font-size", "small").html("Fermer");
      }
   }

   /**
    * Creates the HTML button for users to write a review
    * @param {array} arrayRestaurant - Restaurant array
    */
   createButtonWriteReviewResults(arrayRestaurant) {
      for (let restaurant of arrayRestaurant) {
         $('<button>').appendTo($('#' + restaurant.id)).html("Rédiger un avis").attr({type: "button", class: "btn btn-primary btn-sm", id: "buttonWriteReview" + restaurant.id}).attr("data-toggle", "modal").attr("data-target", "#writeReview" + restaurant.id).css({fontSize: "small", border: "0.5px solid black", fontWeight: "bolder", backgroundColor: "#3c6382", color: "whitesmoke"});
         $('<div>').insertAfter($('#buttonWriteReview' + restaurant.id)).attr({class: 'modal fade', id: "writeReview" + restaurant.id, tabindex: "-1"}).attr('aria-labelledby', "writeReview" + restaurant.id + "Label").attr('aria-hidden', 'true');
         $('<div>').appendTo($('#writeReview' + restaurant.id)).attr({class: "modal-dialog", id: "modal-dialog-writeReview" + restaurant.id});
         $('<div>').appendTo($('#modal-dialog-writeReview' + restaurant.id)).attr({class: "modal-content", id: "modal-content-writeReview" + restaurant.id});
         
         $('<div>').appendTo($('#modal-content-writeReview' + restaurant.id)).attr({class: "modal-header", id: "modal-header-writeReview" + restaurant.id});
         $('<h6>').appendTo($("#modal-header-writeReview" + restaurant.id)).attr({class: "modal-title animate__animated animate__fadeInRight animate__delay-0.5s", id: "writeReview" + restaurant.id + "Label"}).html(restaurant.restaurantName);
         //$('<button>').appendTo($("#modal-header-writeReview" + restaurant.id)).attr({type: "button", class: "close", id: "buttonCloseWriteReview" + restaurant.id}).attr('data-dismiss', 'modal').attr('aria-label', 'Close');
         //$('<span>').appendTo($("#buttonCloseWriteReview" + restaurant.id)).attr('aria-hidden', 'true').html("&times;");
         $('<div>').appendTo($("#modal-content-writeReview" + restaurant.id)).attr({class: "modal-body", id: "modal-body-writeReview" + restaurant.id});
         $('<h5>').appendTo($("#modal-body-writeReview" + restaurant.id)).html("Votre avis compte aussi !").css({color: "darkgreen", fontWeight: "bolder"}).addClass("text-center animate__animated animate__flash animate__delay-1s").css("margin-bottom", "1em");
         
         $('<textarea>').appendTo($("#modal-body-writeReview" + restaurant.id)).attr({class:"form-control", type:"text", placeholder:"Saisissez votre nom et votre prénom", id:"textareaAuthorNameRestaurant" + restaurant.id}).css({marginBottom: "1em", fontSize:"small"});

         $('<div>').appendTo($("#modal-body-writeReview" + restaurant.id)).attr({class: "input-group mb-3", id: "input-group" + restaurant.id});
         $('<div>').appendTo($("#input-group" + restaurant.id)).attr({class: "input-group-prepend", id: "input-group-prepend" + restaurant.id});
         $('<label>').appendTo($("#input-group-prepend" + restaurant.id)).attr({class: "input-group-text", for: "inputGroupSelectRestaurant" + restaurant.id}).html("Sélectionner votre note entre 1 et 5 : ").css("background-color", "#f8c291").css("font-size", "small");
         $('<select>').appendTo($("#input-group" + restaurant.id)).attr({class: "custom-select", id: "inputGroupSelectRestaurant" + restaurant.id, type: "number"}).css("font-size", "small");
         $('<option>').appendTo($("#inputGroupSelectRestaurant" + restaurant.id)).attr("value", "").html("Faites votre choix");

         for(let i = 1; i <= 5; i++) {
            $('<option>').appendTo($("#inputGroupSelectRestaurant" + restaurant.id)).attr("value", i).html(i);
         }
         
         $('<form>').appendTo($("#modal-body-writeReview" + restaurant.id)).addClass("formComment" + restaurant.id);
         $('<div>').appendTo($(".formComment" + restaurant.id)).attr({class: "form-group", id: "form-group" +restaurant.id});
         $('<label>').appendTo($("#form-group" + restaurant.id)).attr("for", "FormControlTextareaRestaurant" + restaurant.id).html("Ecrire votre commentaire :").css("font-size", "small");
         $('<textarea>').appendTo($("#form-group" + restaurant.id)).attr({class: "form-control", id: "FormControlTextareaRestaurant" + restaurant.id, col: "3", rows: "3"}).css("font-size", "small");

         $('<div>').appendTo($("#modal-body-writeReview" + restaurant.id)).attr("id", "resultReview" + restaurant.id);
         $('<p>').appendTo($("#resultReview" + restaurant.id)).attr("id", "resultRating" + restaurant.id).html("Votre note : ").css({fontSize: "small", fontWeight: "bolder"});
         $('<span>').appendTo($("#resultRating" + restaurant.id)).attr("id", "spanResultRating"+ restaurant.id).css({fontSize: "small", fontStyle: "italic", color: "black"});
         $('<p>').appendTo($("#resultReview" + restaurant.id)).attr("id", "resultComment" + restaurant.id).html("Votre commentaire : ").css({fontSize: "small", fontWeight: "bolder"});
         $('<span>').appendTo($("#resultComment" + restaurant.id)).attr("id", "spanResultComment" + restaurant.id).css({fontSize: "small", fontStyle: "italic", color: "black"});

         $("#inputGroupSelectRestaurant" + restaurant.id).change(function(event){
            $("#spanResultRating" + restaurant.id).html(event.target.value);
         });

         $("#FormControlTextareaRestaurant" + restaurant.id).change(function(event){
            $("#spanResultComment" + restaurant.id).html('"' + event.target.value + '"');
         });

         $('<div>').appendTo($("#modal-content-writeReview" + restaurant.id)).attr({class: "modal-footer", id: "modal-footer-writeReview" + restaurant.id});
         $('<button>').appendTo($("#modal-footer-writeReview" + restaurant.id)).attr({type: "button", class: "btn btn-secondary btn-sm", id:"btnCloseWriteReviewRestaurant" + restaurant.id}).attr('data-dismiss', 'modal').html("Annuler").css("font-size", "small");
         $('<button>').appendTo($("#modal-footer-writeReview" + restaurant.id)).attr({type: "submit", class: "btn btn-primary btn-sm", id: "publishReview" + restaurant.id, /*'data-dismiss': 'modal'*/}).html("Publier un avis").css("font-size", "small");
      }
   }

   /**
    * Create marker icons on Google Maps for each restaurant
    * @param {array} arrayRestaurant - Restaurant array
    * @param {object} map - Google Maps
    */
   createMarkerResults(arrayRestaurant, map) {
      for(let restaurant of arrayRestaurant) {
         let markerResults = new google.maps.Marker({
            position: {lat: restaurant.lat, lng: restaurant.long},
            animation: google.maps.Animation.DROP,
            label: restaurant.restaurantName,
            icon: {
                  url: "img/icon-restaurant-location.png",
                  scaledSize: new google.maps.Size(50, 50),
                  origin: new google.maps.Point(0, 0),
                  anchor: new google.maps.Point(0, 0)
            }
         });

         markersArray.push(markerResults);

         const contentString =
            '<h1 id="firstHeading" class="restaurantName text-center">' + restaurant.restaurantName + '</h1>' + 
            '<div class="text-center">' +
            '<img class"streetView" src="https://maps.googleapis.com/maps/api/streetview?size=200x150&location=' + restaurant.lat + "," + restaurant.long + '&heading=151.78&pitch=-0.76&key=AIzaSyC4fKHC9oHDR8F0Zban3gY6M8LGYrIDlpc">' +
            '</div>' +
            '<div id="bodyContent">' +
            '<p><i class="fas fa-map-marker-alt"></i>' + restaurant.address + '</p>' +
            '</div>';

         const infoWindow = new google.maps.InfoWindow({
            content : contentString
         });

         markerResults.addListener("click", () => {
            infoWindow.open(map, markerResults);
         });
      }
      console.log(markersArray);
   }

   /**
    * Show marker icons on Google Maps
    * @param {object} map - Google Maps
    */
   displayMarkersOnMap(map) {
      for (let marker of markersArray) {
         marker.setMap(map);
      }
   }

   /**
    * Removes the icon markers from the Google Maps map and clears the table of markers
    */
   clearMarkers() {
      this.displayMarkersOnMap(null);
      markersArray = [];
   }

   /**
    * Filters the ratings of the restaurant list
    * @param {array} array - Restaurant array
    * @param {object} map - Google Maps
    */
   filterResultsRating(array, map) {
      const filterRatings = document.getElementById("filterRatings");

      const oneStarArray = array.filter(average => average.rating >= 0 && average.rating <= 1);
      const twoStarArray = array.filter(average => average.rating >= 1 && average.rating <= 2);
      const threeStarArray = array.filter(average => average.rating >= 2 && average.rating <= 3);
      const fourStarArray = array.filter(average => average.rating >= 3 && average.rating <= 4);
      const fiveStarArray = array.filter(average => average.rating >= 4 && average.rating <= 5);

      if (filterRatings.value >= 1 && filterRatings.value <= 5) {
         if (filterRatings.value == 1) {
            this.clearListRestaurants();
            this.createListResults(oneStarArray);
            this.createButtonConsultReviewResults(oneStarArray);
            this.createButtonWriteReviewResults(oneStarArray);
            this.clearMarkers();
            this.createMarkerResults(oneStarArray, map);
            this.displayMarkersOnMap(map);
            this.publishReview(oneStarArray);
         }
         if (filterRatings.value == 2) {
            this.clearListRestaurants();
            this.createListResults(twoStarArray);
            this.createButtonConsultReviewResults(twoStarArray);
            this.createButtonWriteReviewResults(twoStarArray);
            this.clearMarkers();
            this.createMarkerResults(twoStarArray, map);
            this.displayMarkersOnMap(map);
            this.publishReview(twoStarArray);
         }
         if (filterRatings.value == 3) {
            this.clearListRestaurants();
            this.createListResults(threeStarArray);
            this.createButtonConsultReviewResults(threeStarArray);
            this.createButtonWriteReviewResults(threeStarArray);
            this.clearMarkers();
            this.createMarkerResults(threeStarArray, map);
            this.displayMarkersOnMap(map);
            this.publishReview(threeStarArray);
         }
         if (filterRatings.value == 4) {
            this.clearListRestaurants();
            this.createListResults(fourStarArray);
            this.createButtonConsultReviewResults(fourStarArray);
            this.createButtonWriteReviewResults(fourStarArray);
            this.clearMarkers();
            this.createMarkerResults(fourStarArray, map);
            this.displayMarkersOnMap(map);
            this.publishReview(fourStarArray);
         }
         if (filterRatings.value == 5) {
            this.clearListRestaurants();
            this.createListResults(fiveStarArray);
            this.createButtonConsultReviewResults(fiveStarArray);
            this.createButtonWriteReviewResults(fiveStarArray);
            this.clearMarkers();
            this.createMarkerResults(fiveStarArray, map);
            this.displayMarkersOnMap(map);
            this.publishReview(fiveStarArray);
         }
      } else {
         this.clearListRestaurants();
         this.createListResults(array);
         this.createButtonConsultReviewResults(array);
         this.createButtonWriteReviewResults(array);
         this.clearMarkers();
         this.createMarkerResults(array, map);
         this.displayMarkersOnMap(map);
         this.publishReview(array);
      }
   }

   /**
    * Empty the list of restaurants on the HTML page
    */
   clearListRestaurants() {
   $("#restaurantsList").html("");
   }

   /**
    * Post a review and a rating when a user clicks the HTML button "post review"
    * @param {array} array - Restaurant array
    */
   publishReview(array, map) {
      var self = this;
      for (let restaurant of array) {
         let textareaAuthorNameRestaurant = document.getElementById("textareaAuthorNameRestaurant" + restaurant.id)
         let inputGroupSelectRestaurant = document.getElementById("inputGroupSelectRestaurant" + restaurant.id);
         let FormControlTextareaRestaurant = document.getElementById("FormControlTextareaRestaurant" + restaurant.id);
         let restaurantsName = document.getElementById(restaurant.id);

         $("#publishReview" + restaurant.id).on("click", function(){
            if (inputGroupSelectRestaurant.value >= 1 && inputGroupSelectRestaurant.value <= 5 && FormControlTextareaRestaurant.value && textareaAuthorNameRestaurant.value) {
               if (restaurant.id === parseInt(restaurantsName.id)) {
                  $("#publishReview" + restaurant.id).attr("data-dismiss", "modal");
                  self.addNewReview(restaurant, textareaAuthorNameRestaurant, inputGroupSelectRestaurant, FormControlTextareaRestaurant);
                  self.clearListRestaurants();
                  self.displayResults(array);
                  self.publishReview(array, map);
               }
            } else {
               alert("Merci de renseigner votre nom et prénom, ainsi qu'une note et un commentaire, sinon merci de cliquer sur Fermer")
            }
         });
         this.refreshFormAddNewreview(restaurant, inputGroupSelectRestaurant, FormControlTextareaRestaurant, textareaAuthorNameRestaurant);
      }
   }

   /**
    * Adds a new review to the restaurant concerned when a user posts a review
    * @param {object} restaurant - each restaurant
    * @param {string} textareaAuthorNameRestaurant - User comment
    * @param {string} inputGroupSelectRestaurant - User rating
    * @param {string} FormControlTextareaRestaurant - User comment
    */
   addNewReview(restaurant, textareaAuthorNameRestaurant, inputGroupSelectRestaurant, FormControlTextareaRestaurant) {
      restaurant.reviews.push(
         new Review(
            textareaAuthorNameRestaurant.value,
            "https://cdn3.iconfinder.com/data/icons/glyphicon/64/profil-512.png",
            parseInt(inputGroupSelectRestaurant.value),
            FormControlTextareaRestaurant.value,
            undefined,
            "A l'instant"
         )
      );
   }

   /**
    * refreshes the form used to add a new review if the user clicks on the "Close" button in the modal window
    * @param {object} restaurant - each restaurant
    * @param {string} inputGroupSelectRestaurant - User rating
    * @param {string} FormControlTextareaRestaurant - User comment
    * @param {string} textareaAuthorNameRestaurant - User comment
    */
   refreshFormAddNewreview(restaurant, inputGroupSelectRestaurant, FormControlTextareaRestaurant, textareaAuthorNameRestaurant) {
      $("#btnCloseWriteReviewRestaurant" + restaurant.id).on("click", function () {
         textareaAuthorNameRestaurant.value = "";
         inputGroupSelectRestaurant.value = "";
         $("#spanResultRating" + restaurant.id).html("");
         FormControlTextareaRestaurant.value = "";
         $("#spanResultComment" + restaurant.id).html("");
         $('.alertMessage').remove();
         $("#publishReview" + restaurant.id).removeAttr("disabled");
      });
   }

   /**
    * Adds a new restaurant to the restaurant list when a user clicks the HTML "Save" button
    * @param {number} lat - Latitude
    * @param {number} lng - Longitude
    * @param {object} map - Google Maps
    */
   addNewRestaurantArray(lat, lng, map) {
      var self = this;
      let inputUserName = document.getElementById("inputUserName");
      let inputUserFirstName = document.getElementById("inputUserFirstName");
      let inputRestaurantName = document.getElementById("inputRestaurantName");
      let inputRestaurantAddress = document.getElementById("inputRestaurantAddress");
      let starsRating = document.getElementById("inputGroupSelectRestaurantRating");
      let commentRating = document.getElementById("FormControlTextareaRestaurantComment");

      $("#btnSaveAddRestaurant").click(function() {
         if (inputUserName.value && inputUserFirstName.value && inputRestaurantName.value && inputRestaurantAddress.value && commentRating.value) {
            if (starsRating.value >= 1 && starsRating.value <= 5) {
               self.populateRestaurantsListByUser(inputUserName, inputUserFirstName, starsRating, commentRating, inputRestaurantName, inputRestaurantAddress, lat, lng);
               self.refreshRestaurantsAndMarkers(map);

               $("#btnSaveAddRestaurant").attr("disabled", "true");
               $("#addRestaurant").attr("disabled", "true");
               $('<p>').appendTo($("#form-addRestaurant")).html("Le restaurant a bien été enregitré, merci de fermer").addClass("alertMessage text-center animate__animated animate__flash").css({color:"red", fontWeight:"bolder", fontSize:"small"});
               $("#removeMarker").attr("disabled", "true");
            }
         } else {
            alert("Merci de renseigner tous les champs obligatoires *");
         }
      });
      this.clearFormAddNewRestaurant(inputUserName, inputUserFirstName, inputRestaurantName, inputRestaurantAddress, starsRating, commentRating);
   }

   /**
    * Populates the restaurant list table when a user clicks the HTML "Save" button
    * @param {string} inputUserName - User name
    * @param {string} inputUserFirstName - User first name
    * @param {string} starsRating - User rating
    * @param {string} commentRating - User comment
    * @param {string} inputRestaurantName - Restaurant name
    * @param {string} inputRestaurantAddress - Restaurant address
    * @param {number} lat - Latitude 
    * @param {number} lng - Longitude
    */
   populateRestaurantsListByUser(inputUserName, inputUserFirstName, starsRating, commentRating, inputRestaurantName, inputRestaurantAddress, lat, lng) {
      let reviewsList = [];
      const newReview = new Review(
         inputUserName.value + " " + inputUserFirstName.value,
         "https://cdn3.iconfinder.com/data/icons/glyphicon/64/profil-512.png",
         parseInt(starsRating.value),
         commentRating.value,
         undefined,
         "A l'instant"
      );
      reviewsList.push(newReview);

      const newRestaurant = new Restaurant(
         restaurantsList.length + 1,
         inputRestaurantName.value,
         inputRestaurantAddress.value,
         "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/restaurant-71.png",
         lat,
         lng,
         undefined,
         Number,
         undefined,
         reviewsList
      );

      restaurantsList.push(newRestaurant);
   }

   /**
    * refreshes the list of restaurants and the markers of the Google Maps map on the HTML page
    * @param {object} map - Google Maps
    */
   refreshRestaurantsAndMarkers(map) {
      this.clearListRestaurants();
      this.displayResults(restaurantsList);
      this.clearMarkers();
      this.createMarkerResults(restaurantsList, map);
      this.displayMarkersOnMap(map);
      this.publishReview(restaurantsList, map);
   }

   /**
    * Empty the form used to add a new restaurant when a user clicks the HTML "Close" button
    * @param {string} inputUserName - User name
    * @param {string} inputUserFirstName - User first name
    * @param {string} inputRestaurantName - Restaurant name
    * @param {string} inputRestaurantAddress - Restaurant address
    * @param {number} starsRating - User rating
    * @param {string} commentRating - User comment
    */
   clearFormAddNewRestaurant(inputUserName, inputUserFirstName, inputRestaurantName, inputRestaurantAddress, starsRating, commentRating) {
      $("#btnCloseAddRestaurant").click(function(){
         inputUserName.value = "";
         inputUserFirstName.value = "";
         inputRestaurantName.value = "";
         inputRestaurantAddress.value = "";
         starsRating.value = "";
         commentRating.value = "";
      });
   }
}
let restaurantsList = [];
let markersArray = [];