import { ChatAnthropic } from '@langchain/anthropic';
import type { AIMessage } from '@langchain/core/messages';
import {
  END,
  MessagesAnnotation,
  START,
  StateGraph,
} from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { tools } from './tools';

const model = new ChatAnthropic({
  model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5',
  temperature: 0,
}).bindTools(tools);

const toolNode = new ToolNode(tools);

async function callModel(state: typeof MessagesAnnotation.State) {
  const response = await model.invoke(state.messages);
  return { messages: [response] };
}

function routeAfterModel(state: typeof MessagesAnnotation.State) {
  const lastMessage = state.messages.at(-1) as AIMessage;
  return lastMessage.tool_calls && lastMessage.tool_calls.length > 0
    ? 'tools'
    : END;
}

export const agentGraph = new StateGraph(MessagesAnnotation)
  .addNode('agent', callModel)
  .addNode('tools', toolNode)
  .addEdge(START, 'agent')
  .addConditionalEdges('agent', routeAfterModel, ['tools', END])
  .addEdge('tools', 'agent')
  .compile();
