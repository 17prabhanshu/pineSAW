import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { KAFKA_TOPICS } from './kafkaClient';
import { DarknetNLPExtractor } from '../nlp/slangExtractor';
import prisma from '../db';

export class PineSawKafkaConsumerWorker {
  private consumer: Consumer | null = null;
  private isRunning: boolean = false;
  private brokers: string[];
  private groupId: string;

  constructor(groupId = 'pinesaw-forensic-workers') {
    const envBrokers = process.env.KAFKA_BROKERS || 'localhost:9092';
    this.brokers = envBrokers.split(',').map((b) => b.trim());
    this.groupId = groupId;
  }

  public async start(): Promise<void> {
    if (this.isRunning) return;

    try {
      const kafka = new Kafka({
        clientId: `worker-${Math.random().toString(36).substring(7)}`,
        brokers: this.brokers,
        retry: { retries: 1 },
      });

      this.consumer = kafka.consumer({ groupId: this.groupId });
      await this.consumer.connect();

      await this.consumer.subscribe({
        topics: [KAFKA_TOPICS.RAW_INTERCEPTS, KAFKA_TOPICS.THREAT_ALERTS],
        fromBeginning: false,
      });

      this.isRunning = true;
      console.log(`[Kafka Consumer] Listening on topics: ${KAFKA_TOPICS.RAW_INTERCEPTS}, ${KAFKA_TOPICS.THREAT_ALERTS}`);

      await this.consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          await this.processMessage(payload);
        },
      });
    } catch (err: any) {
      this.isRunning = false;
      // In offline/buffer mode, consumer runs silently
      console.log(`[Kafka Consumer] Standalone cluster offline (${err.message}). Ingestion buffered via REST/SSE.`);
    }
  }

  private async processMessage(payload: EachMessagePayload): Promise<void> {
    const { topic, partition, message } = payload;
    if (!message.value) return;

    try {
      const parsedEnvelope = JSON.parse(message.value.toString());
      const rawText = parsedEnvelope.data?.text || parsedEnvelope.data?.rawText || '';

      if (rawText && topic === KAFKA_TOPICS.RAW_INTERCEPTS) {
        // Run NLP entity extraction
        const extraction = DarknetNLPExtractor.parse(rawText);

        // If high or critical threat, persist automated alert
        if (extraction.threatLevel === 'CRITICAL' || extraction.threatLevel === 'HIGH') {
          await prisma.alert.create({
            data: {
              type: 'NEW_LISTING',
              severity: extraction.threatLevel,
              title: `Kafka Stream Alert: ${extraction.narcotics[0]?.standardizedName || 'Suspect Intercept'}`,
              description: `Intercepted from Kafka topic [${topic}:${partition}] · Origin: ${parsedEnvelope.source}`,
              status: 'UNREAD',
            },
          }).catch(() => {});
        }
      }
    } catch (e) {
      console.error('[Kafka Consumer] Message processing error:', e);
    }
  }

  public async stop(): Promise<void> {
    if (this.consumer && this.isRunning) {
      await this.consumer.disconnect();
      this.isRunning = false;
    }
  }
}

export const kafkaConsumerWorker = new PineSawKafkaConsumerWorker();
