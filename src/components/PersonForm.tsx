import { useState } from "react";
import { User, Sparkles, Heart, Coins } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";

interface PersonFormData {
  name: string;
  description: string;
  interests: string;
  minPrice?: number;
  maxPrice?: number;
}

interface PersonFormProps {
  onSubmit: (data: PersonFormData) => void;
  isLoading: boolean;
  initialValues?: PersonFormData;
  currencySymbol?: string;
}

export const PersonForm = ({ onSubmit, isLoading, initialValues, currencySymbol = "kr" }: PersonFormProps) => {
  const [name, setName] = useState(initialValues?.name || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [interests, setInterests] = useState(initialValues?.interests || "");
  const [minPrice, setMinPrice] = useState<string>(initialValues?.minPrice?.toString() || "");
  const [maxPrice, setMaxPrice] = useState<string>(initialValues?.maxPrice?.toString() || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      onSubmit({
        name,
        description,
        interests,
        minPrice: minPrice ? parseInt(minPrice) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <User className="w-4 h-4 text-christmas-red" />
          Their Name (optional)
        </label>
        <Input
          placeholder="e.g., Sarah, Uncle Bob, My Best Friend..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-background border-border focus:border-christmas-gold focus:ring-christmas-gold/20"
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Heart className="w-4 h-4 text-christmas-red" />
          Describe them
        </label>
        <Textarea
          placeholder="Tell us about this person... Age, personality, hobbies, what makes them special?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px] bg-background border-border focus:border-christmas-gold focus:ring-christmas-gold/20 resize-none"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="w-4 h-4 text-christmas-gold" />
          What do they love? (optional)
        </label>
        <Input
          placeholder="e.g., Cooking, gardening, tech gadgets, books..."
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          className="bg-background border-border focus:border-christmas-gold focus:ring-christmas-gold/20"
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Coins className="w-4 h-4 text-christmas-green" />
          Budget range in {currencySymbol} (optional)
        </label>
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="bg-background border-border focus:border-christmas-gold focus:ring-christmas-gold/20 pr-8"
              min={0}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{currencySymbol}</span>
          </div>
          <span className="text-muted-foreground">—</span>
          <div className="relative flex-1">
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="bg-background border-border focus:border-christmas-gold focus:ring-christmas-gold/20 pr-8"
              min={0}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{currencySymbol}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Set a budget for Secret Santa gift exchanges</p>
      </div>

      <Button
        type="submit"
        variant="festive"
        size="lg"
        className="w-full"
        disabled={isLoading || !description.trim()}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Finding perfect gifts...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Find Gift Ideas
          </>
        )}
      </Button>
    </form>
  );
};
