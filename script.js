"use strict";

// global map, mapEvent variables
// let map, mapEvent;
// can remove now, as of end of lecture 224.

class Workout {
  date = new Date();
  id = (Date.now() + "").slice(-10);
  clicks = 0;

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
    // immediately calculate pace
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `
            ${this.type[0].toUpperCase()}${this.type.slice(1)} 
            on ${months[this.date.getMonth()]} ${this.date.getDate()}
        `;
  }

  click() {
    this.clicks++;
  }
}

class Running extends Workout {
  type = "running";

  constructor(coords, distance, duration, cadence) {
    // initialize this keyword for parent class w/ super()
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    // defined in EUR as minutes per km, min/km
    this.pace = this.duration / this.distance;
  }
}

class Cycling extends Workout {
  type = "cycling";

  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    // this.type = 'cycling';
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    // measured in km/hr
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cycling1 = new Cycling([39, -12], 27, 95, 523);

// console.log(run1, cycling1);

///////////////////////////////////////
// APPLICATION ARCHITECTURE

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

class App {
  #map; // private instance properties
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];

  constructor() {
    // Get user's position
    this._getPosition();

    // Get data from local storage
    this._getLocalStorage();

    // Attach event handlers
    form.addEventListener("submit", this._newWorkout.bind(this));

    inputType.addEventListener("change", this._toggleElevationField);

    containerWorkouts.addEventListener("click", this._moveToPopup.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation) {
      // NOTE: Since we are in a CLASS, we HAVE TO USE 'THIS', and then the function in order for it to work. see below for this._loadMap. the parenthesis are not needed, only the name of the method is needed
      navigator.geolocation.getCurrentPosition(
        // on success
        this._loadMap.bind(this),
        // on failure
        function () {
          alert("Could not get your position");
        }
      );
    }
  }

  _loadMap(position) {
    console.log(position);
    // grabs coords from position object after user clicks allow using destructuring of the object with {varName}
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude];

    this.#map = L.map("map").setView(coords, this.#mapZoomLevel);

    // console.log(map);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handling clicks on map
    this.#map.on("click", this._showForm.bind(this));

