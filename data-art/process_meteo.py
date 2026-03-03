import pandas as pd
from pathlib import Path

# ----------------------------
# 1️⃣ Fichiers
# ----------------------------
WEATHER_RAW = Path("data/weatherstats_montreal_hourly.csv")
WEATHER_CLEAN = Path("data/processed/weather_mtl_clean.csv")

# ----------------------------
# 2️⃣ Charger le dataset météo
# ----------------------------
df_weather = pd.read_csv(WEATHER_RAW)

# ----------------------------
# 3️⃣ Garder uniquement les colonnes utiles
# ----------------------------
df_weather = df_weather[["date_time_local", "temperature"]]

# ----------------------------
# 4️⃣ Convertir date_time_local en datetime
# ----------------------------
df_weather["date_time_local"] = pd.to_datetime(
    df_weather["date_time_local"].astype(str).str.replace(" HNE", ""),
    errors="coerce"
)

# Supprimer les lignes avec dates invalides
df_weather = df_weather.dropna(subset=["date_time_local"])

# ----------------------------
# 5️⃣ Supprimer les doublons
# ----------------------------
df_weather = df_weather.drop_duplicates(subset="date_time_local")

# ----------------------------
# 6️⃣ Supprimer les lignes avec temperature manquante
# ----------------------------
df_weather = df_weather.dropna(subset=["temperature"])

# ----------------------------
# 7️⃣ Filtrer pour dates >= 2019-01-01
# ----------------------------
df_weather = df_weather[df_weather["date_time_local"].dt.year >= 2019]

# ----------------------------
# 8️⃣ Sauvegarde
# ----------------------------
WEATHER_CLEAN.parent.mkdir(parents=True, exist_ok=True)
df_weather.to_csv(WEATHER_CLEAN, index=False)

print(f"Dataset météo nettoyé et filtré sauvegardé ici : {WEATHER_CLEAN}")
print(f"Nombre de lignes : {len(df_weather)}")