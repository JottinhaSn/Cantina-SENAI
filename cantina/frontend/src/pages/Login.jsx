import { useState } from 'react'

export default function Login({ aoEntrar }) {
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  function entrarAtendente(e) {
    e.preventDefault()
    if (senha === 'atm123') {
      aoEntrar('atendente')
      return
    }
    setErro('Senha incorreta. Confira e tente novamente.')
  }

  return (
    <div className="login-page">
      <section className="login-card" aria-labelledby="login-titulo">
        <div className="login-logo" aria-hidden="true">🍔</div>
        <h1 id="login-titulo">Cantina SENAI</h1>
        <p className="login-subtitle">Faça seu login para continuar</p>

        {!mostrarSenha ? (
          <>
            <button className="btn pri login-main" onClick={() => aoEntrar('cliente')}>
              Entrar como cliente
            </button>
            <div className="login-separator"><span>ou</span></div>
            <p className="login-question">É atendente?</p>
            <button className="btn sec" onClick={() => { setMostrarSenha(true); setErro('') }}>
              Entrar como atendente
            </button>
          </>
        ) : (
          <form onSubmit={entrarAtendente}>
            <label htmlFor="senha-atendente">Senha da atendente</label>
            <input
              id="senha-atendente"
              type="password"
              autoFocus
              value={senha}
              onChange={(e) => { setSenha(e.target.value); setErro('') }}
              placeholder="Digite a senha"
              autoComplete="current-password"
            />
            {erro && <p className="err" role="alert">{erro}</p>}
            <button className="btn pri login-main" type="submit">Acessar painel</button>
            <button className="btn sec login-back" type="button" onClick={() => { setMostrarSenha(false); setSenha(''); setErro('') }}>
              Voltar
            </button>
          </form>
        )}
        <p className="login-foot">Sistema de pedidos • SENAI</p>
      </section>
    </div>
  )
}
