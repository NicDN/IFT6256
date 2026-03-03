import pandas as pd
import csv


# Load the original dataset
df = pd.read_csv("data/weatherstats_montreal_hourly.csv")

# Remove the timezone string from the date_time_local column
df['date_time_local'] = df['date_time_local'].str.slice(0, 19)  # keep only 'YYYY-MM-DD HH:MM:SS'

# Convert to datetime
df['date'] = pd.to_datetime(df['date_time_local']).dt.date

# Keep only rows for 2026-02-27
df_filtered = df[df['date'] == pd.to_datetime("2026-02-27").date()]

# Keep only the columns we want
columns_to_keep = ['date_time_local', 'temperature', 'relative_humidity', 'wind_speed', 'wind_dir']
df_filtered = df_filtered[columns_to_keep]

# Save to a new CSV
df_filtered.to_json("montreal_weather_2026-02-27.json", orient="records", indent=2)
print("Processed dataset saved: montreal_weather_2026-02-27.json")