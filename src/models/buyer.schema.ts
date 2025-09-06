import {model, Model, Schema} from "mongoose";
import {IBuyerDocument} from "@kariru-k/gigconnect-shared";

/**
    This schema defines the structure of a Buyer document in MongoDB.
    It includes fields for username, email, profile picture, country,
    seller status, purchased gigs, and creation date.
 */
const buyerSchema: Schema = new Schema(
    {
        username: {type: String, required: true,  index: true},
        email: {type: String, required: true, index: true},
        profilePicture: {type: String, required: true},
        country: {type: String, required: true},
        isSeller: {type: Boolean, default: false},
        purchasedGigs: [{type: Schema.Types.ObjectId, ref: 'Gig'}],
        createdAt: {type: Date}
    },
    {versionKey: false},
);

export const BuyerModel: Model<IBuyerDocument> = model<IBuyerDocument>('Buyer', buyerSchema);
