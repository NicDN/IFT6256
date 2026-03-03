import pandas as pd
from pathlib import Path

# ----------------------------
# Dossiers et fichiers
# ----------------------------
DATA_DIR = Path("data/processed")
OUTPUT_DIR = Path("data/processed")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# CSV à convertir
FILES = [
    "bike_data_hourly_by_counter.csv",
    "weather_mtl_clean.csv"
]

# ----------------------------
# Conversion CSV → JSON (uniquement 2025)
# ----------------------------
for file_name in FILES:
    csv_path = DATA_DIR / file_name
    json_name = file_name.replace(".csv", "_2025.json")
    json_path = OUTPUT_DIR / json_name

    print(f"Conversion {csv_path} → {json_path} ...")

    # Lire CSV
    df = pd.read_csv(csv_path)

    # Filtrer uniquement l'année 2025
    if "datetime" in df.columns:
        df["datetime"] = pd.to_datetime(df["datetime"], errors="coerce")
        df = df[df["datetime"].dt.year == 2025]
        # Supprimer les compteurs à zéro
        if "nb_passages" in df.columns:
            df = df[df["nb_passages"] > 0]
        df["datetime"] = df["datetime"].astype(str)  # reconvertir en string

    if "date_time_local" in df.columns:
        df["date_time_local"] = pd.to_datetime(df["date_time_local"], errors="coerce")
        df = df[df["date_time_local"].dt.year == 2025]
        df["date_time_local"] = df["date_time_local"].astype(str)

    # Convertir en JSON records
    df.to_json(json_path, orient="records", date_format="iso")

    print(f"{json_path} créé !")

print("✅ Conversion 2025 terminée !")