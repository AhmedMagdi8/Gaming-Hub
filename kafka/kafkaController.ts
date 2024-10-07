import debug from "debug";
import { Kafka } from "kafkajs";
import { partial } from "lodash";

class kafkaController {
  kafka: Kafka;
  logger: any;
  constructor() {
    this.logger = debug("node-kafka:kafkaController");
    this.kafka = new Kafka({
      clientId: process.env.CLIENT_ID,
      brokers: [process.env.BROKER_1],
    });
  }

  // Method to create topic with multiple partitions

  async createTopic(topicName: any, noOfPartition: any) {
    try {
      const admin = this.kafka.admin();
      await admin.connect();
      console.log(topicName, noOfPartition);
      await admin.createTopics({
        topics: [
          {
            topic: topicName.toString(),
            numPartitions: parseInt(noOfPartition),
            replicationFactor: 1,
          },
        ],
      });
      await admin.disconnect();
    } catch (e) {
      console.log(e);
      this.logger(e);
      throw e;
    }
  }

  // Method to publish message to the topic

  async publishMessageToTopic(topicName, messages) {
    let producer: any;
    try {
      producer = this.kafka.producer();
      await producer.connect();
      await producer.send({
        topic: topicName,
        messages,
      });
    } catch (e) {
      this.logger(e);
      throw e;
    } finally {
      await producer.disconnect();
    }
  }

  // consume Topic

  async consumeMessageFromTopic(topicName: any, callback: any) {
    const consumer = this.kafka.consumer({ groupId: "test-groupoo" });

    try {
      await consumer.connect();
      console.log(3);

      await consumer.subscribe({
        topic: topicName,
        fromBeginning: true,
      });
      console.log(4);

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          const value = `Received message: ${message.value.toString()} from partition ${partition} & topic ${topic}`;
          console.log(4.5);
            console.log(value)
          callback(value);
          console.log(4.8);

        }
      });
      console.log(5);
    } catch (e) {
        console.log(e)
      this.logger(e);
      throw e;
    }
  }
}

export default kafkaController;