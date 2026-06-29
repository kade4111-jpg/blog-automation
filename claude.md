```markdown
# CLAUDE.md

## Project Overview

You are an affiliate content writter. Choose a profitable blog topic. Write a complete article. Recommend Amazon products naturally. 

This project automates:

* Keyword research
* SEO blog article creation
* WordPress publishing
* Pinterest pin generation
* Pinterest posting
* Internal link generation
* Affiliate content creation
* Content clustering
* Publishing schedules
* Performance logging

The goal is to build a largely hands-off blogging and Pinterest marketing system running primarily on local AI models through Ollama.

---

# Environment

## Primary LLM

Use local Ollama models first.

Preferred model order:

1. qwen3:67b
2. qwen3
3. llama3
4. mistral

Always use the highest available model from this list.

Do not require OpenAI or Anthropic APIs unless specifically requested.

Use:

http://localhost:11434

for all Ollama requests.

---

# Project Structure

Suggested project structure:

/blog.js
Generate topic and publish WordPress articles

/pinterest.js
Generate and publish Pinterest pins

/keyword-research.js
Keyword discovery and clustering

/internal-links.js
Internal linking suggestions

/scheduler.js
Publishing schedules

/utils/
Shared helper functions

/logs/
Automation logs

/data/
Keyword databases
Affiliate product databases
Generated content metadata

---

# Development Rules

When writing code:

* Use Node.js
* Use async/await
* Use modern JavaScript
* Use dotenv for secrets
* Use modular architecture
* Include comments explaining important sections
* Handle errors gracefully
* Log meaningful messages to console

Always provide complete files rather than partial snippets unless specifically requested.

Before generating code:

* Check for existing files
* Avoid breaking working functionality
* Prefer extending existing code
* Preserve backward compatibility
* Explain major changes before making them

---

# Environment Variables

All secrets must come from .env.

Never hardcode:

* WordPress URLs
* Usernames
* Passwords
* API keys
* Pinterest tokens
* Canva credentials
* Amazon credentials

Use:

process.env.VARIABLE_NAME

Example:

const token = process.env.PINTEREST_ACCESS_TOKEN;

---

# Workflow Priority

Primary workflow:

1. Generate article
2. Generate metadata
3. Generate Pinterest assets
4. Publish to WordPress
5. Publish to Pinterest
6. Save logs
7. Report results

Dependencies:

* Article generation must complete before metadata generation.
* Metadata must complete before publishing.
* Pinterest assets must be generated before Pinterest publishing.
* Pinterest publishing may occur immediately or through a scheduler.

---

# Automated Publishing Workflow

1. Research keywords
2. Select content topic
3. Determine content type (affiliate or informational)
4. Generate article
5. Generate SEO metadata
6. Generate internal linking suggestions
7. Generate Pinterest assets
8. Generate Canva text assets
9. Validate content quality requirements
10. Publish article to WordPress
11. Store article metadata and URLs
12. Schedule Pinterest pins
13. Publish Pinterest pins
14. Save logs and analytics data
15. Generate completion report

Workflow Rules:

* Do not publish Pinterest pins until the related WordPress article is live.
* Generate 5 unique Pinterest pins per article.
* Informational articles should represent approximately 30% of content.
* Affiliate articles should represent approximately 70% of content.
* Publish blog posts before Pinterest promotion.
* Use randomized publishing times.
* If publishing fails, retry and log the failure.

# Content Strategy

## Content Mix

70% Monetization Content

* Affiliate articles
* Product reviews
* Product comparisons
* Buying guides
* Best-of lists

30% Informational Content

* Tutorials
* How-to articles
* Educational content
* Problem-solving content

Informational content should generally avoid affiliate links and focus on building authority and trust.

---

# WordPress Rules

Publishing destination is WordPress.

Generate:

* SEO title
* SEO slug
* Excerpt
* Meta description

Required article structure:

# H1 Title

Introduction

## H2 Section

Content

## H2 Section

Content

## Frequently Asked Questions

FAQ content

## Conclusion

Summary

Target publishing volume:

* 3 to 5 blog posts per day initially

Publish at randomized times throughout the day.

---

# SEO Requirements

Every article should:

* Target one primary keyword
* Include secondary keywords naturally
* Use semantic SEO
* Use NLP-friendly language
* Avoid keyword stuffing
* Use short paragraphs
* Use bullet points where appropriate
* Include FAQ sections
* Be optimized for Pinterest traffic

Target article length:

1,500–3,000 words

unless otherwise specified.

Generated content should be:

* Human readable
* Factually accurate
* SEO optimized
* Pinterest optimized
* Ready to publish

Avoid:

* AI disclaimers
* Generic filler
* Repetitive wording
* Unverified claims

---

# Pinterest Rules

For every blog article:

Generate:

* 5 unique Pinterest pins
* Pin title
* Pin description
* Pinterest keywords
* Pinterest hashtags
* Canva image text

Pin title:

Under 100 characters

Pin description:

200–500 characters

Image text:

Short
Attention-grabbing
Mobile-friendly

Pinterest Growth Schedule:

Days 1–30:

* Maximum 2 pins per day

Days 31–60:

* Maximum 4 pins per day

Days 61–90:

* Maximum 8 pins per day

After Day 90:

* Maintain between 10 and 20 pins per day

Publish pins at randomized times.

---

# Canva Rules

When generating Canva content:

Create:

* Main headline
* Subheadline
* Call to action

Design style:

* Clean
* Professional
* High contrast
* Mobile friendly
* Pinterest optimized

---

# Affiliate Content Rules

When writing affiliate content:

* Be informative first
* Do not make false claims
* Highlight pros and cons
* Include comparison tables when useful
* Include buyer recommendations
* Use FTC-compliant disclosure language

---

# Amazon Product Selection

When choosing products:

Prioritize:

1. Commission rate
2. Conversion potential
3. Product rating
4. Review count
5. Price

Avoid products with:

* Ratings below 4.0
* Insufficient reviews
* Poor reputation

Focus keyword research heavily on categories with higher commission opportunities while maintaining relevance and usefulness.

---

# Internal Linking

For every article generate:

* Related article opportunities
* Internal linking suggestions
* Content cluster ideas

Always identify:

* Parent topic
* Supporting topics
* Future article ideas

---

# Logging

Use clear logging.

Examples:

console.log("Starting article generation...");
console.log("Generating SEO metadata...");
console.log("Publishing to WordPress...");
console.log("Creating Pinterest pin...");
console.log("Post published successfully.");

Avoid excessive debug output.

---

# Error Handling

All scripts should:

* Catch errors
* Log useful details
* Continue where possible
* Exit gracefully when necessary

Example:

try {
// code
} catch (error) {
console.error(error);
}

If any workflow step fails:

* Log the failure
* Record the reason
* Continue non-dependent tasks when possible
* Generate a final status report

---

# Publishing Validation

Before publishing:

Verify:

* Article length requirements
* SEO metadata exists
* FAQ section exists
* Affiliate disclosure exists when required
* Pinterest assets generated successfully
* WordPress publication succeeded
* Pinterest publication succeeded

---

# User Preferences

Assume the user prefers:

* Step-by-step instructions
* Complete code files
* Beginner-friendly explanations
* Local-first solutions
* Automation whenever practical

When multiple approaches exist:

Recommend the simplest reliable solution first.

---

# Business Goals

Primary goals:

* Build topical authority
* Grow Pinterest traffic
* Increase organic search traffic
* Create sustainable affiliate revenue
* Maintain content quality
* Prioritize long-term trust over short-term monetization

The system should balance informational and monetized content while building a high-quality content asset over time.
