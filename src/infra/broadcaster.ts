import { log } from 'console';

class SSEBroadcaster {
  private readonly connections: Map<string, ReadableStreamDefaultController> =
    new Map();

  addConnection(id: string, controller: ReadableStreamDefaultController) {
    this.connections.set(id, controller);
    log(`📡 Nova conexão SSE (${id}). Total: ${this.connections.size}`);
  }

  removeConnection(id: string) {
    this.connections.delete(id);
    log(`📡 Conexão SSE removida (${id}). Total: ${this.connections.size}`);
  }

  broadcast(data: any, event?: string) {
    let message = '';
    if (event) {
      message += `event: ${event}\n`;
    }
    message += `data: ${JSON.stringify(data)}\n\n`;

    const encoded = new TextEncoder().encode(message);

    this.connections.forEach((controller, id) => {
      try {
        controller.enqueue(encoded);
      } catch (error) {
        console.warn('Removendo conexão inválida:', error);
        this.connections.delete(id);
      }
    });

    log(`📢 Broadcast enviado para ${this.connections.size} conexões`);
  }

  get connectionCount() {
    return this.connections.size;
  }
}

export const broadcaster = new SSEBroadcaster();
