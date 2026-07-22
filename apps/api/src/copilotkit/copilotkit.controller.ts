import { All, Controller, Req, Res } from '@nestjs/common';
import {
  CopilotRuntime,
  copilotRuntimeNestEndpoint,
} from '@copilotkit/runtime';
import type { Request, Response } from 'express';
import { LangGraphChatAgent } from './langgraph-agent';

@Controller()
export class CopilotkitController {
  private readonly handleRequest = copilotRuntimeNestEndpoint({
    runtime: new CopilotRuntime({
      agents: { default: new LangGraphChatAgent() },
    }),
    endpoint: '/copilotkit',
  });

  @All(['copilotkit', 'copilotkit/*splat'])
  async handleCopilotkit(@Req() req: Request, @Res() res: Response) {
    await this.handleRequest(req, res);
  }
}
