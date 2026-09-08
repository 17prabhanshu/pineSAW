import { kafkaService } from '@/lib/kafka/kafkaClient';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection handshake and current telemetry
      const initialData = kafkaService.getTelemetry();
      controller.enqueue(
        encoder.encode(`event: init\ndata: ${JSON.stringify(initialData)}\n\n`)
      );

      let lastMessageCount = initialData.totalProduced;

      // Heartbeat & telemetry streaming interval
      const interval = setInterval(() => {
        try {
          const telemetry = kafkaService.getTelemetry();

          // If new messages arrived, stream them immediately
          if (telemetry.totalProduced > lastMessageCount) {
            const freshMessages = telemetry.recentMessages.slice(
              0,
              telemetry.totalProduced - lastMessageCount
            );
            freshMessages.forEach((msg) => {
              controller.enqueue(
                encoder.encode(`event: message\ndata: ${JSON.stringify(msg)}\n\n`)
              );
            });
            lastMessageCount = telemetry.totalProduced;
          }

          // Periodic telemetry sync ping
          controller.enqueue(
            encoder.encode(`event: telemetry\ndata: ${JSON.stringify(telemetry)}\n\n`)
          );
        } catch {
          clearInterval(interval);
          controller.close();
        }
      }, 2500);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
