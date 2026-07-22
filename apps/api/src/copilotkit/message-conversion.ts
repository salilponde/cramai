import type { Message } from '@ag-ui/core';
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from '@langchain/core/messages';
import type { BaseMessage } from '@langchain/core/messages';

function toText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .filter(
      (part): part is { type: 'text'; text: string } =>
        typeof part === 'object' &&
        part !== null &&
        (part as { type?: unknown }).type === 'text',
    )
    .map((part) => part.text)
    .join('\n');
}

export function toLangChainMessages(messages: Message[]): BaseMessage[] {
  return messages.map((message) => {
    switch (message.role) {
      case 'user':
        return new HumanMessage({ content: toText(message.content) });
      case 'assistant':
        return new AIMessage({
          content: message.content ?? '',
          tool_calls: message.toolCalls?.map((toolCall) => ({
            id: toolCall.id,
            name: toolCall.function.name,
            args: JSON.parse(toolCall.function.arguments || '{}') as Record<
              string,
              unknown
            >,
          })),
        });
      case 'tool':
        return new ToolMessage({
          content: message.content,
          tool_call_id: message.toolCallId,
        });
      case 'system':
      case 'developer':
        return new SystemMessage({ content: message.content });
      default:
        return new HumanMessage({ content: '' });
    }
  });
}
