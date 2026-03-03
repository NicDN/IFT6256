# read csv
import pandas as pd
import csv

# Load the original dataset
df = pd.read_csv("data/climate-daily.csv")

# look for values of DIRECTION_MAX_GUST
print(df['DIRECTION_MAX_GUST'])