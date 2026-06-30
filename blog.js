import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";
import cron from "node-cron";
import { marked } from "marked";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const brand = {
    primary: "#111827",
    background: "#F9F6F1",
    accent: "#D4AF37"
};

// ---------------- CONFIG ----------------
const config = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json"), "utf8"));
const affiliateLinks = JSON.parse(fs.readFileSync(path.join(__dirname, "affiliate-links.json"), "utf8"));

const homeProducts = JSON.parse(fs.readFileSync(path.join(__dirname, "products-home.json"), "utf8"));
const kitchenProducts = JSON.parse(fs.readFileSync(path.join(__dirname, "products-kitchen.json"), "utf8"));
const furnitureProducts = JSON.parse(fs.readFileSync(path.join(__dirname, "products-furniture.json"), "utf8"));

const productCategories = {
    home: homeProducts,
    kitchen: kitchenProducts,
    furniture: furnitureProducts
};

// ---------------- PRODUCT SELECTION ----------------
const availableCategories = Object.entries(productCategories).filter(
    ([_, products]) => products.length > 0
);

const [selectedCategoryName, products] =
    availableCategories[Math.floor(Math.random() * availableCategories.length)];

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

const usedProducts = JSON.parse(
    fs.readFileSync(path.join(__dirname, "used-products.json"), "utf8")
);

const availableProducts = products.filter(p => !usedProducts.includes(p.key));

const selectedProducts = shuffle(availableProducts).slice(0, 3);

const articleProducts = selectedProducts.map(p => ({
    name: p.name,
    category: p.category,
    affiliateLink: affiliateLinks[p.key] || null
}));

// ---------------- ARTICLE GENERATION ----------------
async function generateArticle(prompt) {
    const response = await fetch("http://127.0.0.1:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "qwen3.6:latest",
            prompt,
            stream: false
        })
    });

    const data = await response.json();
    return JSON.parse(data.response);
}

// ---------------- WORDPRESS ----------------
async function publishToWordPress(title, content, selectedProducts) {
    const auth = Buffer.from(
        `${process.env.WP_USERNAME}:${process.env.WP_APP_PASSWORD}`
    ).toString("base64");

    const response = await fetch(`${process.env.WP_URL}/wp-json/wp/v2/posts`, {
        method: "POST",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title,
            content,
            status: "publish"
        })
    });

    const post = await response.json();

    return post;
}

// ---------------- MAIN PIPELINE ----------------
async function runBlogPipeline() {
    console.log("Starting blog pipeline...");

    try {
        const articleData = await generateArticle(`
Return JSON blog with:
title, heroPrompt, supportingPrompts, pinConcepts, articleBody
Based on: ${JSON.stringify(articleProducts)}
`);

        const {
            title,
            heroPrompt,
            supportingPrompts,
            pinConcepts,
            articleBody
        } = articleData;

        let fixedArticle = articleBody;

        // HERO PROMPT INSERT
        fixedArticle = fixedArticle.replace(
            "## Introduction",
            `<!-- HERO PROMPT: ${heroPrompt} -->\n## Introduction`
        );

        // PIN PLACEHOLDER
        if (supportingPrompts?.[0]) {
            fixedArticle = fixedArticle.replace(
                "[PINTEREST_IMAGE]",
                `<!-- PIN PROMPT: ${supportingPrompts[0]} -->`
            );
        }

        // AFFILIATE LINKS
        const firstProductWithLink = selectedProducts.find(p => p.affiliateLink);

        if (firstProductWithLink) {
            fixedArticle = fixedArticle.replace(
                /\(AFFILIATE_LINK\)/g,
                firstProductWithLink.affiliateLink
            );
        }

        fs.writeFileSync(
            path.join(__dirname, "blog-post.md"),
            fixedArticle,
            "utf8"
        );

        const htmlContent = marked(fixedArticle);

        const post = await publishToWordPress(title, htmlContent, selectedProducts);

        // ---------------- PIN EXPORT ----------------
        const pinterestPinSystem = [
            "bold-contrast",
            "clean-minimal",
            "high-emotion",
            "luxury-minimal",
            "conversion-focused"
        ];

        for (const pin of pinConcepts) {

            const keyword = title.split(" ")[0];

            const exportData = {
                title: `${pin.headline} (${keyword})`,
                description: pin.headline,
                imagePrompt: pin.imagePrompt,
                template: pinterestPinSystem[pinConcepts.indexOf(pin)] || "clean-minimal",
                colors: brand,
                url: post.link
            };

            fs.appendFileSync(
                path.join(__dirname, "image-prompt-exports.json"),
                JSON.stringify(exportData, null, 2) + ",\n"
            );
        }

        console.log("Blog automation complete!");

    } catch (error) {
        console.error("PIPELINE ERROR:", error);
    }
}

// ---------------- CRON ----------------
cron.schedule("34 8 * * *", runBlogPipeline);
cron.schedule("48 10 * * *", runBlogPipeline);
cron.schedule("57 16 * * *", runBlogPipeline);

console.log("Scheduler initialized...");
    