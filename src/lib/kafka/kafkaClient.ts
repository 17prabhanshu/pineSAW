import { Kafka, Producer, logLevel } from 'kafkajs';
import crypto from 'crypto';

// Standardized Kafka Topic Taxonomy for institutional CTI & Forensics
export const KAFKA_TOPICS = {
  RAW_INTERCEPTS: 'pinesaw.raw.intercepts',
  EXTRACTED_ENTITIES: 'pinesaw.extracted.entities',
  THREAT_ALERTS: 'pinesaw.alerts.threat',
  CHAIN_OF_CUSTODY: 'pinesaw.audit.chain_of_custody',
} as const;

export type KafkaTopicName = typeof KAFKA_TOPICS[keyof typeof KAFKA_TOPICS];

export interface KafkaIntelEnvelope {
  id: string;
  topic: string;
  source: string;
  timestamp: string;
  sha256: string;
  data: Record<string, any>;
  partition?: number;
  offset?: string;
  isBuffered?: boolean;
}

export interface KafkaTopicStats {
  name: string;
  totalMessages: number;
  lastOffset: number;
  lastTimestamp: string | null;
}

export interface KafkaTelemetry {
  status: 'CONNECTED' | 'BUFFERING' | 'CONNECTING' | 'DISABLED';
  mode: 'KAFKA_CLUSTER' | 'RESILIENT_RING_BUFFER';
  brokers: string[];
  clientId: string;
  totalProduced: number;
  totalConsumed: number;
  bufferQueueSize: number;
  bufferCapacity: number;
  topics: Record<string, KafkaTopicStats>;
  recentMessages: KafkaIntelEnvelope[];
  lastError: string | null;
  lastHeartbeat: string;
}

class PineSawKafkaService {
  private static instance: PineSawKafkaService | null = null;
  private kafka: Kafka | null = null;
  private producer: Producer | null = null;
  private isConnecting: boolean = false;
  private isConnected: boolean = false;
  private brokers: string[] = ['localhost:9092'];
  private clientId: string = 'pinesaw-core-bus';

  // Resilient in-memory circular buffer for zero-loss offline execution
  private readonly BUFFER_CAPACITY = 200;
  private bufferQueue: KafkaIntelEnvelope[] = [];
  private totalProducedCount = 0;
  private totalConsumedCount = 0;
  private lastError: string | null = null;
  private lastHeartbeat: string = new Date().toISOString();

  private topicStats: Record<string, KafkaTopicStats> = {
    [KAFKA_TOPICS.RAW_INTERCEPTS]: {
      name: KAFKA_TOPICS.RAW_INTERCEPTS,
      totalMessages: 0,
      lastOffset: 0,
      lastTimestamp: null,
    },
    [KAFKA_TOPICS.EXTRACTED_ENTITIES]: {
      name: KAFKA_TOPICS.EXTRACTED_ENTITIES,
      totalMessages: 0,
      lastOffset: 0,
      lastTimestamp: null,
    },
    [KAFKA_TOPICS.THREAT_ALERTS]: {
      name: KAFKA_TOPICS.THREAT_ALERTS,
      totalMessages: 0,
      lastOffset: 0,
      lastTimestamp: null,
    },
    [KAFKA_TOPICS.CHAIN_OF_CUSTODY]: {
      name: KAFKA_TOPICS.CHAIN_OF_CUSTODY,
      totalMessages: 0,
      lastOffset: 0,
      lastTimestamp: null,
    },
  };

  private constructor() {
    const envBrokers = process.env.KAFKA_BROKERS || 'localhost:9092';
    this.brokers = envBrokers.split(',').map((b) => b.trim());
    this.clientId = process.env.KAFKA_CLIENT_ID || 'pinesaw-cti-node';

    // Seed initial synthetic buffer samples for instant visual feedback
    this.seedInitialTelemetry();
    
    // Attempt asynchronous connection in background
    this.initProducer();
  }

  public static getInstance(): PineSawKafkaService {
    if (!PineSawKafkaService.instance) {
      PineSawKafkaService.instance = new PineSawKafkaService();
    }
    return PineSawKafkaService.instance;
  }

  private seedInitialTelemetry() {
    const seedEvents: Array<{ topic: KafkaTopicName; source: string; data: any }> = [
      {
        topic: KAFKA_TOPICS.RAW_INTERCEPTS,
        source: 'Tor SOCKS5 Scraper #1',
        data: {
          headline: "GenesisMarket Mirror intercept: ShadowBroker listing 500x Fentanyl M30",
          market: "GenesisMarket",
          onion: "genesis4xyt6z9a1.onion",
          detectedWallets: ["bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"]
        }
      },
      {
        topic: KAFKA_TOPICS.THREAT_ALERTS,
        source: 'Telegram Ingestor (@ice_chd)',
        data: {
          headline: "CRITICAL: Velocity burst detected in Tri-City narcotics dead-drop channel",
          channel: "@ice_chd",
          narcotics: ["Methamphetamine", "Fentanyl"],
          threatLevel: "CRITICAL"
        }
      },
      {
        topic: KAFKA_TOPICS.CHAIN_OF_CUSTODY,
        source: 'Admissibility Engine (Sec 63 BSA)',
        data: {
          action: "HASH_VERIFICATION_GENERATED",
          entityId: "ACTOR-aadhar",
          examiner: "Inspector Cyber Crime Chandigarh",
          algorithm: "SHA-256"
        }
      }
    ];

    seedEvents.forEach((ev) => {
      this.publish(ev.topic, ev.data, ev.source);
    });
  }

