import { Gift, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

export interface GiftItem {
  id: string;
  name: string;
  description: string;
  price?: string;
  imageUrl?: string;
  link?: string;
  reason?: string;
  brand?: string;
}

interface GiftCardProps {
  gift: GiftItem;
}

export const GiftCard = ({ gift }: GiftCardProps) => {
  return (
    <div className="group bg-card rounded-2xl p-5 shadow-card hover:shadow-lg transition-all duration-300 border border-border/50 hover:border-christmas-gold/30">
      <div className="flex gap-4">
        {gift.imageUrl ? (
          <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
            <img
              src={gift.imageUrl}
              alt={gift.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-xl bg-gradient-festive flex items-center justify-center flex-shrink-0">
            <Gift className="w-10 h-10 text-primary-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3
            className="font-display text-lg font-semibold text-foreground truncate"
            title={gift.name}
          >
            {gift.name}
          </h3>
          {gift.brand && (
            <p className="text-muted-foreground text-xs mt-0.5">
              {gift.brand}
            </p>
          )}
          {gift.price && (
            <p className="text-christmas-gold font-bold text-lg mt-1">
              {gift.price}
            </p>
          )}
          <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
            {gift.description}
          </p>
        </div>
      </div>
      
      {gift.reason && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground italic">
            💡 {gift.reason}
          </p>
        </div>
      )}
      
      {gift.link && (
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full hover:bg-christmas-green/10 hover:text-christmas-green hover:border-christmas-green"
            onClick={() => window.open(gift.link, "_blank")}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on PriceRunner
          </Button>
        </div>
      )}
    </div>
  );
};
