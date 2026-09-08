import { NextResponse } from 'next/server';
import { kafkaService, KAFKA_TOPICS } from '@/lib/kafka/kafkaClient';
import { DarknetNLPExtractor } from '@/lib/nlp/slangExtractor';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      topic = KAFKA_TOPICS.RAW_INTERCEPTS,
      data,
      source = 'REST Ingestion Gateway',
      autoExtract = false,
    } = body;

    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Invalid or missing "data" object in request payload' },
        { status: 400 }
      );
    }

    // 1. Publish primary event to Kafka
    const envelope = await kafkaService.publish(topic, data, source);

    // 2. Optional automated pipeline chain: If autoExtract is true and text is provided,
    // execute NLP extraction and automatically publish extracted entities to Kafka
    let extractionSummary = null;
    const textToExtract = data.text || data.rawText || data.headline || '';
    if (autoExtract && textToExtract) {
      const extracted = DarknetNLPExtractor.parse(textToExtract);
      extractionSummary = {
        narcotics: extracted.narcotics,
        wallets: extracted.identifiers.cryptoAddresses,
        handles: extracted.identifiers.communicationHandles,
        threatLevel: extracted.threatLevel,
      };

      // Emit downstream extracted entities event to Kafka topic
      await kafkaService.publish(
        KAFKA_TOPICS.EXTRACTED_ENTITIES,
        {
          parentMessageId: envelope.id,
          sourceEvent: source,
          extractedEntities: extractionSummary,
          timestamp: new Date().toISOString(),
        },
        'NLP iCrime Pipeline'
      );

      // If threat level is CRITICAL, emit a threat alert to Kafka
      if (extracted.threatLevel === 'CRITICAL') {
        await kafkaService.publish(
          KAFKA_TOPICS.THREAT_ALERTS,
          {
            severity: 'CRITICAL',
            title: `CRITICAL Narcotic Threat Flagged: ${extracted.narcotics[0]?.standardizedName || 'Unknown Substance'}`,
            detectedTokens: extracted.narcotics,
            wallets: extracted.identifiers.cryptoAddresses,
            originMessageId: envelope.id,
          },
          'Automated Risk Evaluator'
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        envelope,
        autoExtracted: extractionSummary,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Kafka Publish API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to publish event to Kafka' },
      { status: 500 }
    );
  }
}
