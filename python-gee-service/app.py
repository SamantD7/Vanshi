from flask import Flask, request, jsonify

from utils.geometry import generate_square_polygon
from gee.vegetation_analysis import calculate_ndvi
from analysis.verification import verify_forest
from analysis.carbon_estimation import calculate_carbon

app = Flask(__name__)

@app.route("/analyze-forest", methods=["POST"])
def analyze_forest():
    data = request.json

    lat = data["latitude"]
    lon = data["longitude"]
    area_ha = data["forest_area_ha"]

    # STEP 1: Estimate polygon
    polygon = generate_square_polygon(lat, lon, area_ha)

    # STEP 2: NDVI calculation
    ndvi = calculate_ndvi(polygon)

    # STEP 3: Verification
    verification = verify_forest(ndvi)

    # STEP 4: Carbon estimation (safe)
    if verification["verification_status"] != "REJECTED":
        carbon = calculate_carbon(area_ha, verification["forest_health"])
        total_carbon = carbon["total_carbon"]
    else:
        total_carbon = 0

    return jsonify({
        "ndvi": ndvi,
        "forest_health": verification["forest_health"],
        "verification_status": verification["verification_status"],
        "carbon_tco2e": total_carbon
    })

if __name__ == "__main__":
    app.run(port=8000)
