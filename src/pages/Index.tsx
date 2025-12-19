import { useState, useEffect, useRef } from "react";
import { Gift, Search, TreePine, Sparkles, Heart } from "lucide-react";
import { Snowfall } from "@/components/Snowfall";
import { PersonForm } from "@/components/PersonForm";
import { SearchForm } from "@/components/SearchForm";
import { GiftCard, GiftItem } from "@/components/GiftCard";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { LoadingMessages } from "@/components/LoadingMessages";
import { MarketSelector, getMarketCurrency } from "@/components/MarketSelector";
import { sendChatMessage, searchItems, PersonDescription, ChatMessage as ChatMessageType, ChatResponse } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type TabType = "person" | "search";

// LocalStorage keys
const STORAGE_KEYS = {
  market: "santa-market",
  personForm: "santa-person-form",
  searchQuery: "santa-search-query",
  chatHistory: "santa-chat-history",
};

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>("person");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<GiftItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [market, setMarket] = useState("SE");
  const [chatHistory, setChatHistory] = useState<ChatMessageType[]>([]);
  const [savedPersonForm, setSavedPersonForm] = useState<PersonDescription | null>(null);
  const [savedSearchQuery, setSavedSearchQuery] = useState("");
  const { toast } = useToast();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedMarket = localStorage.getItem(STORAGE_KEYS.market);
    if (savedMarket) setMarket(savedMarket);

    const savedPerson = localStorage.getItem(STORAGE_KEYS.personForm);
    if (savedPerson) setSavedPersonForm(JSON.parse(savedPerson));

    const savedQuery = localStorage.getItem(STORAGE_KEYS.searchQuery);
    if (savedQuery) setSavedSearchQuery(savedQuery);

    const savedChat = localStorage.getItem(STORAGE_KEYS.chatHistory);
    if (savedChat) setChatHistory(JSON.parse(savedChat));
  }, []);

  // Save market to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.market, market);
  }, [market]);

  // Save chat history to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.chatHistory, JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Transform API response to chat message with products
  const transformResponse = (response: ChatResponse): ChatMessageType => {
    const products = response.products?.map((p) => ({
      id: p.productId,
      name: p.name,
      description: p.reasoning,
      price: p.price
        ? `${p.price.min.toLocaleString()} - ${p.price.max.toLocaleString()} ${p.price.currency}`
        : undefined,
      imageUrl: p.imageUrl,
      link: p.pricerunnerUrl,
      reason: p.reasoning,
      brand: p.brand,
    }));

    return {
      role: "assistant",
      content: response.message,
      products,
    };
  };

  const handlePersonSubmit = async (data: PersonDescription) => {
    // Save form data
    localStorage.setItem(STORAGE_KEYS.personForm, JSON.stringify(data));
    setSavedPersonForm(data);

    setIsLoading(true);
    setHasSearched(true);

    // Build initial message from form
    let message = `I need gift ideas for ${data.name || "someone special"}.`;
    if (data.description) message += ` Here's what I know about them: ${data.description}`;
    if (data.interests) message += ` They're interested in: ${data.interests}`;
    if (data.minPrice || data.maxPrice) {
      message += ` Budget: ${data.minPrice || 0} - ${data.maxPrice || "any"}.`;
    }

    // Add user message to chat - append to existing history!
    const userMessage: ChatMessageType = { role: "user", content: message };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);

    try {
      // Pass existing history (without the new message) so agent knows context
      const response = await sendChatMessage(message, chatHistory, {
        market,
        minPrice: data.minPrice,
        maxPrice: data.maxPrice,
      });
      const assistantMessage = transformResponse(response);
      setChatHistory([...newHistory, assistantMessage]);

      toast({
        title: "🎁 Gift ideas found!",
        description: `We found ${response.products?.length || 0} perfect gift suggestions.`,
      });
    } catch (error) {
      toast({
        title: "Oops!",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      // Keep the history as is on error
      setChatHistory(chatHistory);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatContinue = async (message: string) => {
    setIsLoading(true);

    // Add user message to chat
    const userMessage: ChatMessageType = { role: "user", content: message };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);

    try {
      // Pass saved price constraints from form
      const response = await sendChatMessage(message, chatHistory, {
        market,
        minPrice: savedPersonForm?.minPrice,
        maxPrice: savedPersonForm?.maxPrice,
      });
      const assistantMessage = transformResponse(response);
      setChatHistory([...newHistory, assistantMessage]);
    } catch (error) {
      toast({
        title: "Oops!",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      // Remove the user message if request failed
      setChatHistory(chatHistory);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = async (query: string) => {
    // Save query
    localStorage.setItem(STORAGE_KEYS.searchQuery, query);
    setSavedSearchQuery(query);

    setIsLoading(true);
    setHasSearched(true);

    try {
      const items = await searchItems(query, market);
      setSearchResults(items);
      toast({
        title: "🔍 Search complete!",
        description: `Found ${items.length} items matching "${query}".`,
      });
    } catch (error) {
      toast({
        title: "Oops!",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setChatHistory([]);
    setHasSearched(false);
    localStorage.removeItem(STORAGE_KEYS.chatHistory);
  };

  return (
    <div className="min-h-screen bg-gradient-snow relative overflow-hidden">
      <Snowfall />

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 text-christmas-red/20 animate-float">
        <Gift className="w-16 h-16" />
      </div>
      <div className="absolute top-20 right-20 text-christmas-green/20 animate-float" style={{ animationDelay: "1s" }}>
        <TreePine className="w-20 h-20" />
      </div>
      <div className="absolute bottom-20 left-20 text-christmas-gold/30 animate-twinkle">
        <Sparkles className="w-12 h-12" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Gift className="w-12 h-12 text-christmas-red animate-float" />
            <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground">
              Secret <span className="text-gradient-festive">Santa</span>
            </h1>
            <div className="animate-float">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: "radial-gradient(circle, hsl(145 45% 28% / 0.7) 0%, hsl(145 45% 28% / 0.3) 50%, transparent 70%)"
                }}
              >
                <img src="/android-chrome-192x192.png" alt="Opper" className="w-10 h-10" />
              </div>
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-body">
            Find the perfect gift for everyone on your list!
          </p>

          {/* Market Selector */}
          <div className="mt-4 flex justify-center">
            <MarketSelector value={market} onChange={setMarket} />
          </div>
        </header>

        {/* Main Card */}
        <div className="bg-card rounded-3xl shadow-card border border-border/50 overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-border">
            <button
              onClick={() => {
                setActiveTab("person");
                setSearchResults([]);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition-all duration-300 ${
                activeTab === "person"
                  ? "bg-christmas-red/10 text-christmas-red border-b-2 border-christmas-red"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Gift className="w-5 h-5" />
              Find a Gift
            </button>
            <button
              onClick={() => {
                setActiveTab("search");
                setChatHistory([]);
                setHasSearched(false);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition-all duration-300 ${
                activeTab === "search"
                  ? "bg-christmas-green/10 text-christmas-green border-b-2 border-christmas-green"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Search className="w-5 h-5" />
              Search Items
            </button>
          </div>

          {/* Form Section */}
          <div className="p-6 md:p-8">
            {activeTab === "person" ? (
              <div className="space-y-4">
                {chatHistory.length === 0 ? (
                  <>
                    <div className="text-center mb-6">
                      <h2 className="font-display text-2xl font-semibold text-foreground">
                        Who are you shopping for?
                      </h2>
                      <p className="text-muted-foreground mt-1">
                        Tell us about them and we'll suggest perfect gifts
                      </p>
                    </div>
                    <PersonForm
                      onSubmit={handlePersonSubmit}
                      isLoading={isLoading}
                      initialValues={savedPersonForm || undefined}
                      currencySymbol={getMarketCurrency(market).symbol}
                    />
                  </>
                ) : (
                  <>
                    {/* Chat History */}
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {chatHistory.map((msg, index) => (
                        <ChatMessage
                          key={index}
                          role={msg.role}
                          content={msg.content}
                          products={msg.products}
                        />
                      ))}

                      {/* Loading indicator */}
                      {isLoading && <LoadingMessages />}

                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input for continuing conversation */}
                    {!isLoading && (
                      <div className="mt-6 space-y-3">
                        <ChatInput onSend={handleChatContinue} isLoading={isLoading} />
                        <button
                          onClick={handleClearChat}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Start new search
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="font-display text-2xl font-semibold text-foreground">
                    Search for something specific
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    We'll find the best options for you
                  </p>
                </div>
                <SearchForm
                  onSubmit={handleSearchSubmit}
                  isLoading={isLoading}
                  initialValue={savedSearchQuery}
                />
              </div>
            )}
          </div>
        </div>

        {/* Search Results Section (for direct search tab) */}
        {activeTab === "search" && hasSearched && (
          <div className="mt-10">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-christmas-gold" />
              Search Results
            </h2>

            {isLoading ? (
              <LoadingMessages />
            ) : searchResults.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {searchResults.map((gift) => (
                  <GiftCard key={gift.id} gift={gift} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Gift className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>No results found. Try a different search!</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-16 text-muted-foreground text-sm">
          <p className="flex items-center justify-center gap-1">
            Made with <Heart className="w-4 h-4 text-christmas-red fill-christmas-red" /> for the holiday season
          </p>
          <p className="mt-1 text-xs opacity-60 flex items-center justify-center gap-1">
            Powered by <img src="/favicon-16x16.png" alt="Opper" className="w-4 h-4" /> Opper AI & Klarna Agentic Product Protocol
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
