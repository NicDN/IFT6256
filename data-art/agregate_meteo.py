import pandas as pd
from pathlib import Path

# ----------------------------
# 1️⃣ Dossiers et fichiers
# ----------------------------
BIKE_FILE = Path("data/processed/bike_data_hourly_by_counter.csv")
WEATHER_FILE = Path("data/weatherstats_montreal_hourly.csv")
OUTPUT_FILE = Path("data/processed/bike_with_weather_filtered.csv")

# ----------------------------
# 2️⃣ Charger les datasets
# ----------------------------
df_bike = pd.read_csv(BIKE_FILE)
df_weather = pd.read_csv(WEATHER_FILE)

# ----------------------------
# 3️⃣ Convertir datetime
# ----------------------------
# Vélo
df_bike["datetime"] = pd.to_datetime(df_bike["datetime"], errors="coerce")
df_bike = df_bike.dropna(subset=["datetime"])
df_bike["datetime_hour"] = df_bike["datetime"].dt.floor("H")

# Filtrer les compteurs à zéro
df_bike = df_bike[df_bike["nb_passages"] > 0]

# Météo
df_weather["datetime"] = pd.to_datetime(
    df_weather["date_time_local"].astype(str).str.replace(" HNE", ""),
    errors="coerce"
)
df_weather = df_weather.dropna(subset=["datetime"])
df_weather["datetime_hour"] = df_weather["datetime"].dt.floor("H")

# garder uniquement datetime_hour + temperature et enlever doublons
df_weather = df_weather[["datetime_hour", "temperature"]].drop_duplicates(subset="datetime_hour")

print(f"Nombre de NaN dans temperature avant merge : {df_weather['temperature'].isna().sum()}")

# ----------------------------
# 4️⃣ Merge datasets
# ----------------------------
df_merged = df_bike.merge(
    df_weather,
    on="datetime_hour",
    how="left"
)

# ----------------------------
# 5️⃣ Combler les températures manquantes
# ----------------------------
df_merged["temperature"] = df_merged["temperature"].fillna(method="ffill")

print("Shape après merge:", df_merged.shape)
print("Nombre de NaN température après forward fill:", df_merged["temperature"].isna().sum())
print(df_merged.head())

# ----------------------------
# 6️⃣ Sauvegarde
# ----------------------------
df_merged.to_csv(OUTPUT_FILE, index=False)
print(f"Dataset final sauvegardé ici : {OUTPUT_FILE}")