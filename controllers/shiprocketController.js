const dotenv = require('dotenv');
const Product = require('../models/Product');
dotenv.config();
const SHIPROCKET_CREDENTIALS = {
    email: process.env.SHIPROCKET_EMAIL,
    password: process.env.SHIPROCKET_PASSWORD,
}
const getShipRocketToken = async () => {
    try {
      const response = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: SHIPROCKET_CREDENTIALS.email,
          password: SHIPROCKET_CREDENTIALS.password,
        }),
      });
      console.log(response);
      if (!response.ok) {
        throw new Error("Failed to get ShipRocket token");
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error("Error getting ShipRocket token:", error);
      return null;
    }
  };

  const getDeliveryCharges = async (req, res) => {
    try {
      const { pincode } = req.body;
      if (!pincode) {
        return res.status(400).json({ message: "Pincode is required" });
      }
  
      const pickupPostcode = "400001";
      const weight = 1;
      const shiprocketToken = await getShipRocketToken();

      if (!shiprocketToken) {
        return res.status(500).json({ message: "Failed to authenticate ShipRocket" });
      }
  
      // Build query string
      const query = new URLSearchParams({
        pickup_postcode: pickupPostcode,
        delivery_postcode: pincode,
        weight: weight.toString(),
        length: "15",
        breadth: "10",
        height: "10",
        declared_value: "0",
      }).toString();
  
      const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability?${query}`;
  
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${shiprocketToken}`,
        }
      });
  
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to calculate shipping");
      }
  
      return res.json(data);
    } catch (error) {
      console.error("Error calculating shipping:", error);
      return res.status(500).json({ message: "Error calculating shipping" });
    }
  };
  

module.exports = { getDeliveryCharges };