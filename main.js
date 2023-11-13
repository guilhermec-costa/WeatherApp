import {buildURL} from "./functions.js";
import { 
        submitButton, container, slider, 
        sliderLegend, weatherForm, cardTemperature }
    from "./components.js";
import { moveElement } from "./functions.js";

const API_KEY = "297208783199441f848131925230111"
const BASE_URL = `http://api.weatherapi.com/v1/`;
const method = "forecast.json"

submitButton.addEventListener("click", _ => buildURL(BASE_URL, API_KEY, method));

document.addEventListener("keydown", e => {
    if(e.key=="Escape") {
        cardTemperature.classList.add("hidden");
        moveElement(weatherForm, "translate(-50%, -50%)");
    }
})

container.addEventListener("mouseenter", _ => container.classList.add("reverse-card"));
container.addEventListener("mouseleave", _ => container.classList.remove("reverse-card"));
sliderLegend.textContent = `Forecast: ${slider.value} days`;
slider.oninput = function() { sliderLegend.textContent = `Forecast: ${slider.value} days`; }
