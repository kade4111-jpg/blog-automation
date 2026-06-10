import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json"), "utf8"));
const affiliateLinks = JSON.parse(fs.readFileSync(path.join(__dirname, "affiliate-links.json"), "utf8"));

const homeProducts = JSON.parse(
  fs.readFileSync(path.join(__dirname, "products-home.json"), "utf8")
);

const kitchenProducts = JSON.parse(
  fs.readFileSync(path.join(__dirname, "products-kitchen.json"), "utf8")
);

const furnitureProducts = JSON.parse(
  fs.readFileSync(path.join(__dirname, "products-furniture.json"), "utf8")
);

const products = [
  ...homeProducts,
  ...kitchenProducts,
  ...furnitureProducts
];

const scoredProducts = products.map((p) => ({
  ...p,
  commissionRate: config.commissionRates[p.category] || 0,
  commissionScore: (config.commissionRates[p.category] || 0) * p.averagePrice,
  affiliateLink: affiliateLinks[p.key] || null,
}));

const isAffiliatePost = new Date().getDay() % 2 === 0;

const usedProducts = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "used-products.json"),
    "utf8"
  )
);

const topProducts = scoredProducts
  .sort((a, b) => b.commissionScore - a.commissionScore)
  .slice(0, 20);

const availableProducts = topProducts.filter(
  p => !usedProducts.includes(p.key)
);

const selectedProducts = availableProducts
  .sort(() => Math.random() - 0.5)
  .slice(0, isAffiliatePost ? 5 : 2);
const articleProducts = selectedProducts.map((p) => ({
  name: p.name,
  category: p.category,
  affiliateLink: p.affiliateLink
}));

const articlePrompt = `You are an expert affiliate content writer. Write a complete, publish-ready blog post.

Type: ${isAffiliatePost ? "Affiliate (70% promotional)" : "Informational (30% helpful)"}
Top Products: ${JSON.stringify(articleProducts, null, 2)}
Site: ${process.env.SITE_URL}

Requirements:
- Length: 1500-3000 words
- Structure: H1 title, H2 sections, H3 subsections, bullet points
- Include: Introduction, main sections, FAQ section, Conclusion
- SEO: Target high-intent keywords naturally
- Tone: Helpful, authoritative, natural
- Link products naturally using their affiliateLink values in markdown format
- Include FTC disclosure at top: "This post contains affiliate links. I may earn a commission at no extra cost to you."
- Do NOT use "In conclusion" or "delve"
- Do NOT include AI disclaimers

Write the full article now in markdown format.`;

async function generateArticle(prompt) {
let lastError;

for (let attempt = 1; attempt <= 3; attempt++) {
try {
console.log(`Generating article... attempt ${attempt} of 3`);
console.log("Connecting to Ollama...");

  const response = await fetch("http://127.0.0.1:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "qwen3:latest",
      prompt,
      stream: false
    })
  });

  console.log("Fetch completed");

  if (!response.ok) {
    throw new Error(`Ollama returned status ${response.status}`);
  }

  const data = await response.json();
  console.log("JSON received");

  return data.response;

} catch (err) {
  console.error(err);
  console.warn(`Attempt ${attempt} failed: ${err.message}`);

  lastError = err;

  if (attempt < 3) {
    await new Promise((res) => setTimeout(res, 10000));
  }
}


}

throw new Error(`Failed after 3 attempts: ${lastError.message}`);
}


function markdownToHtml(md) {
  return md
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/\n\n/g, "</p><p>");
}

function extractTitle(md) {
  const match = md.match(/^# (.+)$/m);
  return match ? match[1] : "New Blog Post";
}

async function publishToWordPress(title, content) {
  
  const auth = Buffer.from(
    `${process.env.WP_USERNAME}:${process.env.WP_APP_PASSWORD}`
  ).toString("base64");
const updatedUsedProducts = [
  ...new Set([
    ...usedProducts,
    ...selectedProducts.map(p => p.key)
  ])
];

fs.writeFileSync(
  path.join(__dirname, "used-products.json"),
  JSON.stringify(updatedUsedProducts, null, 2),
  "utf8"
);

console.log("Updated used-products.json");
  console.log("Publishing to WordPress...");
  const response = await fetch(`${process.env.WP_URL}/wp-json/wp/v2/posts`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      content,
      status: "publish",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WordPress publish failed: ${error}`);
  }

  const post = await response.json();
  console.log(`Published! URL: ${post.link}`);
  return post;
}

console.log("Starting blog automation...");
console.log("Prompt length:", articlePrompt.length);
const article = await generateArticle(articlePrompt);
fs.writeFileSync(path.join(__dirname, "blog-post.md"), article, "utf8");
console.log("Saved to blog-post.md");

const title = extractTitle(article);
const htmlContent = markdownToHtml(article);
await publishToWordPress(title, htmlContent);
console.log("Blog automation complete!");
