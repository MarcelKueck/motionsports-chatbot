"use client";

import { type UIMessage } from "ai";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getProductById, getProductsByIds } from "@/lib/product-catalog";
import { ProductCard } from "../tools/product-card";
import { ProductCompare } from "../tools/product-compare";
import { AddToCartButton } from "../tools/add-to-cart-button";
import { ShowroomSuggestion } from "../tools/showroom-suggestion";
import { ContactFormCard } from "../tools/contact-form-card";

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
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      parts.push(
        <strong key={`b-${keyIndex++}`} className="font-semibold">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
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

function isToolPart(type: string, name: string): boolean {
  return type === `tool-${name}` || type.startsWith(`tool-${name}`);
}

function renderToolPart(part: UIMessage["parts"][number], debug: boolean) {
  const partType = part.type;

  if (isToolPart(partType, "show_product")) {
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

  if (isToolPart(partType, "compare_products")) {
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

  if (isToolPart(partType, "add_to_cart")) {
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

  if (isToolPart(partType, "suggest_showroom")) {
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

  if (isToolPart(partType, "show_contact_form")) {
    const toolPart = part as { type: string; toolCallId: string; state: string; input?: { reason: string; message: string; productIds?: string[] } };
    if (!toolPart.input) return null;
    const products = toolPart.input.productIds
      ? getProductsByIds(toolPart.input.productIds)
      : undefined;
    return (
      <ContactFormCard
        key={toolPart.toolCallId}
        reason={toolPart.input.reason}
        message={toolPart.input.message}
        products={products}
      />
    );
  }

  // search_products and update_customer_profile are silent in production.
  // Surface them in debug mode so we can see what the model is doing.
  if (debug && isToolPart(partType, "update_customer_profile")) {
    const toolPart = part as { type: string; toolCallId: string; input?: Record<string, unknown> };
    return (
      <DebugToolBlock
        key={toolPart.toolCallId}
        title="update_customer_profile"
        input={toolPart.input}
      />
    );
  }

  if (debug && isToolPart(partType, "search_products")) {
    const toolPart = part as { type: string; toolCallId: string; input?: Record<string, unknown>; output?: Record<string, unknown> };
    return (
      <DebugToolBlock
        key={toolPart.toolCallId}
        title="search_products"
        input={toolPart.input}
        output={toolPart.output}
      />
    );
  }

  return null;
}

function DebugToolBlock({
  title,
  input,
  output,
}: {
  title: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
}) {
  return (
    <div className="text-[10px] font-mono bg-bg-secondary/50 border border-dashed border-border rounded-lg px-2.5 py-1.5 max-w-md text-text-muted">
      <div className="font-semibold text-text-secondary">⚙ {title}</div>
      {input && (
        <pre className="whitespace-pre-wrap break-all mt-1">{JSON.stringify(input, null, 1)}</pre>
      )}
      {output && (
        <pre className="whitespace-pre-wrap break-all mt-1 text-text-muted/80">→ {JSON.stringify(output, null, 1)}</pre>
      )}
    </div>
  );
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("debug") === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read URL once after mount; SSR can't see window
      setDebug(true);
    }
  }, []);

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
            const rendered = renderToolPart(part, debug);
            if (!rendered) return null;
            return (
              <motion.div
                key={`tool-${index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {rendered}
              </motion.div>
            );
          }

          return null;
        })}
      </div>
    </motion.div>
  );
}
