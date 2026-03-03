import pandas as pd
import numpy as np

# Load the new dataset
df = pd.read_csv("data/climate-daily.csv")

# Convert LOCAL_DATE to datetime
df['LOCAL_DATE'] = pd.to_datetime(df['LOCAL_DATE'])

# Filter only year 2012 (probably redundant if file is 2012 only)
df_filtered = df[df['LOCAL_DATE'].dt.year == 2012]

# Columns to keep
columns_to_keep = [
    'LOCAL_DATE',        # date
    'MIN_TEMPERATURE',   # min temp
    'MAX_TEMPERATURE',   # max temp
    'MEAN_TEMPERATURE',  # mean temp
    'TOTAL_RAIN',        # total rain
    'TOTAL_SNOW',        # total snow
    'DIRECTION_MAX_GUST',# wind direction
    'SPEED_MAX_GUST'     # wind speed
]
df_filtered = df_filtered[columns_to_keep]

# Convert numeric columns to float, handle 'T' and empty strings
numeric_cols = ['MIN_TEMPERATURE','MAX_TEMPERATURE','MEAN_TEMPERATURE','TOTAL_RAIN','TOTAL_SNOW','SPEED_MAX_GUST']
for col in numeric_cols:
    df_filtered[col] = pd.to_numeric(df_filtered[col].replace('T', 0), errors='coerce').fillna(0)

# Save to JSON for p5.js
df_filtered.to_json("montreal_weather_2012.json", orient="records", indent=2)

print("Processed dataset saved: montreal_weather_2012.json")