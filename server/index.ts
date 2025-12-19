import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { chat, ChatMessage, GiftResponse } from "./agent.js";
import { searchProducts, getOffers } from "./tools/pricerunner.js";

// Load environment variables from .env file (only in development)
if (process.env.NODE_ENV !== "production") {
  config();
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../dist")));
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Chat endpoint - multi-turn conversation with the gift finder agent
app.post("/api/chat", async (req, res) => {
  try {
    const {
      message,
      history = [],
      market = "SE",
      minPrice,
      maxPrice,
      numSuggestions = 5,
    } = req.body as {
      message: string;
      history?: ChatMessage[];
      market?: string;
      minPrice?: number;
      maxPrice?: number;
      numSuggestions?: number;
    };

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log(`[Chat] Processing: "${message.slice(0, 50)}..." Market: ${market}`);
    if (minPrice || maxPrice) console.log(`[Chat] Price range: ${minPrice || 0} - ${maxPrice || "∞"}`);

    const response = await chat(message, history, { market, minPrice, maxPrice, numSuggestions });

    console.log(`[Chat] Response: ${response.message.slice(0, 50)}...`);
    console.log(`[Chat] Products: ${response.products?.length || 0}`);

    res.json(response);
  } catch (error) {
    console.error("[Chat] Error:", error);
    res.status(500).json({
      error: "Failed to process chat",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Direct search endpoint - bypasses agent for simple searches
app.get("/api/search", async (req, res) => {
  try {
    const query = req.query.q as string;
    const market = (req.query.market as string) || "SE";
    const size = parseInt(req.query.size as string) || 10;

    if (!query) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    console.log(`[Search] Query: "${query}" Market: ${market}`);

    const results = await searchProducts({ query, market, size });

    res.json(results);
  } catch (error) {
    console.error("[Search] Error:", error);
    res.status(500).json({
      error: "Search failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Direct offers endpoint - get prices for a product
app.get("/api/offers", async (req, res) => {
  try {
    const productId = req.query.productId as string;
    const market = (req.query.market as string) || "SE";

    if (!productId) {
      return res.status(400).json({ error: "Query parameter 'productId' is required" });
    }

    console.log(`[Offers] Product: ${productId} Market: ${market}`);

    const results = await getOffers({ productId, market });

    res.json(results);
  } catch (error) {
    console.error("[Offers] Error:", error);
    res.status(500).json({
      error: "Failed to get offers",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Serve frontend for all other routes in production (SPA catch-all)
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`
🎄 Santa's Wish Helper API running on http://localhost:${PORT}

Endpoints:
  POST /api/chat     - Chat with the gift finder agent
  GET  /api/search   - Direct product search
  GET  /api/offers   - Get product offers/prices
  GET  /api/health   - Health check

Environment:
  NODE_ENV:       ${process.env.NODE_ENV || "development"}
  KLARNA_API_KEY: ${process.env.KLARNA_API_KEY ? "✓ Set" : "✗ Missing"}
  OPPER_API_KEY:  ${process.env.OPPER_API_KEY ? `✓ Set (${process.env.OPPER_API_KEY.slice(0, 8)}...)` : "✗ Missing"}
`);
});
