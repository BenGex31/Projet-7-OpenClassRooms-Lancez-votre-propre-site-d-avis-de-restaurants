/**
 * class that manages the weather
 */
class Weather {
    /**
     * Create weather information 
     * @param {string} city - city name
     * @param {string} country - country name
     * @param {string} date - date
     * @param {string} hour 
     * @param {string} condition - weather condition
     * @param {string} icon - weather image condition
     * @param {number} temperature - weather temperature
     */
    constructor(city, country, date, hour, condition, icon, temperature) {
        this.city = city;
        this.country = country;
        this.date = date;
        this.hour = hour;
        this.condition = condition;
        this.icon = icon;
        this.temperature = temperature;
    }

    /**
     * Creates and displays HTML elements for weather information.
     */
    createAndDisplayWeather() {
        let infoWeather = document.getElementById("infoWeather");
        let cityName = document.createElement("h4");
        let iconWeather = document.createElement("img");
        let currentCondition = document.createElement("p");
        let currentDate = document.createElement("p");
        let currentHour = document.createElement("p");
        let currentTmp = document.createElement("p");

        infoWeather.appendChild(cityName);
        infoWeather.appendChild(currentDate);
        infoWeather.appendChild(currentHour);
        infoWeather.appendChild(currentTmp);
        infoWeather.appendChild(iconWeather);
        infoWeather.appendChild(currentCondition);
        currentCondition.classList.add("currentCondition");
        cityName.classList.add('cityName');
        iconWeather.classList.add("iconWeather");
        currentDate.classList.add('currentDate');
        currentHour.classList.add('currentHour');
        currentTmp.classList.add('currentTmp');

        this.getDefaultWeatherAndDisplay(cityName, currentDate, currentHour, currentCondition, iconWeather, currentTmp);

        this.getLocalWeatherAndDisplay(cityName, currentDate, currentHour, currentCondition, iconWeather, currentTmp);
    }

