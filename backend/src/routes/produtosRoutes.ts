
import { Router } from "express";
import { autenticarToken } from "../middlewares/authMiddleware";
import {
  listarProdutos,
  buscarProduto,
  cadastrarProduto,
  atualizarProduto,
  excluirProduto,
} from "../controllers/produtoController";

const router = Router();

router.use(autenticarToken);

router.get("/", listarProdutos);
router.get("/:id", buscarProduto);
router.post("/", cadastrarProduto);
router.put("/:id", atualizarProduto);
router.delete("/:id", excluirProduto);

export default router;
