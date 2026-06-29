// readConfig.js
const fs = require('fs');
const path = require('path');

function getCommissionRates() {
    try {
        // Resolve file path relative to this script
        const filePath = path.join(__dirname, 'config.json');

        // Read file synchronously
        const rawData = fs.readFileSync(filePath, 'utf8');

        // Parse JSON
        const config = JSON.parse(rawData);

        // Validate property existence
        if (!config.commissionRates) {
            throw new Error("Missing 'commissionRates' in config.json");
        }

        return config.commissionRates;
    } catch (err) {
        console.error("Error reading commission rates:", err.message);
        return null; // Return null or a default value
    }
}

// Example usage
const rates = getCommissionRates();
if (rates) {
    console.log("Commission Rates:", rates);
} else {
    console.log("Could not load commission rates.");
}

