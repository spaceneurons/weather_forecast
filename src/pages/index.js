import "./index.css";

class Api {
  constructor() {
    this._keyWeather = '14926d4323273168c22be818f4f8b491';
    this._mainUrl = 'https://api.openweathermap.org/data/2.5/weather?';
    this._keyPhoto = '19932890-3440ea8c759315d97a3ef428e';
    this._photoUrl = 'https://pixabay.com/api/?key='
  }


  getLocation() {
    //делаем запрос на локализацию устройства
    return fetch('https://ipapi.co/json/')
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        return Promise.reject(`Ошибка: ${res.status}`);
      })
  }

  getWeather(lat, lon) {
    //делаем запрос на погоду по кординатам
    return fetch(`${this._mainUrl}lat=${lat}&lon=${lon}&units=metric&appid=${this._keyWeather}&lang=ru`)
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        return Promise.reject(`Ошибка: ${res.status}`);
      })
  }

  getAnotherWeather(city) {
    //делаем запрос  на погоду в другом городе
    return fetch(`${this._mainUrl}q=${city}&units=metric&appid=${this._keyWeather}&lang=ru`)
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        return Promise.reject(`Ошибка: ${res.status}`);
      })
  }

  // &category=places

  getPhoto({ name, weather }) {
    //делаем запрос на фото по городу и погоде
    return fetch(`${this._photoUrl}${this._keyPhoto}&q=${name}+city+${weather[0].main}&lang=ru&image_type=photo&orientation=horizontal&category=places`)
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        return Promise.reject(`Ошибка: ${res.status}`);
      })
  }

  getOtherPhoto(weather) {
    //делаем запрос на фото только по погоде
    return fetch(`${this._photoUrl}${this._keyPhoto}&q=${weather}+weather&lang=ru&image_type=photo&orientation=horizontal&category=backgrounds`)
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        return Promise.reject(`Ошибка: ${res.status}`);
      })
  }

  getPhotoOnlyCity({ name }) {
    //делаем запрос на фото только по городу
    return fetch(`${this._photoUrl}${this._keyPhoto}&q=${name}+city&lang=ru&image_type=photo&orientation=horizontal&category=places`)
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        return Promise.reject(`Ошибка: ${res.status}`);
      })
  }
}


let myMap;

function createdMap(lat, lng) {
  const script = document.createElement('script');

  script.onload = () => {
    ymaps.ready(() => initMap(lat, lng));
  };

  script.id = 'ymaps';
  script.src = "https://api-maps.yandex.ru/2.1/?apikey=8d35dcd4-01c9-4da3-ac23-1daa50fa2b8c&lang=ru_RU";

  document.head.append(script);
}


export function initMap(lat, lng) {
  myMap = new ymaps.Map('map', {
    center: [lat, lng],
    zoom: 8,
    controls: [],

  });

  // Создание геообъекта с типом точка (метка)
  const myGeoObject = new ymaps.GeoObject({
    geometry: {
      type: "Point",
      coordinates: [lat, lng]
    },
    properties: {}
  }, {
    preset: "islands#darkOrangeDotIcon",
  });

  myMap.geoObjects.add(myGeoObject);
}

export function deleteMap() {
  myMap.destroy();
}

const config = {
  photoTown: document.querySelector('.container-pic'),
  mainCity: document.querySelector('.city'),
  temperature: document.querySelector('.city-tem'),
  cityName: document.querySelector('.city-name'),
  weatherDesc: document.querySelector('.city-descrip-weather'),
  weatherIcon: document.querySelector('.city-icon-weather'),
  cityDate: document.querySelector('.city-date'),
  addInfo: document.querySelector('.add-info'),
  searchForm: document.querySelector('.add-info-form'),
  temFeelsLike: document.querySelector('.add-info-data_type_feels'),
  wind: document.querySelector('.add-info-data_type_wind'),
  humidity: document.querySelector('.add-info-data_type_humidity'),
  userCity: document.querySelector('.add-info-list-el_type_main'),
  precipitation: document.querySelector('.add-info-data_type_precipitation'),
  forDate: {
    days:['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'],
    months:['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'],
  }
}

