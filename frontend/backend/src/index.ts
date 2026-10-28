
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { database } from "./config/database";
import authRoutes from "./routes/authRoutes";
import { autenticarToken } from "./middlewares/authMiddleware";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);

app.get("/", async (_req, res) => {
  try {
    const [resultado] = await database.query(
      "SELECT DATABASE() AS banco"
    );

    res.json({
      sucesso: true,
      mensagem: "API conectada ao banco!",
      resultado,
    });
  } catch (erro) {
    console.error("Erro na conexão com o banco:", erro);

    res.status(500).json({
      sucesso: false,
      mensagem: "Não foi possível conectar ao banco de dados.",
    });
  }
});

app.get("/api/protegido", autenticarToken, (req, res) => {
  const requisicao =
    req as import("./middlewares/authMiddleware").RequisicaoAutenticada;

  res.json({
    sucesso: true,
    mensagem: "Acesso autorizado!",
    usuarioId: requisicao.usuarioId,
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
