import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

async function createPin() {
  console.log("Creating Pinterest pin...");
  try {
    const response = await axios.post(
      "https://api.pinterest.com/v5/pins",
      {
        title: "Home & Kitchen Must-Haves",
        description: "Discover the best products for your home. Click to learn more!",
        link: process.env.SITE_URL,
        board_id: process.env.PINTEREST_BOARD_ID,
        media_source: {
          source_type: "image_url",
          url: process.env.PIN_IMAGE_URL,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PINTEREST_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Pin created successfully!", response.data);
  } catch (err) {
    console.error("Pinterest pin failed:", err.response?.data || err.message);
  }
}

await createPin();