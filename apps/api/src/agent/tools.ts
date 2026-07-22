import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const getWeatherTool = tool(
  ({ location }: { location: string }) => {
    const conditions = ['sunny', 'cloudy', 'rainy', 'windy', 'snowy'];
    const condition = conditions[location.length % conditions.length];
    const temperatureF = 50 + ((location.length * 7) % 40);
    return `The weather in ${location} is ${condition} with a temperature of ${temperatureF}°F.`;
  },
  {
    name: 'get_weather',
    description: 'Get the current weather for a given city or location.',
    schema: z.object({
      location: z
        .string()
        .describe('The city or location to check the weather for.'),
    }),
  },
);

export const tools = [getWeatherTool];
