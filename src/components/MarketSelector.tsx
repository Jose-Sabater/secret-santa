import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const MARKETS = [
  { code: "AT", name: "Austria", flag: "🇦🇹", currency: "EUR", symbol: "€" },
  { code: "BE", name: "Belgium", flag: "🇧🇪", currency: "EUR", symbol: "€" },
  { code: "DK", name: "Denmark", flag: "🇩🇰", currency: "DKK", symbol: "kr" },
  { code: "FI", name: "Finland", flag: "🇫🇮", currency: "EUR", symbol: "€" },
  { code: "FR", name: "France", flag: "🇫🇷", currency: "EUR", symbol: "€" },
  { code: "DE", name: "Germany", flag: "🇩🇪", currency: "EUR", symbol: "€" },
  { code: "IE", name: "Ireland", flag: "🇮🇪", currency: "EUR", symbol: "€" },
  { code: "IT", name: "Italy", flag: "🇮🇹", currency: "EUR", symbol: "€" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", currency: "EUR", symbol: "€" },
  { code: "NO", name: "Norway", flag: "🇳🇴", currency: "NOK", symbol: "kr" },
  { code: "PL", name: "Poland", flag: "🇵🇱", currency: "PLN", symbol: "zł" },
  { code: "ES", name: "Spain", flag: "🇪🇸", currency: "EUR", symbol: "€" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", currency: "SEK", symbol: "kr" },
  { code: "UK", name: "United Kingdom", flag: "🇬🇧", currency: "GBP", symbol: "£" },
];

export const getMarketCurrency = (marketCode: string) => {
  const market = MARKETS.find((m) => m.code === marketCode);
  return market ? { currency: market.currency, symbol: market.symbol } : { currency: "EUR", symbol: "€" };
};

interface MarketSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const MarketSelector = ({ value, onChange }: MarketSelectorProps) => {
  const selectedMarket = MARKETS.find((m) => m.code === value);

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px] bg-background">
          {selectedMarket ? (
            <span className="flex items-center gap-2">
              <span>{selectedMarket.flag}</span>
              <span>{selectedMarket.name}</span>
            </span>
          ) : (
            <SelectValue placeholder="Select market" />
          )}
        </SelectTrigger>
        <SelectContent>
          {MARKETS.map((market) => (
            <SelectItem key={market.code} value={market.code}>
              <span className="flex items-center gap-2">
                <span>{market.flag}</span>
                <span>{market.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