    /**
     * Retrieves weather information from the weather API based on the user's geolocation
     * @param {string} cityName 
     * @param {string} currentDate 
     * @param {string} currentHour 
     * @param {string} currentCondition 
     * @param {string} iconWeather 
     * @param {number} currentTmp - current temperature
     */
    getLocalWeatherAndDisplay(cityName, currentDate, currentHour, currentCondition, iconWeather, currentTmp) {
        var self = this;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                let requestWeatherLocation = new XMLHttpRequest();
                requestWeatherLocation.onreadystatechange = function () {
                    if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                        let resultWeatherPosition = JSON.parse(this.responseText);

                        let localWeather = self.createLocalWeather(resultWeatherPosition);

                        self.displayLocalWeather(localWeather, cityName, currentDate, currentHour, currentCondition, iconWeather, currentTmp);
                    } else {
                        $("h4").appendTo("#infoWeather").html("Le service météo est indisponible").css({paddingBottom: "50px", color: "red", fontWeight: "bolder"}).addClass("animate__animated animate__flash")
                    }
                };
                requestWeatherLocation.open("GET", "https://www.prevision-meteo.ch/services/json/lat=" + pos.lat + "lng=" + pos.lng);
                requestWeatherLocation.send();
            });
        }
    }

    /**
     * Display local weather information on the HTML page
     * @param {object} localWeather - New instance of the "Weather" class
     * @param {string} cityName 
     * @param {string} currentDate 
     * @param {string} currentHour 
     * @param {string} currentCondition 
     * @param {string} iconWeather 
     * @param {number} currentTmp - current temperature
     */
    displayLocalWeather(localWeather, cityName, currentDate, currentHour, currentCondition, iconWeather, currentTmp) {
        if (localWeather.city == "NA" && localWeather.country == "--") {
            cityName.innerHTML = "Météo proche de chez vous";
        } else {
            cityName.innerHTML = "Météo sur " + localWeather.city + ", " + localWeather.country;
        }
        currentDate.innerHTML = "Date : " + localWeather.date;
        currentHour.innerHTML = "Heure local : " + localWeather.hour;
        currentCondition.innerHTML = localWeather.condition;
        iconWeather.setAttribute("src", localWeather.icon);

        if (localWeather.temperature >= -1 && localWeather.temperature <= 1) {
            currentTmp.innerHTML = "Température : " + localWeather.temperature + " degré";
        } else {
            currentTmp.innerHTML = "Température : " + localWeather.temperature + " degrés";
        }
    }

    /**
     * Creates local weather information
     * @param {object} resultWeatherPosition - API weather results
     */
    createLocalWeather(resultWeatherPosition) {
        let localWeather = new Weather(
            resultWeatherPosition.city_info.name,
            resultWeatherPosition.city_info.country,
            resultWeatherPosition.current_condition.date,
            resultWeatherPosition.current_condition.hour,
            resultWeatherPosition.current_condition.condition,
            resultWeatherPosition.current_condition.icon,
            resultWeatherPosition.current_condition.tmp
        );
        console.log(localWeather);
        return localWeather;
    }

    /**
     * Retrieves weather information from the weather API based on the default location
     * @param {string} cityName 
     * @param {string} currentDate 
     * @param {string} currentHour 
     * @param {string} currentCondition 
     * @param {string} iconWeather 
     * @param {number} currentTmp - current temperature
     */
    getDefaultWeatherAndDisplay(cityName, currentDate, currentHour, currentCondition, iconWeather, currentTmp) {
        var self = this;
        let requestWeatherParis = new XMLHttpRequest();
        requestWeatherParis.onreadystatechange = function () {
            if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                let resultWeather = JSON.parse(this.responseText);

                let defaultWeather = self.createDefaultWeather(resultWeather);

                self.displayDefaultWeather(cityName, defaultWeather, currentDate, currentHour, currentCondition, iconWeather, currentTmp);
            } else {
                $("h4").appendTo("#infoWeather").html("Le service météo est indisponible").css({paddingBottom: "50px", color: "red", fontWeight: "bolder"}).addClass("animate__animated animate__flash")
            }
        };
        requestWeatherParis.open("GET", "https://www.prevision-meteo.ch/services/json/paris");
        requestWeatherParis.send();
    }

    /**
     * Display default weather information on the HTML page
     * @param {object} localWeather - New instance of the "Weather" class
     * @param {string} cityName 
     * @param {string} currentDate 
     * @param {string} currentHour 
     * @param {string} currentCondition 
     * @param {string} iconWeather 
     * @param {number} currentTmp - current temperature
     */
    displayDefaultWeather(cityName, defaultWeather, currentDate, currentHour, currentCondition, iconWeather, currentTmp) {
        cityName.innerHTML = "Météo sur " + defaultWeather.city + ", " + defaultWeather.country;
        currentDate.innerHTML = "Date : " + defaultWeather.date;
        currentHour.innerHTML = "Heure local : " + defaultWeather.hour;
        currentCondition.innerHTML = defaultWeather.condition;
        iconWeather.setAttribute("src", defaultWeather.icon);

        if (defaultWeather.temperature >= -1 && defaultWeather.temperature <= 1) {
            currentTmp.innerHTML = "Température : " + defaultWeather.temperature + " degré";
        } else {
            currentTmp.innerHTML = "Température : " + defaultWeather.temperature + " degrés";
        }
    }

    /**
     * Creates default weather information
     * @param {*} resultWeather - API weather results
     */
    createDefaultWeather(resultWeather) {
        let defaultWeather = new Weather(
            resultWeather.city_info.name,
            resultWeather.city_info.country,
            resultWeather.current_condition.date,
            resultWeather.current_condition.hour,
            resultWeather.current_condition.condition,
            resultWeather.current_condition.icon,
            resultWeather.current_condition.tmp
        );
        console.log(defaultWeather);
        return defaultWeather;
    }
}

const weather = new Weather();
weather.createAndDisplayWeather();