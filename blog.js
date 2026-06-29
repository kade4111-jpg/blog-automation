import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";
import cron from "node-cron";
import { marked } from "marked";
import { generateCanvaImage } from "./canva.js";

const pipelineState = {
    runId: new Date().toISOString(),
    startTime: Date.now(),
    status: "running",
    errors: [],
    logs: []
};

function logStep(message) {
    console.log(`[PIPELINE] ${message}`);

    pipelineState.logs.push({
        time: new Date().toISOString(),
        message
    });
}

dotenv.config();

const brand = {
    primary: "#111827",
    background: "#F9F6F1",
    accent: "#D4AF37"
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------- CONFIG ----------------
const config = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json"), "utf8"));
const affiliateLinks = JSON.parse(fs.readFileSync(path.join(__dirname, "affiliate-links.json"), "utf8"));

const homeProducts = JSON.parse(fs.readFileSync(path.join(__dirname, "products-home.json"), "utf8"));
const kitchenProducts = JSON.parse(fs.readFileSync(path.join(__dirname, "products-kitchen.json"), "utf8"));
const furnitureProducts = JSON.parse(fs.readFileSync(path.join(__dirname, "products-furniture.json"), "utf8"));

const productCategories = {
    home: homeProducts,
    kitchen: kitchenProducts,
    furniture: furnitureProducts,
    smartHome: [],
    office: [],
    outdoor: [],
    camping: [],
    pets: [],
    beauty: [],
    garden: [],
    coffee: [],
    automotive: [],
    travel: [],
    tools: [],
    baby: [],
    fitness: [],
    organization: [],
    cleaning: [],
    electronics: []
};

// ---------------- PRODUCT SELECTION ----------------
const availableCategories = Object.entries(productCategories).filter(
    ([_, products]) => products.length > 0
);

const [selectedCategoryName, products] =
    availableCategories[Math.floor(Math.random() * availableCategories.length)];

console.log(`Selected category: ${selectedCategoryName}`);

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

const isAffiliatePost = new Date().getDay() % 2 === 0;

const usedProducts = JSON.parse(
    fs.readFileSync(path.join(__dirname, "used-products.json"), "utf8")
);

const availableProducts = products
    .filter(p => !usedProducts.includes(p.key))
    .map(p => ({
        ...p,
        affiliateLink: affiliateLinks[p.key] || null
    }));

const selectedProducts = shuffle(availableProducts).slice(
    0,
    isAffiliatePost ? 5 : 2
);

const articleProducts = selectedProducts.map(p => ({
    name: p.name,
    category: p.category,
    affiliateLink: p.affiliateLink || null
}));

// ---------------- PROMPT ----------------
const articlePrompt = `
You are an expert affiliate content writer.

Write ONE SEO optimized blog post based ONLY on the featured products.

Return ONLY valid JSON.

Featured Products:
${JSON.stringify(articleProducts, null, 2)}

Requirements:
- 2000–3000 words
- SEO optimized
- Natural tone
- Include FTC disclosure
- No AI mention
- No markdown fences

Structure:

{
  "title": "",
  "heroPrompt": "",
  "supportingPrompts": ["", "", ""],
  IMPORTANT PIN TITLE RULES:

Each pinConcept MUST have a viral Pinterest headline.

Rules:
- 45–70 characters max
- Must include emotional trigger words
- Must NOT be generic
- Must feel clickable and slightly urgent
- Must include benefit or curiosity

Use these viral formulas:

1. Curiosity:
"What Nobody Tells You About {topic}"
"You’re Probably Doing This Wrong in {topic}"

2. List:
"7 Smart {topic} Ideas That Actually Work"
"10 Must-Have {topic} Upgrades for 2026"

3. Problem/Solution:
"Stop Wasting Money on Bad {topic} Choices"
"Tired of {problem}? Try This Instead"

4. Aesthetic:
"Modern {topic} Ideas That Look Expensive"
"Minimal {topic} Styles You’ll Love"

5. Product:
"Best {topic} Products Worth Buying in 2026"
"Top Rated {topic} Tools That Actually Work"

Every headline MUST be filled. Never leave headline empty.
  "pinConcepts": [
    pinConcepts: [
  { "headline": "", "imagePrompt": "", "type": "curiosity" },
  { "headline": "", "imagePrompt": "", "type": "list" },
  { "headline": "", "imagePrompt": "", "type": "problem-solution" },
  { "headline": "", "imagePrompt": "", "type": "aesthetic" },
  { "headline": "", "imagePrompt": "", "type": "product" }
],
  ],
  "articleBody": ""
}
`;

// ---------------- OLLAMA GENERATION ----------------
async function generateArticle(prompt) {
    let lastError;

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            console.log(`Generating article... attempt ${attempt}`);

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10 * 60 * 1000);

            const response = await fetch("http://127.0.0.1:11434/api/generate", {
                method: "POST",
                signal: controller.signal,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "qwen3.6:latest",
                    prompt,
                    stream: false,
                    options: {
                        num_predict: 8000,
                        temperature: 0.7,
                        top_p: 0.9,
                        repeat_penalty: 1.1,
                        num_ctx: 65536
                    }
                })
            });

            clearTimeout(timeout);

            if (!response.ok) {
                throw new Error(`Ollama error: ${response.status}`);
            }

            const data = await response.json();

            let articleData;

            try {
                articleData = JSON.parse(data.response.trim());
            } catch {
                throw new Error("Invalid JSON returned from model");
            }

            return articleData;

        } catch (err) {
            console.error(err);
            lastError = err;

            if (attempt < 3) {
                await new Promise(r => setTimeout(r, 10000));
            }
        }
    }

    throw new Error(`Failed after 3 attempts: ${lastError.message}`);
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

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`WordPress publish failed: ${error}`);
    }

    const post = await response.json();

    const updatedUsed = [
        ...new Set([
            ...usedProducts,
            ...selectedProducts.map(p => p.key)
        ])
    ];

    fs.writeFileSync(
        path.join(__dirname, "used-products.json"),
        JSON.stringify(updatedUsed, null, 2),
        "utf8"
    );

    console.log("Published:", post.link);

    return post;
}

