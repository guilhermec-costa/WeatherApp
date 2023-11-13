import * as components from "./components.js";

function stringToDate(stringDate, delimiter) {
    let dateParts = stringDate.split(delimiter);
    let [year, month, day] = dateParts;
    return new Date(year, month, day).
    toLocaleString( "en-us",{day: "numeric", month:"short", year:"numeric"})
}
export function buildURL(baseURL, apiKey, method) {
    const LOCATION_ON_URL = `&q=${components.city.value}`;
    const FORECAST_DAYS = `&days=${components.slider.value}`
    const KEY_ON_URL = `key=${apiKey}`;
    const REQUEST_URL = baseURL.concat(method, "?", KEY_ON_URL, LOCATION_ON_URL, FORECAST_DAYS);
    requestWeather(REQUEST_URL);
}

export function moveElement(element, moveString) { element.style.transform = moveString; }

function clearErrorMessage(parent, errorID) {
    parent.childNodes.forEach(e => {
        if(e.id==errorID) components.weatherForm.removeChild(e);
    });
}

function buildForecastsElement(forecasts, location) {
    if(components.allForecasts.childElementCount>0) components.allForecasts.innerHTML = "";
    forecasts.forEach(e => {
        let forecastDate = Object.keys(e)[0];
        let forecastDateFormatted = stringToDate(forecastDate, "-");
        let currentForecastDiv = document.createElement("div");
        currentForecastDiv.classList.add("forecast-box");
        components.forecastCity.textContent = `${location.name}, ${location.region} - forecast next ${components.slider.value} days`;
        let temperaturesDiv = document.createElement("div");
        temperaturesDiv.classList.add("min-max-forecast");

        let currentMaxTemp = document.createElement("h2");
        currentMaxTemp.classList.add("max");
        
        let currentMinTemp = document.createElement("h2");
        currentMinTemp.classList.add("min");

        currentMaxTemp.textContent = e[forecastDate].maxTemp;
        currentMinTemp.textContent = e[forecastDate].minTemp;

        let currentForeCastDateElement = document.createElement("h3");
        currentForeCastDateElement.classList.add("date");
        currentForeCastDateElement.textContent = forecastDateFormatted;

        temperaturesDiv.appendChild(currentMaxTemp);
        temperaturesDiv.appendChild(currentMinTemp);
        currentForecastDiv.appendChild(currentForeCastDateElement);
        currentForecastDiv.appendChild(temperaturesDiv);
        components.allForecasts.appendChild(currentForecastDiv);
    })
}

function extractForecastsInfo(allForecasts) {
    let forecastEachDay = [];
    allForecasts.forEach(e => {
        let forecastDate = String(e.date);
        let forecastMaxTempC = e.day.maxtemp_c;
        let forecastMinTempC = e.day.mintemp_c;
        let currentForecast = {
            [forecastDate]: {
                maxTemp: forecastMaxTempC,
                minTemp: forecastMinTempC
            }
        };
        forecastEachDay.push(currentForecast);
    });
    return forecastEachDay;
}

function buildTemperatureCard(weatherInfo, location, forecasts) {
    let weatherConditionText = weatherInfo.weatherCondition;
    let humidityPercentage = weatherInfo.humidity;
    components.weatherTypeEl.textContent = weatherConditionText + ", " + humidityPercentage + "% humidity";
    clearErrorMessage(components.weatherForm, "error-on-request");
    
    let currentTemperature = weatherInfo.temperatureInCelsius;
    components.temperatureSnapshot.textContent = currentTemperature;
    components.temperatureSnapshot.classList.add("temperature");
    components.weatherIcon.style.backgroundImage = `url(${weatherInfo.weatherIcon})`;

    let locationFormatted = location.name + ", " + location.region + " - " + location.country;
    components.formattedRegion.textContent = locationFormatted;

    let time = location.locatime;
    components.currentTime.textContent = `Current time: ${time}`;

    let lastUpdatedTime = weatherInfo.lastUpdatedTime;
    components.lastUpdated.textContent = `Last updated time: ${lastUpdatedTime}`;

    buildForecastsElement(forecasts, location);
    return components.cardTemperature;
}

function buildLocationObject(data) {
    let locationInfo = {
        name: data.location.name,
        region: data.location.region,
        country: data.location.country,
        locatime: data.location.localtime,
    }
    return locationInfo;
}

function buildWeatherObject(data) {
    let weatherInfo = {
        weatherCondition: data.current.condition.text,
        weatherIcon: data.current.condition.icon,
        temperatureInCelsius: data.current.temp_c,
        humidity: data.current.humidity,
        lastUpdatedTime: data.current.last_updated
    }
    return weatherInfo;
}

function errorHandler(err) {
    clearErrorMessage(components.weatherForm, "error-on-request");
    let errMessage = err.message.replace(".","");
    if(errMessage=="Parameter q is missing") errMessage = "Please, insert the location";
    let errElement = document.createElement("h3");
    errElement.setAttribute("id", "error-on-request");
    errElement.innerHTML = errMessage;
    errElement.classList.add("error");
    components.cardTemperature.classList.add("hidden");
    moveElement(components.weatherForm, "translate(-50%, -50%)");
    components.weatherForm.appendChild(errElement, components.submitButton);
}

async function requestWeather(url) {
    let response = await fetch(url);
    let data = await response.json();
    switch(response.status) {
        case 200:
            let location = buildLocationObject(data);
            let weatherInfo = buildWeatherObject(data);
            let rawForecasts = data.forecast.forecastday;
            let allForecasts = extractForecastsInfo(rawForecasts);
            let card = buildTemperatureCard(weatherInfo, location, allForecasts);
            components.weatherForm.style.transform = "translate(-100%, -50%)";
            card.classList.remove("hidden");
            break;
        default:
            let error = data.error;
            errorHandler(error);
            break;
    }
}