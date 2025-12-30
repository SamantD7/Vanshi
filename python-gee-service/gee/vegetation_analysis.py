import ee
import os
import json

# Initialize Earth Engine
service_account_info = json.loads(os.environ["EE_SERVICE_ACCOUNT_KEY"])

credentials = ee.ServiceAccountCredentials(
    service_account_info["client_email"],
    key_data=json.dumps(service_account_info)
)

ee.Initialize(credentials)


def calculate_ndvi(polygon):
    geometry = ee.Geometry.Polygon(polygon)

    # ✅ USE HARMONIZED DATASET (FIXES BAND MISMATCH)
    collection = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(geometry)
        .filterDate("2024-01-01", "2024-12-31")
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 15))
        # ✅ FORCE HOMOGENEOUS BANDS
        .select(["B4", "B8"])
    )

    # If no images, return 0
    if collection.size().getInfo() == 0:
        return 0.0

    image = collection.median()

    # NDVI
    ndvi = image.normalizedDifference(["B8", "B4"]).rename("NDVI")
    ndvi = ndvi.updateMask(ndvi.gt(0.3))

    stats = ndvi.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=geometry,
        scale=10,
        maxPixels=1e9
    )

    ndvi_value = stats.get("NDVI")

    if ndvi_value is None:
        return 0.0

    return float(ndvi_value.getInfo())
