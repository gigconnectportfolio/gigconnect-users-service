import express,{Router} from "express";
import {sellerCreate} from "../controllers/seller/create";
import {sellerUpdate} from "../controllers/seller/update";
import {id, random, username} from "../controllers/seller/get";
import {seedSeller} from "../controllers/seller/seed";

const router: Router = express.Router();

export const sellerRoutes = (): Router => {
    router.get('/id/:sellerId', id);
    router.get('/username/:username', username);
    router.get('/random/:size', random);
    router.post('/create', sellerCreate);
    router.put('/:sellerId', sellerUpdate);
    router.post('/seed/:count', seedSeller)

    return router;
}
