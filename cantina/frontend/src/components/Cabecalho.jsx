export default function Cabecalho({ titulo, voltar, aoPedirAjuda, aoSair }) {
  return (
    <header>
      <button className={voltar ? 'ib' : 'ib hide'} onClick={voltar} aria-label="Voltar">
        ←
      </button>
      <h1>{titulo}</h1>
      {aoSair && <button className="ib" onClick={aoSair} aria-label="Sair" title="Sair">↪</button>}
      <button className="ib" onClick={aoPedirAjuda} aria-label="Ajuda">
        ?
      </button>
    </header>
  )
}
