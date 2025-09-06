import { IBuyerDocument } from "@kariru-k/gigconnect-shared";
import {BuyerModel} from "../models/buyer.schema";

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
        await BuyerModel.create(buyerData);
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