// ---ФУНКЦИИ---
// функция отображения данных на странице
function changeContent(data) {
  config.cityName.textContent = data.name;
  config.temperature.innerHTML = Math.round(data.main.temp) + '&deg;';
  config.weatherDesc.textContent = data.weather[0]['description'];
  config.weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0]['icon']}@2x.png`;
  config.cityDate.textContent = genereteDate(data);
  config.temFeelsLike.innerHTML = Math.round(data.main.feels_like) + '&deg;';
  config.wind.textContent = `${data.wind.speed} м/с`;
  config.humidity.textContent = `${data.main.humidity}%`;
  config.precipitation.textContent = findPrecipitation(data);
}

// функция отображения города пользователя в панели слева
function getUserCity(data) {
  config.userCity.textContent = data.name;
}

// функция отображения осадков
function findPrecipitation(data) {
  if (!data.rain && !data.snow) {
    return '0 мм';
  }
  return `${(data.rain) ? data.rain['1h'] : data.snow['1h']} мм`
}

// функция верного отображения времени
function genereteDate(data) {
  const ourDate = new Date(Date.now() + (data.timezone * 1000));

  function formatTime(num) {
    if (String(num).length < 2) {
      return `0${num}`;
    }
    return num;
  }

  const resStr = `${formatTime(ourDate.getUTCHours())}:${formatTime(ourDate.getUTCMinutes())}
  - ${config.forDate.days[ourDate.getDay()]},
  ${ourDate.getUTCDate()}
  ${config.forDate.months[ourDate.getMonth()]}
  ${ourDate.getUTCFullYear()}`;

  return resStr;
}

// функция определения местоположения, при запрете от пользователя
function setLocation(error) {
  if (error.code == error.PERMISSION_DENIED) {
    api.getLocation()
      .then(data => {
        createdMap(data.latitude, data.longitude);
        return api.getWeather(data.latitude, data.longitude);
      })
      .then(data => {
        findPhoto(data);
        changeContent(data);
        getUserCity(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}


// функция отрисовки фото
function changePhoto(dataPhoto) {
  config.photoTown.src = dataPhoto.hits[0]['largeImageURL'];
}

// функция фильтрации фото
function findPhoto(dataWeather) {
  const weather = dataWeather.weather[0].main;
  api.getPhoto(dataWeather)
    .then(dataPhoto => {
      if (dataPhoto.total !== 0) {
        changePhoto(dataPhoto);
      } else {
        api.getPhotoOnlyCity(dataWeather)
          .then(dataPhoto => {
            changePhoto(dataPhoto);
          })
          .catch(() => {
            api.getOtherPhoto(weather)
              .then(dataPhoto => {
                changePhoto(dataPhoto);
              });
          })
      }
    })
    .catch((err) => {
      console.log(err);
    })
}

// функция первичной отрисовки информации
function getFirstInfo() {
  navigator.geolocation.getCurrentPosition(position => {
    createdMap(position.coords.latitude, position.coords.longitude);

    api.getWeather(position.coords.latitude, position.coords.longitude)
      .then(data => {
        findPhoto(data);
        changeContent(data);
        getUserCity(data);
      })
      .catch((err) => {
        console.log(err);
      })
    },
    function (error) {
      setLocation(error);
    }
  )
}

// функция обновления информации
function updateInfo(nameOfCity = config.cityName.textContent) {
  api.getAnotherWeather(nameOfCity)
    .then(data => {
      if (config.cityName.textContent !== data.name) {
        findPhoto(data);
        deleteMap();
        initMap(data.coord.lat, data.coord.lon);
      }
      changeContent(data);
    })
    .catch((err) => {
      console.log(err);
    })
}



// ---СЛУШАТЕЛИ СОБЫТИЙ---
config.searchForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  let nameOfCity = document.querySelector('.add-info-input').value;
  updateInfo(nameOfCity);
  // config.searchForm.reset();
});

// делегирование событий
config.addInfo.addEventListener("click", (evt) => {
  if(evt.target.classList.contains('add-info-list-el')) {
    updateInfo(evt.target.textContent)
  }
})


// ---ДЕЙСТВИЯ ПРИ ЗАКГРУЗКЕ СТРАНИЦЫ---
const api = new Api();

// получаем данные при начальной загрузке страницы
getFirstInfo();

// обновляем данные каждые 30 сек
setInterval(updateInfo, 30000);