    // Load workouts from local storage after map is finished loading, this is where async javascript comes in
    this.#workouts.forEach((work) => {
      this._renderWorkoutMarker(work);
    });
  }

  _showForm(mapE) {
    // copying to global variable
    this.#mapEvent = mapE;

    form.classList.remove("hidden");
    inputDistance.focus();
  }

  _hideForm() {
    // Empty inputs
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        "";

    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => (form.style.display = "grid"), 1000);
  }

  _toggleElevationField() {
    // select closest parent
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _newWorkout(e) {
    // the validInputs function will return true if and only if all of the inps checked are in fact numbers and are true. Else, if will be false. This is a helper function to validate the form data. if only one is not finite, every will return false, and that will be the return value for the arrow function.
    const validInputs = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));

    // checking if numbers are positive (another helper function)
    const allPositive = (...inputs) => inputs.every((inp) => inp > 0);

    // prevent default page reload on form submit
    e.preventDefault();
    // console.log(this);

    // LECTURE: Creating a New Workout //

    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value; // + converts string to #
    const duration = +inputDuration.value; // ""
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // If workout is running, create running object
    if (type === "running") {
      const cadence = +inputCadence.value;
      // Check if data is valid, using guard clause.
      // if distance, duration, OR cadence is NOT (comes from !) (!Number...) a number, return error immediately
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
        // again, inverting the condition. whenever this is NOT true, we want to return from the function and show this alert.
      )
        return alert("Inputs have to be positive numbers!");

      workout = new Running([lat, lng], distance, duration, cadence);
    }
    // If workout is cycling, create cycling object
    if (type === "cycling") {
      const elevation = +inputElevation.value;
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
        // elevation CAN be negative
      )
        return alert("Inputs have to be positive numbers!");

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Add new object to workout array
    this.#workouts.push(workout);
    console.log(workout);

    // Render workout on map as marker
    this._renderWorkoutMarker(workout);

    // Render workout on list
    this._renderWorkout(workout);

    // Hide form and clear input fields
    this._hideForm();

    // Set local storage to all workouts
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">
                ${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"}
            </span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
      `;

    if (workout.type === "running")
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;

    if (workout.type === "cycling")
      html += `
        <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`;

    form.insertAdjacentHTML("afterend", html);
  }

  _moveToPopup(e) {
    // using closest method to select closest element
    const workoutEl = e.target.closest(".workout");

    if (!workoutEl) return;

    const workout = this.#workouts.find(
      (work) => work.id === workoutEl.dataset.id
    );

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    // using the public interface
    // workout.click();
  }

  _setLocalStorage() {
    localStorage.setItem("workouts", JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("workouts"));
    console.log(data);

    if (!data) return;

    // Restore workouts array
    this.#workouts = data;

    // Loop over workouts array, render each workout in array with forEach
    this.#workouts.forEach((work) => {
      this._renderWorkout(work);
    });
  }

  reset() {
    // calling this method app.reset() in the console to remove the workouts item from localStorage
    localStorage.removeItem("workouts");

    // reload page
    location.reload();
  }
}

// localStorage is used for only small bits of data, uses blocking, and is considered bad. not for use for large amounts of data

// LECTURE: Using the Geolocation API

// navigator.geolocation.getCurrentPosition(param1, param2)

// the getCurrentPosition function takes two parameters.
// 1.) param1 is the callback function upon success, whenever the browser successfully retrieves the user's coordinates
// 2.) param2 is the callback function upon failure, does not get coords

const app = new App();

// form event listener

// LECTURE: Displaying a Map Using Leaflet Library

// using hosted version of leaflet from a cdn, place before our own script.js. by the time our script loads, our browser needs to have grabbed the leaflet script.

// we specified the defer attribute in the leaflet script, and since order matters, too we want to use the defer attribute for any and all js scripts.

// L, the leaflet library namespace, similar to that of the Intl namespace we used in the bankist application, is available GLOBALLY because it is defined within its own script and loads before ours.

// the example we used was that we created a file called other.js in which we defined a const called firstName = to 'Jonas' and we are able to reference that variable in our script.js, even though this same variable was not created within script.js. COOL! :) :) see below for example of this.

// script.js has access to all of the other global variables in other.js and leaflet.js, BUT other.js does NOT have access to anything from script.js because it appears AFTERWARDS.

// console.log(firstName);

// LECTURE: Displaying a Map Marker

// next -- bind an event handler that whenever the user clicks on the map, render a "workout"/pin on the map.

// first thing is to add an event handler to the map

// LECTURE: Rendering Workout Input Form

// LECTURE: Project Architecture

// initial approach

// User stories
// 1.) Log my running workouts with location, distance, time, pace, and steps/minute (cadence)

// 2.) Log my cycling workouts with location, distance, time, speed, and elevation gain

// One of the MOST important aspects of architecture is:
// DECIDING WHERE AND HOW TO STORE DATA
// likely most fundamental part of any application

// create big class called App

// LECTURE: Refactoring for Project Architecture

// code broke and said that this was undefined at the 'this.#map' in the _loadMap method.

// what we had to do is, in a regular function, this is undefined. so, in the getCurrentPosition function to fetch the current position, the _loadMap callback function's 'this' was undefined. as a result, we had to use the bind() method to manually set the 'this' keyword as a parameter in the bind function to have this work properly. this fixed out code. see lecture 234 for a video explanation showing how this worked, at the 4th note mark, at or around the 12 minute mark.

// we had to do this again to the form event listener with the _newWorkout method call, which would point to the form. we wanted this to point to the app object itself, not the form. we had to use the bind keyword.

// again we had to use the bind method for handling clicks on the map with this.#map.on('click', this._showForm), and we had to add bind(this)

// LECTURE: Managing Workout Data: Creating Classes

// both workouts have things in common
// distance and duration

// for running, we have cadence
// for cycling, we have elevation

// implement parent class for both of these workout types

// LECTURE: Creating a New Workout

// implement feature of creating a new workout from our UI

// render the workout on map

// validate user inputs too, such as no negative numbers.ect.

// LECTURE: Rendering Workouts

// render new workouts in the sidebar of our UI, create a <li> for each new workout, display in a <ul>

// LECTURE: Move to Marker on Click

// implement a feature that will move the map to the position of the workout that was clicked in the sidebar

// in this scenario, we are in a situation where the element that we want to click on startup, with zero workouts logged, does not yet exist. because in order to click on a workout, one has to exist first. this happens first for all new users because they have zero workouts stored. we want them to be able to click the specific workout they want to click and the map will center/go to the position of that workout.

// in order to handle this properly, we have to use event delegation because again - the element we want to click and attach an event handler to does not yet exist.

// add the event handler to the parent element, which is the <ul> with the class of workouts, called containerWorkouts

// LECTURE: Working with localStorage

// when we converted the workout objects to strings with JSON stringify, and then we converted them back into objects to display from localStorage, the original objects lost their prototype chain. the new objects from localSotrage are now just regular objects, not objects that were created from the running or cycling class. this is why workout.click() is no longer a function.

// to fix the problem, we could restore the objects in the getLocalStorage method and loop over the data and creating a new object based on the data from lcoalStorage, that's a bit of work though.

// what we will do, is that we will just disable the workout.click() functionality for now.

// quick and easy way to delete workouts from local storage -- adding a method to public interface.

// LECTURE: Final Considerations

// 10 additional feature ideas: challenges

/*
1. Ability to edit a workout;
2. Ability to delete a workout;
3. Ability to delete all workouts;
4. Ability to sort workouts by a certain field (e.g. distance);
5. Re-build Running and Cycling objects coming from Local Storage;
6. More realistic error and confirmation messages;

harder ones --
7. Ability to position the map to show all workouts on the map at once [very hard]
8. Ability to draw lines and shapes instead of just points [very hard]

only implementable after next section --
9. Geocode location from coordinates ("Run in Faro, Portugal") [only after asynchronous JavaScript section]
10. Display weather data for workout time and place [only after synchronous JavaScript section].
*/
