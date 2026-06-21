import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profilesRouter from "./profiles";
import contentRouter from "./content";
import tmdbRouter from "./tmdb-route";
import resolveRouter from "./resolve";
import hlsProxyRouter from "./hls-proxy";
import adminRouter from "./admin";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profilesRouter);
router.use(contentRouter);
router.use(tmdbRouter);
router.use(resolveRouter);
router.use(hlsProxyRouter);
router.use(adminRouter);
router.use(analyticsRouter);

export default router;
