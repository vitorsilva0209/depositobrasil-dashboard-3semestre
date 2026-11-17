


import { Router } from "express";
import { autenticarToken } from "../middlewares/authMiddleware";
import {
  listarFuncionarios,
  buscarFuncionario,
  cadastrarFuncionario,
  atualizarFuncionario,
  excluirFuncionario,
} from "../controllers/funcionarioController";

const router = Router();

router.use(autenticarToken);

router.get("/", listarFuncionarios);
router.get("/:id", buscarFuncionario);
router.post("/", cadastrarFuncionario);
router.put("/:id", atualizarFuncionario);
router.delete("/:id", excluirFuncionario);

export default router;
