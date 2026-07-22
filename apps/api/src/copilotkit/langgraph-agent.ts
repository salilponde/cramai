import { AbstractAgent, randomUUID } from '@ag-ui/client';
import { EventType } from '@ag-ui/core';
import type { BaseEvent, RunAgentInput } from '@ag-ui/core';
import type { AIMessageChunk } from '@langchain/core/messages';
import { Observable } from 'rxjs';
import { agentGraph } from '../agent/graph';
import { toLangChainMessages } from './message-conversion';

export class LangGraphChatAgent extends AbstractAgent {
  run(input: RunAgentInput): Observable<BaseEvent> {
    return new Observable<BaseEvent>((subscriber) => {
      const controller = new AbortController();

      void (async () => {
        subscriber.next({
          type: EventType.RUN_STARTED,
          threadId: input.threadId,
          runId: input.runId,
        });

        const messageId = randomUUID();
        let started = false;

        const stream = await agentGraph.stream(
          { messages: toLangChainMessages(input.messages) },
          { streamMode: 'messages', signal: controller.signal },
        );

        for await (const [chunk] of stream) {
          const content = (chunk as AIMessageChunk).content;
          const text = typeof content === 'string' ? content : '';
          if (!text) continue;
          if (!started) {
            subscriber.next({
              type: EventType.TEXT_MESSAGE_START,
              messageId,
              role: 'assistant',
            });
            started = true;
          }
          subscriber.next({
            type: EventType.TEXT_MESSAGE_CONTENT,
            messageId,
            delta: text,
          });
        }

        if (started) {
          subscriber.next({ type: EventType.TEXT_MESSAGE_END, messageId });
        }

        subscriber.next({
          type: EventType.RUN_FINISHED,
          threadId: input.threadId,
          runId: input.runId,
        });
        subscriber.complete();
      })().catch((error: unknown) => {
        subscriber.next({
          type: EventType.RUN_ERROR,
          message: error instanceof Error ? error.message : String(error),
          threadId: input.threadId,
          runId: input.runId,
        });
        subscriber.error(error as Error);
      });

      return () => controller.abort();
    });
  }
}
