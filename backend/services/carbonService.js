const Settings = require("../models/Settings");

/**
 * Carbon Calculation Logic
 * Annual Carbon = Area × Base Rate × Health Factor
 */

const getBaseRate = (forestType, adminSettings = null) => {
  const rates = adminSettings ? adminSettings.base_rates : {
    "Broadleaf": 30,
    "Mixed": 28,
    "Pine": 24,
    "Degraded": 20
  };

  // Handle different key naming (model uses lowercase, UI uses Capitalized)
  const key = forestType.toLowerCase();
  return rates[key] || rates[forestType] || 20;
};

const getHealthFactor = (ndvi) => {
  if (ndvi >= 0.7) return 1.1;
  if (ndvi >= 0.6) return 1.0;
  if (ndvi >= 0.5) return 0.85;
  return 0.7;
};

const getHealthStatus = (ndvi) => {
  if (ndvi >= 0.7) return "Very Healthy";
  if (ndvi >= 0.6) return "Healthy";
  if (ndvi >= 0.5) return "Moderate";
  return "Poor";
};

const calculateCarbon = (area, forestType, ndvi, adminSettings = null) => {
  const baseRate = getBaseRate(forestType, adminSettings);
  const healthFactor = getHealthFactor(ndvi);
  const annualCarbon = area * baseRate * healthFactor;
  return annualCarbon;
};

module.exports = {
  calculateCarbon,
  getHealthStatus,
  getHealthFactor,
  getBaseRate
};
