<?php

class Login {
    private string $usuario;
    private string $senha;
    private string $erro = "";

    public function __construct(string $usuario, string $senha) {
        $this->setUsuario($usuario);
        $this->setSenha($senha);
    }

    public function setUsuario(string $usuario): void {
        $this->usuario = trim($usuario);
    }

    public function setSenha(string $senha): void {
        $this->senha = trim($senha);
    }

    public function getErro(): string {
        return $this->erro;
    }

    public function autenticar($conn): bool {
        if ($this->usuario === "" || $this->senha === "") {
            $this->erro = "Preencha todos os campos!";
            return false;
        }

        $stmt = $conn->prepare("SELECT id, nome, senha FROM usuarios WHERE usuario = ?");
        if (!$stmt) {
            $this->erro = "Erro ao preparar consulta: " . $conn->error;
            return false;
        }

        $stmt->bind_param("s", $this->usuario);
        $stmt->execute();
        $resultado = $stmt->get_result();

        if ($resultado->num_rows > 0) {
            $user = $resultado->fetch_assoc();
            
            if ($this->senha === $user["senha"]) {
                $_SESSION["id"] = $user["id"];
                $_SESSION["nome"] = $user["nome"];
                $stmt->close();
                return true;
            } else {
                $this->erro = "Senha incorreta!";
            }
        } else {
            $this->erro = "Usuário não encontrado!";
        }

        $stmt->close();
        return false;
    }
}