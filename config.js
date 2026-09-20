// config.js
// Central configuration for the district the platform serves.
// To run for a different district:  DISTRICT="Warangal" npm start

module.exports = {
  // Name of the district the platform serves
  DISTRICT: process.env.DISTRICT || 'Krishna District',
  STATE: process.env.STATE || 'Andhra Pradesh',

  // Villages / mandals of the district (used in filters + registration dropdown)
  VILLAGES: [
    'Vijayawada', 'Gudivada', 'Machilipatnam', 'Nuzvid', 'Jaggayyapeta',
    'Vuyyuru', 'Gannavaram', 'Kankipadu', 'Penamaluru', 'Pamarru',
    'Avanigadda', 'Pedana', 'Bantumilli', 'Mudinepalli', 'Kalavapamula'
  ],

  // Recognised crops (keeps the record "structured" and filterable)
  CROPS: [
    'Rice (Paddy)', 'Tomato', 'Onion', 'Brinjal', 'Chilli', 'Potato',
    'Cabbage', 'Cauliflower', 'Carrot', 'Okra', 'Bitter Gourd',
    'Leafy Greens', 'Groundnut', 'Maize', 'Cotton', 'Sugarcane',
    'Banana', 'Mango', 'Turmeric', 'Sunflower'
  ],

  // Emoji icon per crop for the UI
  CROP_EMOJI: {
    'Rice (Paddy)': '🌾', 'Tomato': '🍅', 'Onion': '🧅', 'Brinjal': '🍆',
    'Chilli': '🌶️', 'Potato': '🥔', 'Cabbage': '🥬', 'Cauliflower': '🥦',
    'Carrot': '🥕', 'Okra': '🫛', 'Bitter Gourd': '🥒', 'Leafy Greens': '🥗',
    'Groundnut': '🥜', 'Maize': '🌽', 'Cotton': '☁️', 'Sugarcane': '🎋',
    'Banana': '🍌', 'Mango': '🥭', 'Turmeric': '🧡', 'Sunflower': '🌻'
  },

  // Units a crop quantity can be listed in
  UNITS: ['kg', 'quintal', 'tonne', 'sack (50 kg)', 'dozen'],

  // Units a price can be quoted in
  PRICE_UNITS: ['per kg', 'per quintal', 'per tonne', 'per sack', 'per dozen'],

  // Quality grades
  QUALITIES: ['Premium', 'Grade A', 'Grade B', 'Grade C'],

  // Buyer business types
  BUSINESS_TYPES: [
    'Wholesaler', 'Retailer', 'Trader / Commission Agent',
    'FPO / Cooperative', 'Processor', 'Exporter'
  ],

  // Chart color palette
  PALETTE: ['#16a34a', '#f59e0b', '#0ea5e9', '#ef4444', '#8b5cf6', '#ec4899']
};