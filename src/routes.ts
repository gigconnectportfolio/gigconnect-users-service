import {Application} from "express";
import {verifyGatewayRequest} from "@kariru-k/gigconnect-shared";
import {buyerRoutes} from "./routes/buyer";
import {healthRoutes} from "./routes/health";
import {sellerRoutes} from "./routes/seller";

const BUYER_BASE_PATH = 'api/v1/buyer';
const SELLER_BASE_PATH = 'api/v1/seller';

export const appRoutes = (app: Application): void => {
    app.use('', healthRoutes());
    app.use(BUYER_BASE_PATH, verifyGatewayRequest, buyerRoutes());
    app.use(SELLER_BASE_PATH, verifyGatewayRequest, sellerRoutes());
}
