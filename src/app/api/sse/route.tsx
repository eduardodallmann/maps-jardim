import { randomUUID } from 'crypto';
import type { NextRequest } from 'next/server';

import { broadcaster } from '~/infra/broadcaster';

export async function GET(request: NextRequest) {
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  const connectionId = randomUUID();

  const stream = new ReadableStream({
    start(controller) {
      broadcaster.addConnection(connectionId, controller);

      const sendEvent = (data: any, event?: string) => {
        let message = '';
        if (event) {
          message += `event: ${event}\n`;
        }
        message += `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(new TextEncoder().encode(message));
      };

      sendEvent(
        {
          status: 'connected',
          connectionId,
          totalConnections: broadcaster.connectionCount,
          timestamp: new Date().toISOString(),
        },
        'connected',
      );

      request.signal.addEventListener('abort', () => {
        broadcaster.removeConnection(connectionId);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, { headers });
}
