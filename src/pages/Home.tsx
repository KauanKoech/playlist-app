import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, selectIsAuthenticated } from "../redux/userSlice";
import type { AppDispatch } from "../redux/store";

// Credenciais de demonstração (mock)
const CREDENTIALS = { email: "kauan.k@aluno.ifsc.edu.br", senha: "kaka22" };

// Tela de Login com validação simples e persistência em sessionStorage
export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const authed = useSelector(selectIsAuthenticated);

  // Estados do formulário
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; senha?: string; cred?: string }>({});
  const disabled = useMemo(() => !email || !senha, [email, senha]);

  // Redireciona se já estiver autenticado
  useEffect(() => {
    if (authed) navigate("/home", { replace: true });
  }, [authed, navigate]);

  // Validação básica de e-mail e senha
  function validar(): boolean {
    const next: typeof errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "E-mail inválido";
    if (senha.length < 6) next.senha = "A senha deve ter 6+ caracteres";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // Submit: valida, confere mock e despacha login
  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    if (!validar()) return;
    if (email === CREDENTIALS.email && senha === CREDENTIALS.senha) {
      dispatch(login({ id: "u1", email }));
      navigate("/home");
    } else {
      setErrors({ cred: "Credenciais inválidas." });
    }
  }

  return (
    <div className="login-wrap hero-center">
      <div className="login-card">
        {/* Cabeçalho */}
        <header className="login-header">
          <h1>Logar</h1>
          <p className="muted">Use as credenciais fornecidas.</p>
        </header>

        {/* Formulário de login */}
        <form className="login-form" onSubmit={onSubmit} noValidate>
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aluno@aluno.ifsc.edu.br"
              autoComplete="email"
              required
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </label>

          <label>
            Senha
            <div className="pwd-row">
              <input
                type={showPwd ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="senha"
                autoComplete="current-password"
                required
                minLength={6}
              />
              {/* Mostrar/ocultar senha */}
              <button
                type="button"
                className="ghost"
                onClick={() => setShowPwd((v) => !v)}
              >
                {showPwd ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {errors.senha && <span className="error">{errors.senha}</span>}
          </label>

          {/* Erro de credenciais */}
          {errors.cred && <div className="error cred">{errors.cred}</div>}

          {/* Botão de envio (desabilita sem campos) */}
          <button className="primary" type="submit" disabled={disabled}>
            Entrar
          </button>
        </form>

        {/* Rodapé informativo */}
        <footer className="login-footer">
          <small className="muted">
            A sessão é salva em <code>sessionStorage</code> (<code>session:user</code>) com <em>lastLogin</em>.
          </small>
        </footer>
      </div>
    </div>
  );
}
