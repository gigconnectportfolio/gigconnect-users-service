import {NextFunction, Request, Response} from "express";
import {IBuyerDocument, NotFoundError} from "@kariru-k/gigconnect-shared";
import {getBuyerByEmail, getBuyerByUsername} from "../../services/buyer.service";
import {StatusCodes} from "http-status-codes";

/**
    This function handles the retrieval of a buyer's information based on their email address. It:
    1. Extracts the email address from the authenticated user's information in the request object.
    2. Queries the database to find a buyer with the provided email address.
    3. If a buyer is found, it responds with a success message and the buyer's information.
    4. If no buyer is found, it throws a NotFoundError.
    5. Any errors encountered during the process are passed to the next middleware for handling.
    @param {Request} req - The Express request object containing the authenticated user's information.
    @param {Response} res - The Express response object used to send the response.
    @param {NextFunction} next - The next middleware function in the Express stack.
    @returns {Promise<void>} A promise that resolves when the response is sent or an error is passed to the next middleware.
 */
export const email = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const buyer: IBuyerDocument | null = await getBuyerByEmail(req.currentUser!.email)
        if (!buyer) {
            throw new NotFoundError('Buyer not found', 'Buyer email() method error');
        }
        res.status(StatusCodes.OK).json({
            message: 'Buyer fetched successfully',
            buyer: buyer
        });
    } catch (e) {
        next(e);
    }
}

/**
    This function handles the retrieval of a buyer's information based on their username. It:
    1. Extracts the username from the authenticated user's information in the request object.
    2. Queries the database to find a buyer with the provided username.
    3. If a buyer is found, it responds with a success message and the buyer's information.
    4. If no buyer is found, it throws a NotFoundError.
    5. Any errors encountered during the process are passed to the next middleware for handling.
    @param {Request} req - The Express request object containing the authenticated user's information.
    @param {Response} res - The Express response object used to send the response.
    @param {NextFunction} next - The next middleware function in the Express stack.
    @returns {Promise<void>} A promise that resolves when the response is sent or an error is passed to the next middleware.
 */
export const currentUsername = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const buyer: IBuyerDocument | null = await getBuyerByUsername(req.currentUser!.username)
        if (!buyer) {
            throw new NotFoundError('Buyer not found', 'Buyer currentUsername() method error');
        }
        res.status(StatusCodes.OK).json({
            message: 'Buyer fetched successfully',
            buyer: buyer
        });
    } catch (e) {
        next(e);
    }
}

/**
    This function handles the retrieval of a buyer's information based on their username provided in the request parameters. It:
    1. Extracts the username from the request parameters.
    2. Queries the database to find a buyer with the provided username.
    3. If a buyer is found, it responds with a success message and the buyer's information.
    4. If no buyer is found, it throws a NotFoundError.
    5. Any errors encountered during the process are passed to the next middleware for handling.
    @param {Request} req - The Express request object containing the username in the parameters.
    @param {Response} res - The Express response object used to send the response.
    @param {NextFunction} next - The next middleware function in the Express stack.
    @returns {Promise<void>} A promise that resolves when the response is sent or an error is passed to the next middleware.
 */
export const username = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const {username} = req.params;
        const buyer: IBuyerDocument | null = await getBuyerByUsername(username)
        if (!buyer) {
            throw new NotFoundError('Buyer not found', 'Buyer username() method error');
        }
        res.status(StatusCodes.OK).json({
            message: 'Buyer fetched successfully',
            buyer: buyer
        });
    } catch (e) {
        next(e);
    }
}



