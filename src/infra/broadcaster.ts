import { log } from 'console';

import { getRedis, getRedisSubscriber } from './redis';

class SSEBroadcaster {
  private readonly connections: Map<string, ReadableStreamDefaultController> =
    new Map();

  private readonly redis = getRedis();

  private readonly subscriber = getRedisSubscriber();

  private isListening = false;

  addConnection(id: string, controller: ReadableStreamDefaultController) {
    this.connections.set(id, controller);
    log(`📡 Nova conexão SSE (${id}). Total local: ${this.connections.size}`);

    // Começar a escutar Redis na primeira conexão
    if (!this.isListening) {
      this.startListening();
    }
  }

  removeConnection(id: string) {
    this.connections.delete(id);
    log(
      `📡 Conexão SSE removida (${id}). Total local: ${this.connections.size}`,
    );
  }

  async broadcast(data: any, event?: string) {
    // 📢 GRITAR no "megafone" Redis para TODAS as instâncias escutarem
    await this.redis.publish('sse_broadcast', JSON.stringify({ data, event }));
    log(`📢 Broadcast publicado no Redis`);
  }

  private sendToLocalConnections(data: any, event?: string) {
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

    log(`📤 Mensagem enviada para ${this.connections.size} conexões locais`);
  }

  private startListening() {
    this.isListening = true;

    // 👂 ESCUTAR o "megafone" Redis
    this.subscriber.subscribe('sse_broadcast', (err, count) => {
      if (err) {
        console.error('❌ Erro ao se inscrever no Redis:', err);
      } else {
        log(`👂 Escutando canal Redis. Canais: ${count}`);
      }
    });

    // 📻 Quando alguém "gritar" no megafone, avisar conexões locais
    this.subscriber.on('message', (channel, message) => {
      if (channel === 'sse_broadcast') {
        const { data, event } = JSON.parse(message);
        log(
          `📻 Mensagem recebida do Redis, enviando para ${this.connections.size} conexões locais`,
        );
        this.sendToLocalConnections(data, event);
      }
    });
  }

  get connectionCount() {
    return this.connections.size;
  }
}

export const broadcaster = new SSEBroadcaster();
