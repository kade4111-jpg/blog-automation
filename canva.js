export async function generateCanvaImage(prompt) {
    const url = "https://api.canva.com/rest/v1/designs";

    const response = await fetch(url, {
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

    return {
        url: data.image_url
    };
}