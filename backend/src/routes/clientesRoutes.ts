
import { Router } from "express";
import { autenticarToken } from "../middlewares/authMiddleware";
import { Cliente } from "../models/clienteModel";
import { ClienteRepository } from "../repositories/ClienteRepository";
import { ClienteService } from "../services/clienteService";

const router = Router();

const clienteRepository = new ClienteRepository();
const clienteService = new ClienteService(clienteRepository);

router.use(autenticarToken);

// LISTAR CLIENTES COM BUSCA E PAGINAÇÃO
router.get("/", async (req, res, next) => {
  try {
    const pagina = Math.max(1, Number(req.query.pagina) || 1);
    const limite = Math.min(100, Math.max(1, Number(req.query.limite) || 10));
    const busca = String(req.query.busca || "").trim();

    const resultado = await clienteService.listarPaginado({
      pagina,
      limite,
      busca,
    });

    return res.json({
      sucesso: true,
      clientes: resultado.dados,
      pagina,
      limite,
      total: resultado.total,
      totalPaginas: Math.ceil(resultado.total / limite),
    });
  } catch (erro) {
    return next(erro);
  }
});

// BUSCAR CLIENTE POR ID
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const cliente = await clienteService.buscarPorId(id);

    return res.json({
      sucesso: true,
      cliente,
    });
  } catch (erro) {
    return next(erro);
  }
});

// CADASTRAR CLIENTE
router.post("/", async (req, res, next) => {
  try {
    const { nome, email, telefone } = req.body;

    const cliente = new Cliente(nome, email ?? "", telefone ?? "");
    const id = await clienteService.cadastrar(cliente);

    return res.status(201).json({
      sucesso: true,
      mensagem: "Cliente cadastrado com sucesso!",
      id,
    });
  } catch (erro) {
    return next(erro);
  }
});

// ATUALIZAR CLIENTE
router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { nome, email, telefone } = req.body;

    const cliente = new Cliente(nome, email ?? "", telefone ?? "");
    await clienteService.atualizar(id, cliente);

    return res.json({
      sucesso: true,
      mensagem: "Cliente atualizado com sucesso!",
    });
  } catch (erro) {
    return next(erro);
  }
});

// EXCLUIR CLIENTE
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await clienteService.excluir(id);

    return res.json({
      sucesso: true,
      mensagem: "Cliente excluído com sucesso!",
    });
  } catch (erro) {
    return next(erro);
  }
});

export default router;
