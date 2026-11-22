
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import { database } from "./config/database";
import { autenticarToken } from "./middlewares/authMiddleware";
import { errorMiddleware } from "./middlewares/errorMiddleware";

import usuariosRoutes from "./routes/usuariosRoutes";
import authRoutes from "./routes/authRoutes";
import produtosRoutes from "./routes/produtosRoutes";
import clientesRoutes from "./routes/clientesRoutes";
import funcionariosRoutes from "./routes/funcionariosRoutes";
import vendasRoutes from "./routes/vendasRoutes";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Arquivos de imagens
app.use(
  "/imagens",
  express.static(process.env.IMAGES_DIR || path.resolve(process.cwd(), "../imagens"))
);

// ConfiguraÃ§Ã£o CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Leitura de dados
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas da API
app.use("/api/auth", authRoutes);
app.use("/api/produtos", produtosRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/funcionarios", funcionariosRoutes);
app.use("/api/vendas", vendasRoutes);
app.use("/api/usuarios", usuariosRoutes);

// Teste de conexÃ£o com o banco
app.get("/", async (_req, res) => {
  try {
    const [resultado] = await database.query(
      "SELECT DATABASE() AS banco"
    );

    return res.json({
      sucesso: true,
      mensagem: "API conectada ao banco!",
      resultado,
    });
  } catch (erro) {
    console.error("Erro na conexÃ£o com o banco:", erro);

    return res.status(500).json({
      sucesso: false,
      mensagem: "NÃ£o foi possÃ­vel conectar ao banco de dados.",
    });
  }
});

// Rota protegida para testar autenticaÃ§Ã£o
app.get("/api/protegido", autenticarToken, (req, res) => {
  const requisicao =
    req as import("./middlewares/authMiddleware").RequisicaoAutenticada;

  return res.json({
    sucesso: true,
    mensagem: "Acesso autorizado!",
    usuarioId: requisicao.usuarioId,
  });
});

// Middleware global de tratamento de erros
// Deve ficar depois de todas as rotas.
app.use(errorMiddleware);

// InicializaÃ§Ã£o do servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
