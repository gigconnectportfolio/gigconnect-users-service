import {Logger} from "winston";
import {IBuyerDocument, winstonLogger} from "@kariru-k/gigconnect-shared";
import {config} from "../config";
import {Channel, ConsumeMessage} from "amqplib";
import {createConnection} from "./connection";
import {createBuyer, updateBuyerPurchasedGigsProp} from "../services/buyer.service";
import {
    getRandomSellers,
    updateSellerCancelledJobsCount,
    updateSellerCompletedJobsCount,
    updateSellerOngoingJobsCount,
    updateSellerReview,
    updateTotalGigsCount
} from "../services/seller.service";
import {publishDirectMessage} from "./user.producer";

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'Users Service Queue Consumer', 'debug');

export async function consumeBuyerDirectMessage(channel: Channel): Promise<void> {
    try {
        if (!channel) {
            channel = await createConnection() as Channel;
        }
        const exchangeName = 'gigconnect-buyer-updates';
        const routingKey = 'user-buyer';
        const queueName = 'user-buyer-queue';

        await channel.assertExchange(exchangeName, 'direct', {durable: true});
        const jobberQueue = await channel.assertQueue(queueName, {durable: true, autoDelete: false});


        log.info('Registered consumeBuyerDirectMessage consumer');

        await channel.bindQueue(jobberQueue.queue, exchangeName, routingKey);

        channel.consume(jobberQueue.queue, async (msg: ConsumeMessage | null) => {
            if (msg) {
                log.info(`Received message: ${msg.content.toString()}`);
                const {type} = JSON.parse(msg.content.toString());
                if (type) {
                    log.info(`✅ Received message of type: ${type}`);
                    if (type === 'auth') {
                        const {
                            username,
                            email,
                            profilePicture,
                            country,
                            createdAt
                        } = JSON.parse(msg.content.toString());
                        const buyer: IBuyerDocument = {
                            username: username,
                            email: email,
                            profilePicture: profilePicture,
                            country: country,
                            purchasedGigs: [],
                            createdAt: createdAt
                        };
                        await createBuyer(buyer);
                    } else {
                        const {buyerId, purchasedGigs} = JSON.parse(msg.content.toString());
                        await updateBuyerPurchasedGigsProp(buyerId, purchasedGigs, type);
                    }
                }
                channel.ack(msg);
            }
        });
    } catch (error) {
        log.log('error', `❌ Users Service consumeDirectMessage() Method`, error);
    }
}

export async function consumeSellerDirectMessage(channel: Channel): Promise<void> {
    try {
        if (!channel) {
            channel = await createConnection() as Channel;
        }
        const exchangeName = 'gigconnect-seller-updates';
        const routingKey = 'user-seller';
        const queueName = 'user-seller-queue';

        await channel.assertExchange(exchangeName, 'direct', {durable: true});
        const jobberQueue = await channel.assertQueue(queueName, {durable: true, autoDelete: false});

        await channel.bindQueue(jobberQueue.queue, exchangeName, routingKey);

        channel.consume(jobberQueue.queue, async (msg: ConsumeMessage | null) => {
            if (msg) {
                const {
                    type,
                    sellerId,
                    ongoingJobs,
                    completedJobs,
                    totalEarnings,
                    recentDelivery,
                    gigSellerId,
                    count
                } = JSON.parse(msg.content.toString());

                if (type) {
                    log.info(`✅ Received message of type: ${type}`);
                    // Handle seller messages here
                    if (type === 'create-order') {
                        await updateSellerOngoingJobsCount(sellerId, ongoingJobs);
                    } else if (type === 'approve-order') {
                        await updateSellerCompletedJobsCount({
                            sellerId,
                            ongoingJobs,
                            completedJobs,
                            totalEarnings,
                            recentDelivery
                        });
                    } else if (type === 'update-gig-count') {
                        await updateTotalGigsCount(`${gigSellerId}`, count);
                    } else if (type === 'cancel-order') {
                        await updateSellerCancelledJobsCount(sellerId);
                    }
                }
                channel.ack(msg);
            }
        });
    } catch (error) {
        log.log('error', `❌ Users Service consumeDirectMessage() Method`, error);
    }
}

export async function consumeReviewFanoutMessages(channel: Channel): Promise<void> {
    try {
        if (!channel) {
            channel = await createConnection() as Channel;
        }
        const exchangeName = 'gigconnect-review';
        const queueName = 'seller-review-queue';

        await channel.assertExchange(exchangeName, 'fanout', {durable: true});
        const jobberQueue = await channel.assertQueue(queueName, {durable: true, autoDelete: false});

        await channel.bindQueue(jobberQueue.queue, exchangeName, '');

        channel.consume(jobberQueue.queue, async (msg: ConsumeMessage | null) => {
            if (msg) {
                const {type} = JSON.parse(msg.content.toString());
                if (type) {
                    if (type === 'buyer-review') {
                        await updateSellerReview(JSON.parse(msg.content.toString()));
                        await publishDirectMessage(
                            channel,
                            'gigconnect-update-gig',
                            'update-gig',
                            JSON.stringify({
                                type: 'updateGig',
                                gigReview: msg.content.toString()
                            }),
                            'Message sent to gig service.'
                        )
                    }
                }

                channel.ack(msg);
            }
        });
    } catch (error) {
        log.log('error', `❌ Users Service consumeReviewFanoutMessages() Method`, error);
    }
}

export async function consumeSeedGigDirectMessages(channel: Channel): Promise<void> {
    try {
        if (!channel) {
            channel = await createConnection() as Channel;
        }
        const exchangeName = 'gigconnect-gig';
        const queueName = 'users-gig-queue';
        const routingKey = 'get-sellers';

        await channel.assertExchange(exchangeName, 'direct', {durable: true});
        const jobberQueue = await channel.assertQueue(queueName, {durable: true, autoDelete: false});

        await channel.bindQueue(jobberQueue.queue, exchangeName, routingKey);

        channel.consume(jobberQueue.queue, async (msg: ConsumeMessage | null) => {
            if (msg) {
                const {type} = JSON.parse(msg.content.toString());
                if (type) {
                    if (type === 'getSellers') {
                        const { count } = JSON.parse(msg.content.toString());
                        const sellers = await getRandomSellers(parseInt(count, 10));
                        await publishDirectMessage(
                            channel,
                            'gigconnect-seed-gig',
                            'receive-sellers',
                            JSON.stringify({
                                type: 'receiveSellers',
                                sellers,
                                count
                            }),
                            'Message sent to gig service.'
                        )
                    }
                }

                channel.ack(msg);
            }
        });
    } catch (error) {
        log.log('error', `❌ Users Service consumeReviewFanoutMessages() Method`, error);
    }
}