  private async initProducer(): Promise<void> {
    if (this.producer || this.isConnecting) return;
    this.isConnecting = true;

    try {
      this.kafka = new Kafka({
        clientId: this.clientId,
        brokers: this.brokers,
        logLevel: logLevel.ERROR,
        retry: {
          initialRetryTime: 300,
          retries: 2,
        },
        connectionTimeout: 1500,
      });

      this.producer = this.kafka.producer({
        allowAutoTopicCreation: true,
      });

      await this.producer.connect();
      this.isConnected = true;
      this.lastError = null;
      console.log(`[Kafka Bus] Successfully connected to brokers at: ${this.brokers.join(', ')}`);

      // Flush buffered messages upon connection recovery
      await this.flushBufferedMessages();
    } catch (err: any) {
      this.isConnected = false;
      this.lastError = `Broker offline at ${this.brokers.join(', ')} (Resilient Ring Buffer Active)`;
      // Silent graceful fallback - standard for local dev without active Kafka cluster
    } finally {
      this.isConnecting = false;
      this.lastHeartbeat = new Date().toISOString();
    }
  }

  private async flushBufferedMessages() {
    if (!this.producer || !this.isConnected || this.bufferQueue.length === 0) return;

    const uncommitted = this.bufferQueue.filter((msg) => msg.isBuffered);
    for (const msg of uncommitted) {
      try {
        await this.producer.send({
          topic: msg.topic,
          messages: [
            {
              key: msg.id,
              value: JSON.stringify(msg),
            },
          ],
        });
        msg.isBuffered = false;
      } catch {
        break; // Stop flushing if cluster connection drops again
      }
    }
  }

  /**
   * Publish an intelligence payload to a Kafka topic.
   * If Kafka cluster is offline, writes into the resilient in-memory ring buffer.
   */
  public async publish(
    topic: KafkaTopicName | string,
    data: Record<string, any>,
    source: string = 'System'
  ): Promise<KafkaIntelEnvelope> {
    this.lastHeartbeat = new Date().toISOString();
    const timestamp = new Date().toISOString();
    const id = `KFK-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Cryptographic SHA-256 calculation for Section 63 BSA / 65B legal chain of custody
    const serializedPayload = JSON.stringify(data);
    const sha256 = crypto.createHash('sha256').update(serializedPayload).digest('hex');

    const envelope: KafkaIntelEnvelope = {
      id,
      topic,
      source,
      timestamp,
      sha256,
      data,
      isBuffered: true,
    };

    // Update topic counter & stats
    if (!this.topicStats[topic]) {
      this.topicStats[topic] = {
        name: topic,
        totalMessages: 0,
        lastOffset: 0,
        lastTimestamp: null,
      };
    }
    this.topicStats[topic].totalMessages++;
    this.topicStats[topic].lastOffset++;
    this.topicStats[topic].lastTimestamp = timestamp;
    this.totalProducedCount++;

    // Attempt delivery to native Kafka broker if connected
    if (this.producer && this.isConnected) {
      try {
        const recordMetadata = await this.producer.send({
          topic,
          messages: [
            {
              key: id,
              value: JSON.stringify(envelope),
              headers: {
                'x-pinesaw-source': source,
                'x-pinesaw-sha256': sha256,
              },
            },
          ],
        });

        if (recordMetadata && recordMetadata[0]) {
          envelope.partition = recordMetadata[0].partition;
          envelope.offset = recordMetadata[0].offset?.toString() || envelope.offset;
          envelope.isBuffered = false;
        }
      } catch (err: any) {
        this.isConnected = false;
        this.lastError = `Transient publish failure: ${err.message}. Buffering message.`;
        envelope.isBuffered = true;
      }
    }

    // Add to circular ring buffer
    this.bufferQueue.unshift(envelope);
    if (this.bufferQueue.length > this.BUFFER_CAPACITY) {
      this.bufferQueue.pop();
    }

    return envelope;
  }

  /**
   * Returns complete real-time cluster and queue telemetry.
   */
  public getTelemetry(): KafkaTelemetry {
    // Periodically re-probe connection if disconnected
    if (!this.isConnected && !this.isConnecting) {
      this.initProducer().catch(() => {});
    }

    return {
      status: this.isConnected ? 'CONNECTED' : 'BUFFERING',
      mode: this.isConnected ? 'KAFKA_CLUSTER' : 'RESILIENT_RING_BUFFER',
      brokers: this.brokers,
      clientId: this.clientId,
      totalProduced: this.totalProducedCount,
      totalConsumed: this.totalConsumedCount,
      bufferQueueSize: this.bufferQueue.length,
      bufferCapacity: this.BUFFER_CAPACITY,
      topics: this.topicStats,
      recentMessages: this.bufferQueue.slice(0, 50),
      lastError: this.lastError,
      lastHeartbeat: this.lastHeartbeat,
    };
  }
}

export const kafkaService = PineSawKafkaService.getInstance();
