import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { database } from "./config/database";
import authRoutes from "./routes/authRoutes";
import { autenticarToken } from "./middlewares/authMiddleware";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
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
      resultado
    });
  } catch (erro) {
    console.error("Erro na conexão com o banco:", erro);

    res.status(500).json({
      sucesso: false,
      mensagem: "Não foi possível conectar ao banco de dados."
    });
  }
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`API rodando em http://localhost:${PORT}`);
  app.get("/api/protegido", autenticarToken, (req, res) => {
  res.json({
    sucesso: true,
    mensagem: "Acesso autorizado!",
    usuarioId: (req as import("./middlewares/authMiddleware").RequisicaoAutenticada).usuarioId
  });
});
});