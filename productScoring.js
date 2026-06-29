const fs = require("fs");

// Load config
const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));

// Example product
const products = [
  {
    name: "Espresso Machine",
    category: "home",
    averagePrice: 250
  },
  {
    name: "Air Fryer",
    category: "kitchen",
    averagePrice: 120
  },
  {
    name: "Gaming Monitor",
    category: "electronics",
    averagePrice: 300
  }
];

products.forEach(product => {
  const commissionRate =
    config.commissionRates[product.category];

  const commissionScore =
    commissionRate * product.averagePrice;

  console.log(
    product.name,
    "- Score:",
    commissionScore
  );
});



