import pandas as pd
from pathlib import Path

# ==========================================================
# 1️⃣ CONFIGURATION
# ==========================================================

DATA_DIR = Path("data")   # dossier contenant les CSV
OUTPUT_DIR = Path("data/processed")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

YEARS = range(2019, 2027)

# ==========================================================
# 2️⃣ CHARGEMENT ET CONCATÉNATION
# ==========================================================

dfs = []

for year in YEARS:
    file_path = DATA_DIR / f"comptage_velo_{year}.csv"
    print(f"Chargement {file_path}...")
    
    df_year = pd.read_csv(file_path)
    df_year["annee_source"] = year  # utile pour debug
    dfs.append(df_year)

print("Concaténation...")
df = pd.concat(dfs, ignore_index=True)
print("Shape après concaténation:", df.shape)

# ==========================================================
# 3️⃣ NETTOYAGE DES COLONNES
# ==========================================================

df["date"] = df["date"].astype(str).str.strip()
df["heure"] = df["heure"].astype(str).str.strip()
df["heure"] = df["heure"].str.slice(0, 8)  # garder HH:MM:SS

# ==========================================================
# 4️⃣ CRÉATION DE LA COLONNE DATETIME
# ==========================================================

df["datetime"] = pd.to_datetime(
    df["date"] + " " + df["heure"],
    errors="coerce"
)
df = df.dropna(subset=["datetime"])

# ==========================================================
# 5️⃣ CONVERSION DES TYPES NUMÉRIQUES
# ==========================================================

df["nb_passages"] = pd.to_numeric(df["nb_passages"], errors="coerce")
df["longitude"] = pd.to_numeric(df["longitude"], errors="coerce")
df["latitude"] = pd.to_numeric(df["latitude"], errors="coerce")
df = df.dropna(subset=["nb_passages", "longitude", "latitude"])

# ==========================================================
# 6️⃣ TRI TEMPOREL
# ==========================================================

df = df.sort_values("datetime").reset_index(drop=True)

# ==========================================================
# 7️⃣ SUPPRESSION DES COLONNES INUTILES
# ==========================================================

df = df.drop(columns=["date", "heure"])
print("Shape final:", df.shape)
print(df.head())

# ==========================================================
# 8️⃣ VERSION AGRÉGÉE PAR COMPTEUR + HEURE
# ==========================================================

print("Création version agrégée par compteur + heure...")

# Arrondir à l'heure
df["datetime_hour"] = df["datetime"].dt.floor("H")

# Agréger par compteur et heure
df_hourly_by_counter = (
    df
    .groupby(["datetime_hour", "id_compteur", "longitude", "latitude"])
    .agg({"nb_passages": "sum"})
    .reset_index()
)

# Renommer pour cohérence
df_hourly_by_counter = df_hourly_by_counter.rename(columns={"datetime_hour": "datetime"})

hourly_counter_output_path = OUTPUT_DIR / "bike_data_hourly_by_counter.csv"
df_hourly_by_counter.to_csv(hourly_counter_output_path, index=False)

print(f"Dataset compteur horaire sauvegardé ici : {hourly_counter_output_path}")
print("✅ Processing terminé.")