import {NextFunction, Request, Response} from "express";
import {BadRequestError, ISellerDocument} from "@kariru-k/gigconnect-shared";
import {sellerSchema} from "../../schemes/seller";
import {createSeller, getSellerByEmail} from "../../services/seller.service";
import {StatusCodes} from "http-status-codes";

export const sellerCreate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { error } = sellerSchema.validate(req.body);
        if (error?.details) {
            throw new BadRequestError(error.details[0].message, 'create seller() method error');
        }

        const checkIfSellerExists: ISellerDocument | null = await getSellerByEmail(req.body.email);
        if (checkIfSellerExists) {
            throw new BadRequestError('Seller already exists', 'create seller() method error');
        }

        const seller: ISellerDocument = {
            profilePublicId: req.body.profilePublicId,
            fullName: req.body.fullName,
            username: req.body.username,
            email: req.body.email,
            profilePicture: req.body.profilePicture,
            description: req.body.description,
            oneliner: req.body.oneliner,
            country: req.body.country,
            skills: req.body.skills,
            languages: req.body.languages,
            responseTime: req.body.responseTime,
            experience: req.body.experience,
            education: req.body.education,
            socialLinks: req.body.socialLinks,
            certificates: req.body.certificates,
        };

        const createdSeller = await createSeller(seller);

        res.status(StatusCodes.CREATED).json({ message: 'Seller created successfully', seller: createdSeller });

    } catch (error) {
        next(error);
    }
}
