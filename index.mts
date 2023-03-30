import { config } from "dotenv";
import axios from "axios";
import { exit } from "process";
config();

const city = process.argv[2] as string | undefined;

if (!city) {
    console.error("Error: No city specified. Add city name as parameter.");
    exit(1);
}

type Current = {
    last_updated: string;
    temp_c: number;
    wind_kph: number;
    wind_dir: string;
    pressure_mb: number;
    condition: {
        text: string;
        icon: string;
    };
};

type Forecast = {
    forecastday: {
        date: string;
        day: {
            maxtemp_c: number;
            mintemp_c: number;
            maxwind_kph: number;
            condition: {
                text: string;
                icon: string;
            };
        };
    }[];
};

type Location = {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime: string;
};

const { WEATHER_API_KEY, WEATHER_API_URL } = process.env;

const formatLocationOptupt = (l: Location) => {
    return `${l.name}, ${l.country}`;
};

const formatCurrentOutput = (c: Current) => {
    return `Now is ${c.condition.text}, ${c.temp_c}C, wind is ${c.wind_kph}km/h ${c.wind_dir}`;
};

const formatForecastOutput = (f: Forecast) => {
    return f.forecastday.reduce((acc, { date, day }) => {
        acc += `${date}: ${day.condition.text}, ${day.mintemp_c}C-${day.maxtemp_c}C, wind ${day.maxwind_kph}km/h\n`;
        return acc;
    }, "");
};

const getCurrent = async (city: string) => {
    const url = `${WEATHER_API_URL}current.json?key=${WEATHER_API_KEY}&q=${city}&aqi=no`;
    try {
        const { data } = await axios.get(url);
        return data as {
            location: Location;
            current: Current;
        };
    } catch (e) {
        throw new Error("getCurrent api call error");
    }
};

const getForecast = async (city: string, days: number = 10) => {
    const url = `${WEATHER_API_URL}forecast.json?key=${WEATHER_API_KEY}&q=${city}&days=${days}&aqi=no&alerts=no`;
    try {
        const { data } = await axios.get(url);
        return data as {
            location: Location;
            current: Current;
            forecast: Forecast;
        };
    } catch (e) {
        throw new Error("getForecast api call error");
    }
};

const searchOptions = async (query: string) => {
    const url = `${WEATHER_API_URL}search.json?key=${WEATHER_API_KEY}&q=${query}`;
    try {
        const { data } = await axios.get(url);
        return data as Location[];
    } catch (e) {
        throw new Error("searchOptions api call error");
    }
};

// searchOptions("Batum").then(console.log);
// getCurrent("Batumi").then(console.log);
getForecast(city).then((res) => {
    const output =
        formatLocationOptupt(res.location) +
        "\n" +
        formatCurrentOutput(res.current) +
        "\n" +
        formatForecastOutput(res.forecast);
    console.log(output);
});
