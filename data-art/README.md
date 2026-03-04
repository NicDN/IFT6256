# Oeuvre inspiré par un algorithme

Nom de l'oeuvre: Réchauffement climatique

## Description de l'oeuvre
Cet oeuvre est basée sur un jeu de données public de la NASA GISS Surface Temperature Analysis (GISTEMP)

Lien vers la page contenant le téléchargement du dataset: https://data.giss.nasa.gov/gistemp/ 

On peut télécharger le tadaset du suivant le nom: "Combined Land-Surface Air and Sea-Surface Water Temperature Anomalies, Global-mean monthly, seasonal, and annual means, 1880-present, updated through most recent month" sous format .csv. 

L'oeuvre transformer les données de températures mensuelles (écart à une moyenne de référence de 1951-1980 ) en visualisation circulaire qui se construit de façon progressive, un mois à la fois. 

## Jeu de données
Le fichier data/dataset.csv contient :

- une colonne Year (année)
- 12 colonnes mensuelles Jan ... Dec
- des valeurs numériques d’anomalie (ex: -0.25, 0.91, 1.48),
*** pour indiquer une valeur manquante

## Aspect visuel
L'oeuvre d'art est une comme une horloge de température. Un tour de cercle représente un cycle annuel de 12 mois. Les années subséquentes s'empiles en anneaux autour. Chaque mois ajout une nouveau segment qui permet de voir l'évolution climatique. 


## Comment les données sont transposés dans l'oeuvre

### Année en anneau
Un année = un anneau
Les anneaux sont ordonnées par années. Les plus anciens sont plus proches du centre. 

le rayon annuel est calculé comme suit  
`rBase = innerR + yearIndex * ringStep`

### Mois convertis en arc
La transposition s'effectue comme suit:
- `t0 = -HALF_PI + m * (TWO_PI / 12)`
- `t1 = t0 + (TWO_PI / 12)`

### Valeur d'anomalie (degrés C)
- Anomalie négaitve convertie en teinte bleue
- Anomalie positive convertie en teinte rouge

`hue = map(a, minA, maxA, 210, 0)`
- minA et et maxA sont les plus grandes anomalies rencontrés

### Épaisseur du trait : intensité de l'anomalie
plus |anomalie| est grand, plus le trait est épais. 

`w = map(abs(a), 0, maxAbs, 0.5, ringStep * 1.25)`

### Décalage radial 
La valeur de l'anomalie décale légèrement le segment vers l'extérieur ou l'intérieur (peu visibible). 

- Anomalie positive = segment poussé vers l'extérieur
- Anomalie négative = segment poussé vers l'intérieur

### Valeurs manquantes

Si la donnée d'anomalie correspond à `***`, le canvas n'affiche rien. 