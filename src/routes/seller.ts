import express,{Router} from "express";
import {sellerCreate} from "../controllers/seller/create";
import {sellerUpdate} from "../controllers/seller/update";

const router: Router = express.Router();

export const sellerRoutes = (): Router => {
    router.post('/create', sellerCreate);
    router.put('/:sellerId', sellerUpdate);

    return router;
}
