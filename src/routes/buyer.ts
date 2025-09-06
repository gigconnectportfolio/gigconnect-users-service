import {Router} from "express";
import {currentUsername, email, username} from "../controllers/buyer/get";

const router: Router = express.Router();

export const buyerRoutes = (): Router => {
    router.get('/username', currentUsername);
    router.get('/email', email);
    router.get('/:username', username);
    return router;
}
