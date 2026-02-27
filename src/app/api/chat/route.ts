import { streamText, stepCountIs, convertToModelMessages } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { getSystemPrompt } from "@/lib/system-prompt";
import { chatTools } from "@/lib/tools";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic("claude-sonnet-4-5-20250929"),
    system: getSystemPrompt(),
    messages: await convertToModelMessages(messages),
    tools: chatTools,
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}
