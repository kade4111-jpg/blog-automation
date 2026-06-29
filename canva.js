export async function generateCanvaImage(prompt) {
    const response = await fetch("YOUR_CANVA_ENDPOINT", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.CANVA_TOKEN}`
        },
        body: JSON.stringify({
            prompt
        })
    });

    const data = await response.json();

    // THIS is the important part:
    return {
        url: data.image_url
    };
}
