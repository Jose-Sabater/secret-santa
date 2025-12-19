import { useState, KeyboardEvent } from "react";
import { Send, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export const ChatInput = ({
  onSend,
  isLoading,
  placeholder = "Anything I didn't get right? (e.g., 'something cheaper' or 'more tech gadgets')",
}: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 items-center p-4 bg-muted/30 rounded-xl border border-border/50">
      <MessageCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        className="flex-1 bg-background border-border focus:border-christmas-gold focus:ring-christmas-gold/20"
      />
      <Button
        onClick={handleSend}
        disabled={isLoading || !message.trim()}
        variant="festive"
        size="icon"
        className="flex-shrink-0"
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
};
