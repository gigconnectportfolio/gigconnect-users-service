import {BadRequestError, IBuyerDocument, winstonLogger} from "@kariru-k/gigconnect-shared";
import {BuyerModel} from "../models/buyer.schema";
import {Logger} from "winston";
import {config} from "../config";

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'Users Service Queue Consumer', 'debug');


export const getBuyerByEmail = async (email: string): Promise<IBuyerDocument | null> => {
    return await BuyerModel.findOne({email}).exec() as IBuyerDocument;
}

export const getBuyerByUsername = async (username: string): Promise<IBuyerDocument | null> => {
    return await BuyerModel.findOne({username}).exec() as IBuyerDocument;
}

export const getRandomBuyers = async (count: number): Promise<IBuyerDocument[]> => {
    return await BuyerModel.aggregate([{ $sample: { size: count } }]).exec() as IBuyerDocument[];
}

export const createBuyer = async (buyerData: IBuyerDocument): Promise<void> => {
    const checkIfBuyerExists = await getBuyerByEmail(`${buyerData.email}`);
    if(!checkIfBuyerExists){
        try {
            log.info(`Creating buyer with email: ${buyerData.email}`);
            await BuyerModel.create(buyerData);
        } catch (error) {
            log.error(`Error creating buyer with email: ${buyerData.email} - ${error}`);
            throw new BadRequestError('Error creating buyer', 'Buyer Service createBuyer() method error');
        }
    }
}

export const updateBuyerIsSellerProp = async(email: string): Promise<void> => {
    await BuyerModel.updateOne({email: email}, {$set: {isSeller: true}}).exec();
}

export const updateBuyerPurchasedGigsProp = async (buyerId: string, purchasedGigsId: string, type: string): Promise<void> => {
    await BuyerModel.updateOne(
        {_id: buyerId },
        type === 'purchasedGigs' ? { $push: { purchasedGigs: purchasedGigsId } } : {$pull: { purchasedGigs: purchasedGigsId }}
    )
}
