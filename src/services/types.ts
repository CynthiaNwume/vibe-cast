export type WeatherCondition = {
  main: string;
  description?: string;
  icon?: string;
};

export type WeatherBundle = {
  timezone: string;
  current: {
    dt: number;
    temp: number;
    feels_like: number;
    wind_speed: number;
    wind_deg?: number;   // NEW
    uvi?: number;
    clouds: number;
    humidity?: number;
    pressure?: number;
    weather: WeatherCondition[];
  };
  hourly: {
    dt: number;
    temp: number;
    pop?: number; // precipitation probability (0..1)
    weather: WeatherCondition[];
  }[];
  daily: {
    dt: number;
    temp: { min: number; max: number };
    pop?: number;
    weather: WeatherCondition[];
    // NEW optional per-day details (populated when provider supports it)
    sunrise?: number;    // unix seconds
    sunset?: number;     // unix seconds
    uvi?: number;        // daily max UV
    humidity?: number;   // %
    pressure?: number;   // hPa
  }[];
  source?: "live-openweather" | "live-openmeteo" | "demo";
};