function extractKeywords(title, content) {
    const text = `${title} ${content}`.toLowerCase();

    const commonKeywords = [
        "kitchen",
        "home",
        "smart",
        "upgrade",
        "design",
        "ideas",
        "modern",
        "storage",
        "budget",
        "luxury",
        "decor",
        "tools",
        "gadgets"
    ];

    return commonKeywords.filter(word => text.includes(word));
}

// ---------------- MAIN FLOW ----------------
logStep("Starting blog automation pipeline...");

try {

const articleData = await generateArticle(articlePrompt);

const {
    title,
    heroPrompt,
    supportingPrompts,
    pinConcepts,
    articleBody
} = articleData;

const keywords = extractKeywords(title, articleBody);

const pinterestPinSystem = [
    {
        type: "curiosity",
        canvaStyle: "bold-contrast"
    },
    {
        type: "list",
        canvaStyle: "clean-minimal"
    },
    {
        type: "problem-solution",
        canvaStyle: "high-emotion"
    },
    {
        type: "aesthetic",
        canvaStyle: "luxury-minimal"
    },
    {
        type: "product",
        canvaStyle: "conversion-focused"
    }
];

// ---------------- IMAGE GENERATION ----------------
console.log("Creating hero image...");
const heroImage = await generateCanvaImage(heroPrompt);

const supportingImages = [];

for (const prompt of supportingPrompts) {
    console.log("Creating supporting image...");
    const img = await generateCanvaImage(prompt);
    supportingImages.push(img);
}

let fixedArticle = articleBody;

// inject hero image
fixedArticle = fixedArticle.replace(
    "## Introduction",
    `<img src="${heroImage.url}" alt="${title}" />\n\n## Introduction`
);

// inject first supporting image into Pinterest placeholder
if (supportingImages[0]) {
    fixedArticle = fixedArticle.replace(
        "[PINTEREST_IMAGE]",
        `<img src="${supportingImages[0].url}" />`
    );
}

// affiliate link injection
const firstProductWithLink = selectedProducts.find(p => p.affiliateLink);

if (firstProductWithLink) {
    fixedArticle = fixedArticle.replace(
        /\(AFFILIATE_LINK\)/g,
        firstProductWithLink.affiliateLink
    );
}

// save markdown
fs.writeFileSync(
    path.join(__dirname, "blog-post.md"),
    fixedArticle,
    "utf8"
);

console.log("Saved blog-post.md");

// ---------------- WORDPRESS ----------------
const htmlContent = marked(fixedArticle);

const post = await publishToWordPress(title, htmlContent, selectedProducts);

// ---------------- PINTEREST ----------------
for (const pin of pinConcepts) {

    // style system
    const pinStyleMap = { ... };
    const canvaTemplateMap = { ... };

    const imagePrompt = pinStyleMap[pin.type] || pin.imagePrompt;
    const image = await generateCanvaImage(imagePrompt);

    const keyword = keywords[Math.floor(Math.random() * keywords.length)] || title;

    const optimizedTitle = `${pin.headline} (${keyword})`;

    const description = `...`;

    const style = pinterestPinSystem[pinConcepts.indexOf(pin)]?.canvaStyle || "clean-minimal";
    const template = canvaTemplateMap[pin.type] || "structured-list-layout";

    // 🧱 NEW EXPORT SYSTEM
    const canvaExport = {
        title: optimizedTitle,
        description,
        imagePrompt,
        imageUrl: image.url,
        template,
        style,
        colors: {
            primary: brand.primary,
            background: brand.background,
            accent: brand.accent
        },
        seo: {
            keyword,
            topic: pin.type
        }
    };

    fs.appendFileSync(
        path.join(__dirname, "canva-exports.json"),
        JSON.stringify(canvaExport, null, 2) + ",\n",
        "utf8"
    );

    if (typeof createPinterestPin === "function") {
        await createPinterestPin({
            title: optimizedTitle,
            image: image.url,
            url: post.link,
            description,
            canvaStyle: style,
            canvaTemplate: template,
            canvaExport
        });
    }
}

    console.log("Blog automation complete!");

} catch (error) {
    console.error("[PIPELINE ERROR]", error);
} finally {
    console.log("Pipeline finished");
}

function runBlogPipeline() {
    console.log("Running blog pipeline...");

    // IMPORTANT: call your main script logic here
    import("./blog.js").catch(err => {
        console.error("Pipeline error:", err);
    });
}

cron.schedule("34 8 * * *", () => {
    runBlogPipeline();
});

cron.schedule("48 10 * * *", () => {
    runBlogPipeline();
});

cron.schedule("57 16 * * *", () => {
    runBlogPipeline();
});

console.log("Scheduler initialized...");