import { NextResponse } from 'next/server';
import { kafkaService } from '@/lib/kafka/kafkaClient';

export async function GET() {
  try {
    const telemetry = kafkaService.getTelemetry();
    return NextResponse.json(telemetry, { status: 200 });
  } catch (error: any) {
    console.error('Kafka Status API Error:', error);
    return NextResponse.json(
      {
        status: 'ERROR',
        mode: 'RESILIENT_RING_BUFFER',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
