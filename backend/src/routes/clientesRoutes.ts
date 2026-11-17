


import { Router } from "express";
import { autenticarToken } from "../middlewares/authMiddleware";
import {
  listarClientes,
  buscarCliente,
  cadastrarCliente,
  atualizarCliente,
  excluirCliente,
} from "../controllers/clienteController";

const router = Router();

router.use(autenticarToken);

router.get("/", listarClientes);
router.get("/:id", buscarCliente);
router.post("/", cadastrarCliente);
router.put("/:id", atualizarCliente);
router.delete("/:id", excluirCliente);

export default router;
