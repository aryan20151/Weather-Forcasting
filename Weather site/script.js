const apiKey = '8a92972cc3c0ce215040bbc6937955e0';
const searchInput = document.querySelector('.search-input');
const searchButton = document.querySelector('.search-button');
const weatherInfo = document.querySelector('.weather-info');
const container = document.querySelector('.container');


function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-US', options);
}


function isDaytime(sunrise, sunset, timezone) {
    const now = new Date().getTime() / 1000 + new Date().getTimezoneOffset() * 60; 
    const localTime = now + timezone; 
    return localTime > sunrise && localTime < sunset;
}


function setDynamicBackground(weather, isDay) {
    const weatherType = weather.toLowerCase();
    let backgroundConfig = {
        overlay: 'rgba(0, 0, 0, 0.2)',
        background: ''
    };

    if (isDay) {
        switch(true) {
            case weatherType.includes('clear'):
                backgroundConfig.background = 'linear-gradient(to bottom, #4BA2EA, #94C5F8)';
                break;
            case weatherType.includes('cloud'):
                backgroundConfig.background = 'linear-gradient(to bottom, #7B97AD, #B4BEC8)';
                break;
            case weatherType.includes('rain'):
                backgroundConfig.background = 'linear-gradient(to bottom, #345866, #798B94)';
                break;
            case weatherType.includes('snow'):
                backgroundConfig.background = 'linear-gradient(to bottom, #94A5AB, #C8D8E0)';
                break;
            default:
                backgroundConfig.background = 'linear-gradient(to bottom, #4BA2EA, #94C5F8)';
        }
    } else {
        switch(true) {
            case weatherType.includes('clear'):
                backgroundConfig.background = 'linear-gradient(to bottom, #1C2331, #2C3E50)';
                break;
            case weatherType.includes('cloud'):
                backgroundConfig.background = 'linear-gradient(to bottom, #23303F, #485563)';
                break;
            case weatherType.includes('rain'):
                backgroundConfig.background = 'linear-gradient(to bottom, #1F2937, #374151)';
                break;
            case weatherType.includes('snow'):
                backgroundConfig.background = 'linear-gradient(to bottom, #2C3440, #485563)';
                break;
            default:
                backgroundConfig.background = 'linear-gradient(to bottom, #1C2331, #2C3E50)';
        }
    }

    document.body.style.background = backgroundConfig.background;
    document.body.style.animation = 'none';
}

async function getLocationDetails(lat, lon) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`
        );
        const data = await response.json();
        return data[0];
    } catch (error) {
        console.error('Error fetching location details:', error);
        return null;
    }
}


async function getWeather(city) {
    try {
        
        const geoResponse = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
        );
        const geoData = await geoResponse.json();

        if (!geoData.length) {
            alert('City not found. Please try again.');
            return;
        }

        const { lat, lon } = geoData[0];
        

        const locationDetails = await getLocationDetails(lat, lon);


        const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
        );
        const weatherData = await weatherResponse.json();

        if (weatherResponse.ok) {
            displayWeather(weatherData, locationDetails);
        } else {
            alert('Error fetching weather data. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while fetching data.');
    }
}

function displayWeather(data, locationDetails) {
    const {
        name: city,
        main: { temp, humidity },
        weather: [{ description, icon }],
        wind: { speed },
        sys: { sunrise, sunset },
        timezone
    } = data;

    const isDay = isDaytime(sunrise, sunset, timezone);
    setDynamicBackground(description, isDay);

    let locationString = city;
    if (locationDetails) {
        if (locationDetails.state) {
            locationString += `, ${locationDetails.state}`;
        }
        if (locationDetails.country) {
            locationString += `, ${locationDetails.country}`;
        }
    }

    
    weatherInfo.style.opacity = '0';
    
    setTimeout(() => {
        document.querySelector('.city').textContent = locationString;
        document.querySelector('.date').textContent = formatDate(new Date());
        document.querySelector('.temp').textContent = `${Math.round(temp)}°C`;
        document.querySelector('.description').textContent = description;
        document.querySelector('.humidity').children[1].textContent = `${humidity}%`;
        document.querySelector('.wind').children[1].textContent = `${Math.round(speed * 3.6)} km/h`;
        

        const iconCode = isDay ? icon : icon.replace('d', 'n');
        document.querySelector('.weather-icon').src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
        
    
        weatherInfo.style.opacity = '1';
    }, 300);
}


weatherInfo.style.transition = 'opacity 0.3s ease';


searchButton.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if (city) {
        getWeather(city);
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = searchInput.value.trim();
        if (city) {
            getWeather(city);
        }
    }
});


getWeather('London'); 