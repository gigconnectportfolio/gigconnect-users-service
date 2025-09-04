import {Application} from "express";

const BUYER_BASE_PATH = 'api/v1/buyer';
const SELLER_BASE_PATH = 'api/v1/seller';

export const appRoutes = (app: Application): void => {
    app.get('/api/v1/healthchecker', (req, res) => {
        res.status(200).json({message: 'Users Service is healthy'});
    });

    app.get(`/${BUYER_BASE_PATH}/profile`, (req, res) => {
        res.status(200).json({message: 'Buyer Profile Endpoint'});
    });

    app.get(`/${SELLER_BASE_PATH}/profile`, (req, res) => {
        res.status(200).json({message: 'Seller Profile Endpoint'});
    });
}
