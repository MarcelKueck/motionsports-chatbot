"use client";

import { type UIMessage } from "ai";
import { motion } from "framer-motion";
import { getProductById, getProductsByIds } from "@/lib/product-catalog";
import { ProductCard } from "../tools/product-card";
import { ProductCompare } from "../tools/product-compare";
import { AddToCartButton } from "../tools/add-to-cart-button";
import { ShowroomSuggestion } from "../tools/showroom-suggestion";

interface MessageBubbleProps {
  message: UIMessage;
}

function renderTextWithFormatting(text: string) {
  // Handle bold (**text**) and links ([text](url))
  const parts: (string | React.ReactElement)[] = [];
  const regex = /(\*\*(.+?)\*\*)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match;
  let keyIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      // Bold
      parts.push(
        <strong key={`b-${keyIndex++}`} className="font-semibold">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // Link
      parts.push(
        <a
          key={`l-${keyIndex++}`}
          href={match[5]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          {match[4]}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function renderToolPart(part: UIMessage["parts"][number]) {
  // Tool parts have type like "tool-show_product", "tool-compare_products", etc.
  const partType = part.type;

  if (partType === "tool-show_product" || partType.startsWith("tool-show_product")) {
    const toolPart = part as { type: string; toolCallId: string; state: string; input?: { productId: string; reason?: string } };
    if (!toolPart.input) return null;
    const product = getProductById(toolPart.input.productId);
    if (!product) return null;
    return (
      <ProductCard
        key={toolPart.toolCallId}
        product={product}
        reason={toolPart.input.reason}
      />
    );
  }

  if (partType === "tool-compare_products" || partType.startsWith("tool-compare_products")) {
    const toolPart = part as { type: string; toolCallId: string; state: string; input?: { productIds: string[]; comparisonContext?: string } };
    if (!toolPart.input) return null;
    const products = getProductsByIds(toolPart.input.productIds);
    if (products.length < 2) return null;
    return (
      <ProductCompare
        key={toolPart.toolCallId}
        products={products}
        comparisonContext={toolPart.input.comparisonContext}
      />
    );
  }

  if (partType === "tool-add_to_cart" || partType.startsWith("tool-add_to_cart")) {
    const toolPart = part as { type: string; toolCallId: string; state: string; input?: { productId: string; message: string } };
    if (!toolPart.input) return null;
    const product = getProductById(toolPart.input.productId);
    if (!product) return null;
    return (
      <AddToCartButton
        key={toolPart.toolCallId}
        product={product}
        message={toolPart.input.message}
      />
    );
  }

  if (partType === "tool-suggest_showroom" || partType.startsWith("tool-suggest_showroom")) {
    const toolPart = part as { type: string; toolCallId: string; state: string; input?: { productIds: string[] } };
    if (!toolPart.input) return null;
    const products = getProductsByIds(toolPart.input.productIds);
    if (products.length === 0) return null;
    return (
      <ShowroomSuggestion
        key={toolPart.toolCallId}
        products={products}
      />
    );
  }

  return null;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] ${
          isUser
            ? "bg-bg-user-bubble rounded-2xl rounded-br-md px-4 py-2.5"
            : "space-y-3"
        }`}
      >
        {message.parts.map((part, index) => {
          if (part.type === "text") {
            if (!part.text) return null;
            return (
              <div
                key={`text-${index}`}
                className={`text-sm leading-relaxed ${
                  isUser
                    ? "text-text-primary"
                    : "bg-bg-assistant-bubble rounded-2xl rounded-bl-md px-4 py-2.5 text-text-primary"
                }`}
              >
                {part.text.split("\n").map((line, lineIdx) => (
                  <p
                    key={lineIdx}
                    className={lineIdx > 0 ? "mt-2" : ""}
                  >
                    {renderTextWithFormatting(line)}
                  </p>
                ))}
              </div>
            );
          }

          if (part.type.startsWith("tool-")) {
            return (
              <motion.div
                key={`tool-${index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderToolPart(part)}
              </motion.div>
            );
          }

          return null;
        })}
      </div>
    </motion.div>
  );
}
