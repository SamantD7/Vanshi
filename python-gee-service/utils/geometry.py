import math

def generate_square_polygon(lat, lon, area_ha):
    area_m2 = area_ha * 10000
    side = math.sqrt(area_m2)
    half = side / 2

    meters_lat = 111320
    meters_lon = 111320 * math.cos(math.radians(lat))

    dlat = half / meters_lat
    dlon = half / meters_lon

    return [
        [lon - dlon, lat - dlat],
        [lon + dlon, lat - dlat],
        [lon + dlon, lat + dlat],
        [lon - dlon, lat + dlat],
        [lon - dlon, lat - dlat]
    ]
