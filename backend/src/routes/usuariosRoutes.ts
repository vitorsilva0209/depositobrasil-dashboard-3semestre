import { Router } from "express";
import {
  obterMeuPerfil,
  atualizarMeuPerfil,
} from "../controllers/usuariosController";
import { autenticarToken } from "../middlewares/authMiddleware";

const router = Router();

router.use(autenticarToken);

router.get("/me", obterMeuPerfil);
router.put("/me", atualizarMeuPerfil);

export default router;