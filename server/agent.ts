import { Agent } from "@opperai/agents";
import { z } from "zod";
import { searchProductsTool, getOffersTool } from "./tools/pricerunner.js";

// Output schema for gift suggestions
const GiftProductSchema = z.object({
  productId: z.string(),
  name: z.string(),
  brand: z.string().optional(),
  imageUrl: z.string().optional(),
  pricerunnerUrl: z.string(),
  price: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.string(),
  }).optional(),
  reasoning: z.string().describe("Why this gift is a good match for the person"),
});

const GiftResponseSchema = z.object({
  message: z.string().describe("Conversational response to the user"),
  products: z.array(GiftProductSchema).optional().describe("Gift suggestions with details"),
  needsMoreInfo: z.boolean().optional().describe("Set to true if you need more information from the user"),
});

export type GiftResponse = z.infer<typeof GiftResponseSchema>;

// Message type for conversation history
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  products?: GiftResponse["products"];
}

// Chat options
export interface ChatOptions {
  market?: string;
  minPrice?: number;
  maxPrice?: number;
  numSuggestions?: number;
}

// Create the GiftFinder agent
export const giftFinderAgent = new Agent<string, GiftResponse>({
  name: "GiftFinder",
  instructions: `You are Santa's cheerful helper, finding the perfect gifts for Secret Santa!

Your job is to help users find thoughtful, real gifts they can actually buy.

## How to help:

1. **When the user describes a person:**
   - Think about what gift categories would suit their interests, age, and personality
   - Use searchProducts to find diverse gift types across their interests
   - Use getOffers for each promising product to get real prices
   - Present the requested number of options (default 5) with images, prices, and PriceRunner links
   - Explain WHY each gift matches the person (this is important!)

2. **When the user gives feedback:**
   - "too expensive" → search for budget alternatives, filter by lower price
   - "they don't like X" → avoid that category, try something else
   - "something more personal" → look for customizable or hobby-specific items
   - "more options like X" → search for similar products

3. **Important rules:**
   - Always search for REAL products that exist on PriceRunner
   - Always get prices using getOffers before suggesting
   - Include the PriceRunner URL so users can buy
   - Respect budget constraints! If min/max price is set, only suggest products in that range
   - Keep your responses warm and festive!
   - If you don't have enough info, ask follow-up questions

Note:
Try to execute as many parallel tool calls as possible, without harming quality.
A user is waiting after all, so the least turns the better.

## Market:
Default to Swedish market (SE) unless the user specifies otherwise.

Be helpful, cheerful, and make gift-finding fun! 🎄🎁`,
  tools: [searchProductsTool, getOffersTool],
  outputSchema: GiftResponseSchema,
});

// Process a conversation turn
export async function chat(
  userMessage: string,
  history: ChatMessage[] = [],
  options: ChatOptions = {}
): Promise<GiftResponse> {
  const { market = "SE", minPrice, maxPrice, numSuggestions = 5 } = options;

  // Build context from history - include products that were suggested!
  const contextMessages = history
    .map((m) => {
      let msg = `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`;
      // Include products in context so agent knows what was already suggested
      if (m.products && m.products.length > 0) {
        const productNames = m.products.map(p => `${p.name} (${p.price?.min}-${p.price?.max} ${p.price?.currency})`).join(", ");
        msg += `\n[Previously suggested products: ${productNames}]`;
      }
      return msg;
    })
    .join("\n\n");

  // Build context with market and constraints
  let context = `[Market: ${market}]`;

  // Add price constraints
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceRange = minPrice && maxPrice
      ? `${minPrice}-${maxPrice}`
      : minPrice
        ? `minimum ${minPrice}`
        : `maximum ${maxPrice}`;
    context += `\n[Budget constraint: ${priceRange}. Filter results to stay within this range.]`;
  }

  // Add suggestion count
  context += `\n[Provide ${numSuggestions} gift suggestions.]`;

  const fullInput = contextMessages
    ? `${context}\n\nPrevious conversation:\n${contextMessages}\n\nUser: ${userMessage}`
    : `${context}\n\nUser: ${userMessage}`;

  const result = await giftFinderAgent.process(fullInput);
  return result;
}
