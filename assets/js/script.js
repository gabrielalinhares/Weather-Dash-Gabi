var cityVal = ""; // setting variable for city
var searchedCity = "";
var keyAPI = "471feefab4353357461acb507c893d8b";

var getForecast = (event) => {
  // Obtain city name from the search box
  let city = $("#searchcity").val();
  cityVal = $("#searchcity").val();
  let urlCity =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&units=imperial" +
    "&APPID=" +
    keyAPI;
  fetch(urlCity)
    .then(handleErrors)
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      // Save city to local storage
      cityList(city);
      let weatherIcon =
        "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png"; // pulling icon regarding the current weather
      //using moment.js to set the time in the zone where the person is checking
      let currentTimeUTC = response.dt;
      let currentTimeZoneOffset = response.timezone;
      let currentTimeZoneOffsetHours = currentTimeZoneOffset / 60 / 60;
      let currentMoment = moment
        .unix(currentTimeUTC)
        .utc()
        .utcOffset(currentTimeZoneOffsetHours);
      getCitiesList();
      FiveDayForecast(event);
      let showCurrentWeather = `
            <h3>${response.name} ${currentMoment.format(
        "(DD/MM/YY)"
      )}<img src="${weatherIcon}"></h3>
            <ul class="list-unstyled">
                <li>Temperature: ${response.main.temp}&#8457;</li>
                <li>Humidity: ${response.main.humidity}%</li>
                <li>Wind Speed: ${response.wind.speed} mph</li>
            </ul>`;
      $("#currentweather").html(showCurrentWeather);
    });
};

var FiveDayForecast = (event) => {
  let city = $("#searchcity").val();

  let urlForecast =
    "https://api.openweathermap.org/data/2.5/forecast?q=" +
    city +
    "&units=imperial" +
    "&APPID=" +
    keyAPI;

  fetch(urlForecast)
    .then(handleErrors)
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      let showFiveDayForecast = `
        <h2>Forecast for the next 5 days:</h2>
        <div id="fiveDayForecastUl" class="d-inline-flex flex-wrap ">`;
      for (let i = 0; i < response.list.length; i++) {
        let dayData = response.list[i];
        let dayTimeUTC = dayData.dt;
        let timeZoneOffset = response.city.timezone;
        let timeZoneOffsetHours = timeZoneOffset / 60 / 60;
        let thisMoment = moment
          .unix(dayTimeUTC)
          .utc()
          .utcOffset(timeZoneOffsetHours);
        let iconURL =
          "https://openweathermap.org/img/w/" +
          dayData.weather[0].icon +
          ".png";
        if (
          thisMoment.format("HH:mm:ss") === "11:00:00" ||
          thisMoment.format("HH:mm:ss") === "12:00:00" ||
          thisMoment.format("HH:mm:ss") === "13:00:00"
        ) {
          showFiveDayForecast += `
                <div class="weather-card card m-2 p0">
                    <ul class="list-unstyled p-3">
                        <li>${thisMoment.format("DD/MM/YY")}</li>
                        <li class="weather-icon"><img src="${iconURL}"></li>
                        <li>Temp: ${dayData.main.temp}&#8457;</li>
                        <li>Humidity: ${dayData.main.humidity}%</li>
                        <li>Wind Speed: ${dayData.wind.speed} mph</li>
                    </ul>
                </div>`;
        }
      }

      showFiveDayForecast += `</div>`;

      $("#five-day-forecast").html(showFiveDayForecast);
    });
};
// checking if the city was already saved in the localstoraged
var cityList = (newCity) => {
  let savedCity = false;
  for (let i = 0; i < localStorage.length; i++) {
    if (localStorage["cities" + i] === newCity) {
      savedCity = true;
      break;
    }
  }
  if (savedCity === false) {
    localStorage.setItem("cities" + localStorage.length, newCity);
  }
};

var getCitiesList = () => {
  $("#searchResults").empty();
  if (localStorage.length === 0) {
    if (searchedCity) {
      $("#searchcity").attr("value", searchedCity);
    } else {
      $("#searchcity").attr("value", " ");
    }
  } else {
    let searchedCityKey = "cities" + (localStorage.length - 1);
    searchedCity = localStorage.getItem(searchedCityKey);
    $("#searchcity").attr("value", searchedCity);
    for (let i = 0; i < localStorage.length; i++) {
      let city = localStorage.getItem("cities" + i);
      let cityBtn;
      if (cityVal === "") {
        cityVal = searchedCity;
      }
      if (city === cityVal) {
        cityBtn = `<button type="button" class="list-group-item list-group-item-action active">${city}</button></li>`;
      } else {
        cityBtn = `<button type="button" class="list-group-item list-group-item-action">${city}</button></li>`;
      }

      $("#searchResults").prepend(cityBtn);
    }

    if (localStorage.length > 0) {
      $("#clear").html(
        $('<a id="clear" href="#">Click here to clear search history</a>')
      );
    } else {
      $("#clear").html("");
    }
  }
};

$("#searchBn").on("click", (event) => {
  event.preventDefault();
  cityVal = $("#searchcity").val();
  getForecast(event);
});

// event listener for the searched cities
$("#searchResults").on("click", (event) => {
  event.preventDefault();
  $("#searchcity").val(event.target.textContent);
  cityVal = $("#searchcity").val();
  getForecast(event);
});

// Clear local storage with city search history
$("#clear").on("click", (event) => {
  localStorage.clear();
  getCitiesList();
});

getCitiesList();

getForecast();

var handleErrors = (response) => {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
};
