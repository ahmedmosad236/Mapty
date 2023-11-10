'use strict';

// prettier-ignore

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class WOrkout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  constructor(coords, duration, distance) {
    this.coords = coords;
    this.duration = duration;
    this.distance = distance;
  }

  _setdiscreption() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    console.log(this.type);
    this.discreption = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class running extends WOrkout {
  type = 'running';
  constructor(coords, duration, distance, cadence) {
    super(coords, duration, distance);
    this.cadence = cadence;
    this.calcpace();
    this._setdiscreption();
  }

  calcpace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class cycle extends WOrkout {
  type = 'cycling';
  constructor(coords, duration, distance, elevationGain) {
    super(coords, duration, distance);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setdiscreption();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const run = new running([39, -12], 5.2, 24, 178);
// const cycle1 = new cycle([39, -12], 27, 95, 523);
// console.log(run, cycle1);

class app {
  #map;
  #mapEvent;
  #workout = [];
  constructor() {
    this._getpostition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleType);
  }

  _getpostition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadmap.bind(this),
        function () {
          alert('could not get your location');
        }
      );
  }

  _loadmap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showform.bind(this));
  }

  _showform(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideform() {
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';
    form.classList.add('hidden');
  }

  _toggleType() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();

    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workOUT;

    if (type === 'running') {
      const cadence = +inputCadence.value;
      if (
        !Number.isFinite(distance) ||
        !Number.isFinite(duration) ||
        !Number.isFinite(cadence)
      )
        return alert('Inputs have to the positive number');
      if (distance < 0 || duration < 0 || cadence < 0)
        return alert('Inputs have to the positive number');
      workOUT = new running([lat, lng], duration, distance, cadence);
    }

    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !Number.isFinite(distance) ||
        !Number.isFinite(duration) ||
        !Number.isFinite(elevation)
      )
        return alert('Inputs have to the positive number');
      if (distance < 0 || duration < 0 || elevation < 0)
        return alert('Inputs have to the positive number');
      workOUT = new cycle([lat, lng], duration, distance, elevation);
    }

    this.#workout.push(workOUT);
    this._rendermarkerworkout(workOUT);
    this._renderworkout(workOUT);

    this._hideform();
    // const { lat, lng } = this.#mapEvent.latlng;
  }

  _rendermarkerworkout(workout) {
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
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.discreption}`
      )
      .openPopup();
  }

  _renderworkout(workout) {
    let html = `<li class="workout workout--${workout.type}" data-id="${workout.id}">
    <h2 class="workout__title">${workout.discreption}</h2>
    <div class="workout__details">
      <span class="workout__icon">🏃‍♂️</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>`;

    if (workout.type === 'running')
      html += `<div class="workout__details">
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

    if (workout.type === 'cycling')
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

    form.insertAdjacentHTML('afterend', html);
  }
}

const App = new app();
