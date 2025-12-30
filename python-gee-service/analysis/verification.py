def verify_forest(ndvi):
    if ndvi >= 0.65:
        return {"forest_health": "DENSE", "verification_status": "AUTO_VERIFIED"}
    elif ndvi >= 0.45:
        return {"forest_health": "MODERATE", "verification_status": "AUTO_VERIFIED"}
    elif ndvi >= 0.30:
        return {"forest_health": "SPARSE", "verification_status": "MANUAL_REVIEW"}
    else:
        return {"forest_health": "NON_FOREST", "verification_status": "REJECTED"}
