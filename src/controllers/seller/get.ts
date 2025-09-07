import {NextFunction, Request, Response} from "express";
import {ISellerDocument} from "@kariru-k/gigconnect-shared";
import {getRandomSellers, getSellerById, getSellerByUsername} from "../../services/seller.service";
import {StatusCodes} from "http-status-codes";

export const id = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

        const seller: ISellerDocument | null = await getSellerById(req.params.sellerId);
        res.status(StatusCodes.OK).json({
            message: 'Seller fetched successfully',
            seller: seller
        });
    } catch (e) {
        next(e);
    }
}

export const username = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const seller: ISellerDocument | null = await getSellerByUsername(req.params.username);
        res.status(StatusCodes.OK).json({
            message: 'Seller fetched successfully',
            seller: seller
        });
    } catch (e) {
        next(e);
    }
}

export const random = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const sellers: ISellerDocument[] = await getRandomSellers(Number(req.params.size));
        res.status(StatusCodes.OK).json({
            message: 'Sellers fetched successfully',
            sellers: sellers
        });
    } catch (e) {
        next(e);
    }
}

