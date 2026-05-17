cat > server.js << 'EOF'
import express from "express";
import { chromium } from "playwright";

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET");
  next();
});

app.get("/read", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("no url");

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox","--disable-setuid-sandbox","--disable-blink-features=AutomationControlled"]
    });
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    const title = await page.title();

    const content = await page.evaluate(() => {
      const selectors = ["article",".news_txt",".article-content","#artibody","body"];
      let el = null;
      for (const s of selectors) { el = document.querySelector(s); if (el) break; }
      return el ? el.innerText.trim() : "提取失败";
    });

    await browser.close();
    res.json({ title, content: content.slice(0, 15000) });
  } catch (e) {
    if (browser) await browser.close();
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => { console.log("API started"); });
EOF
