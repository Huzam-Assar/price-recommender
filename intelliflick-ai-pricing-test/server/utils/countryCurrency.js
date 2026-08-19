export const COUNTRY_CURRENCY_MAP = {
  Pakistan: "PKR",
  India: "INR",
  "United States": "USD",
  "United Kingdom": "GBP",
  Australia: "AUD",
  Other: "USD"
};

export const SUPPORTED_COUNTRIES = Object.keys(COUNTRY_CURRENCY_MAP);

export function getCurrencyForCountry(country = "Pakistan") {
  return COUNTRY_CURRENCY_MAP[country] || COUNTRY_CURRENCY_MAP.Other;
}
