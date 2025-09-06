import {IOrderMessage, IRatingTypes, IReviewMessageDetails, ISellerDocument} from "@kariru-k/gigconnect-shared";
import {SellerModel} from "../models/seller.schema";
import mongoose from "mongoose";
import {updateBuyerIsSellerProp} from "./buyer.service";

export const getSellerById = async (sellerId: string): Promise<ISellerDocument | null> => {
    return await SellerModel.findOne({_id: new mongoose.Types.ObjectId(sellerId)}).exec() as ISellerDocument;
}

export const getSellerByUsername = async (username: string): Promise<ISellerDocument | null> => {
    return await SellerModel.findOne({username}).exec() as ISellerDocument;
}

export const getSellerByEmail = async (email: string): Promise<ISellerDocument | null> => {
    return await SellerModel.findOne({email}).exec() as ISellerDocument;
}

export const getRandomSellers = async (count: number): Promise<ISellerDocument[]> => {
    return await SellerModel.aggregate([{ $sample: { size: count } }]).exec() as ISellerDocument[];
}

export const createSeller = async (sellerData: ISellerDocument): Promise<ISellerDocument> => {
    const createdSeller: ISellerDocument = await SellerModel.create(sellerData) as ISellerDocument;
    await updateBuyerIsSellerProp(createdSeller.email!);
    return createdSeller;
}

export const updateSeller = async (sellerId: string, sellerData: ISellerDocument): Promise<ISellerDocument> => {
    return await SellerModel.findOneAndUpdate(
        {_id: new mongoose.Types.ObjectId(sellerId)},
        {
            $set:
                {
                    fullName: sellerData.fullName,
                    profilePublicId: sellerData.profilePublicId,
                    profilePicture: sellerData.profilePicture,
                    description: sellerData.description,
                    country: sellerData.country,
                    oneLiner: sellerData.oneLiner,
                    skills: sellerData.skills,
                    languages: sellerData.languages,
                    responseTime: sellerData.responseTime,
                    experience: sellerData.experience,
                    education: sellerData.education,
                    socialLinks: sellerData.socialLinks,
                    certificates: sellerData.certificates
                }
        },
        {new: true}
    ).exec() as ISellerDocument;
}

export const updateTotalGigsCount = async (sellerId: string, count: number): Promise<void> => {
    await SellerModel.updateOne(
        {_id: new mongoose.Types.ObjectId(sellerId)},
        { $inc: { totalGigs: count } }
    ).exec();
}

export const updateSellerOngoingJobsCount = async (sellerId: string, ongoingJobs: number): Promise<void> => {
    await SellerModel.updateOne(
        {_id: new mongoose.Types.ObjectId(sellerId)},
        { $inc: { ongoingJobs: ongoingJobs } }
    ).exec();
}

export const updateSellerCancelledJobsCount = async (sellerId: string): Promise<void> => {
    await SellerModel.updateOne(
        {_id: new mongoose.Types.ObjectId(sellerId)},
        { $inc: { cancelledJobs: 1, ongoingJobs: -1 } }
    ).exec();
}

export const updateSellerCompletedJobsCount = async (data: IOrderMessage): Promise<void> => {
    const { sellerId, ongoingJobs, completedJobs, totalEarnings, recentDelivery } = data;
    await SellerModel.updateOne(
        {_id: new mongoose.Types.ObjectId(sellerId)},
        {
            $inc: {
                ongoingJobs: ongoingJobs,
                completedJobs: completedJobs,
                totalEarnings: totalEarnings
            },
            $set: { recentDelivery: new Date(recentDelivery!) }
        }
    ).exec();
}

export const updateSellerReview =  async (data: IReviewMessageDetails): Promise<void> => {
    const ratingTypes: IRatingTypes = {
        '1': 'one',
        '2': 'two',
        '3': 'three',
        '4': 'four',
        '5': 'five'
    };
    const ratingKey: string = ratingTypes[`${data.rating}`];
    await SellerModel.updateOne(
        {_id: new mongoose.Types.ObjectId(data.sellerId)},
        {
            $inc: {
                ratingsCount: 1,
                ratingSum: data.rating,
                [`ratingCategories.${ratingKey}.value`]: data.rating,
                [`ratingCategories.${ratingKey}.count`]: 1
            }
        }
    ).exec();
}

