What You Need
1. Your Website

You already bought:

SiteGround hosting

Now install:

WordPress

Inside SiteGround:

Site Tools
WordPress
Install & Manage

Choose:

Domain
Admin username
Password
2. Install Required WordPress Plugins

Inside WordPress → Plugins → Add New

Install:

Required
WP REST API Authentication
Rank Math SEO
Web Stories for WordPress (optional but powerful)
Helpful
UpdraftPlus (backups)
LiteSpeed Cache or SG Optimizer
3. Create a WordPress Application Password

Inside WordPress:

Users → Profile → Application Passwords

Create:

Name: Claude Automation

WordPress gives you:

Username
Application Password

Claude uses this to publish blogs automatically.
4. Create a Pinterest Business Account

Use:

Pinterest Business

Then:

Create boards
Verify your domain
Enable rich pins
5. Create Pinterest API Access

Go to:

Pinterest Developers

Create:

App
Access token

This allows automation posting.
6. Create Claude Code Environment

You’ll use either:

Easy Option (Recommended)
Replit
Railway
Render
Better Long-Term Option
VPS server
Docker setup

Since you’re starting:
Use Replit or Railway.
7. Install Node.js Project

Inside your Claude Code environment:

mkdir blog-automation
cd blog-automation

npm init -y

npm install axios openai dotenv sharp node-cron

Optional:
npm install pinterest-api
8. Create Environment Variables

Create .env

WP_URL=https://yourdomain.com
WP_USERNAME=yourusername
WP_APP_PASSWORD=yourapppassword

PINTEREST_ACCESS_TOKEN=yourtoken

OPENAI_API_KEY=yourkey
ANTHROPIC_API_KEY=yourkey
9. Create Automatic Blog Writer

Create blog.js

require("dotenv").config();
const axios = require("axios");

const auth = Buffer.from(
  `${process.env.WP_USERNAME}:${process.env.WP_APP_PASSWORD}`
).toString("base64");

async function postBlog() {

  const articleTitle =
    "10 Morning Habits That Improve Productivity";

  const articleContent = `\n  <h2>Wake Up Early</h2>\n  <p>Starting your day early improves focus...</p>\n\n  <h2>Hydrate First</h2>\n  <p>Drinking water immediately after waking...</p>\n  `;

  const response = await axios.post(
    `${process.env.WP_URL}/wp-json/wp/v2/posts`,
    {
      title: articleTitle,
      content: articleContent,
      status: "publish"
    },
    {
      headers: {
        Authorization: `Basic ${auth}`
      }
    }
  );

  console.log("Blog posted!");
}

postBlog();

Run:

node blog.js

If successful:
Your blog publishes automatically.
10. Generate Pinterest Pins Automatically

You can automate images using:

Canva API
Bannerbear
Placid

Best beginner option:
Bannerbear.
11. Auto Create Pin Images

Example flow:

Claude:

writes title
writes description
chooses keywords

Bannerbear:

creates image automatically

Pinterest API:

uploads pin automatically
12. Automate Pinterest Posting

Create pinterest.js

const axios = require("axios");

async function createPin() {

  const response = await axios.post(
    "https://api.pinterest.com/v5/pins",
    {
      title: "10 Morning Habits",
      description: "Boost your productivity daily",
      link: "https://yourdomain.com/morning-habits",
      board_id: "YOUR_BOARD_ID",
      media_source: {
        source_type: "image_url",
        url: "https://yourimageurl.com/pin.jpg"
      }
    },
    {
      headers: {
        Authorization:
          `Bearer ${process.env.PINTEREST_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );

  console.log(response.data);
}

createPin();
13. Automate Everything Daily

Install cron scheduler:

npm install node-cron

Example:

const cron = require("node-cron");

cron.schedule("0 8 * * *", () => {

  console.log("Running automation");

  require("./blog");
  require("./pinterest");

});

This runs every morning at 8AM.

Recommended Workflow
Best Beginner Stack
Hosting
SiteGround
Automation
Railway
AI Writing
Claude
Images
Bannerbear
SEO
Rank Math SEO
Analytics
Google Analytics
Google Search Console
What Actually Makes Money

The real key is:

1. High-volume SEO blogs

Target:

"best"
"how to"
"ideas"
"tips"
"review"
"vs"

Examples:

Best Home Office Ideas
Budget Backyard Makeovers
Best Air Fryer Recipes
Tiny House Storage Ideas
2. Pinterest-friendly Niches

Best niches:

Home decor
DIY
Recipes
Fitness
Beauty
Productivity
Lifestyle
Budgeting
Travel
Gardening
3. Scale

Most successful Pinterest blogs:

100–500 blog posts
5–20 pins per post
Consistent posting for months
Best Setup For You

Since you mentioned:

lifestyle domains
Pinterest automation
blog income

I’d recommend:

Website Type

Lifestyle + affiliate content

Monetization
Amazon Associates
ShareASale
Impact
Ads later via Mediavine
Your Fastest Path
Week 1
Install WordPress
Set up theme
Connect domain
Set up Pinterest
Week 2
Create automation scripts
Publish 10–20 blogs
Month 1–3
100+ pins
50+ blog posts
Month 6+

Traffic can compound heavily if the niche is good.