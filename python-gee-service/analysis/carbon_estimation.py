RATES = {
    "DENSE": 25,
    "MODERATE": 18,
    "SPARSE": 10
}

def calculate_carbon(area_ha, forest_health):
    rate = RATES.get(forest_health, 0)
    return {
        "total_carbon": area_ha * rate
    }
