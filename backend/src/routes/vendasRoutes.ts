


import { Router } from "express";
import { autenticarToken } from "../middlewares/authMiddleware";
import {
  listarVendas,
  buscarVenda,
  cadastrarVenda,
  atualizarVenda,
  excluirVenda,
} from "../controllers/vendaController";

const router = Router();

router.use(autenticarToken);

router.get("/", listarVendas);
router.get("/:id", buscarVenda);
router.post("/", cadastrarVenda);
router.put("/:id", atualizarVenda);
router.delete("/:id", excluirVenda);

export default router;
