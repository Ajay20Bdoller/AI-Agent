import { config } from "dotenv";
import axios from "axios";

config();

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

export async function getWeather(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const response = await axios.get(url);
    const data = response.data;
    const temperature = data.main.temp;
    const location = data.name;
    const weatherDescription = data.weather[0].description;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;

    return {
      content: [
        {
          type: "text",
          text: `The current weather in ${location} is ${weatherDescription} with a temperature of ${temperature}°C, humidity of ${humidity}%, and wind speed of ${windSpeed} m/s.`,
        },
      ],
      raw: data,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: "Failed to fetch weather. Please check the city name or try again later.",
        },
      ],
      error: error.message,
    };
  }
}