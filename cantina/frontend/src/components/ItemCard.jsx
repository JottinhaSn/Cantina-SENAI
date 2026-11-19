import { dinheiro } from '../api'

export default function ItemCard({ item, quantidade, mudar, avisarEsgotado }) {
  const corpo = (
    <>
      <div className="img" aria-hidden="true">
        {item.emoji}
      </div>
      <div className="info">
        <div className="nm">{item.nome}</div>
        <div className="pr">{dinheiro(item.preco)}</div>
      </div>
    </>
  )

  if (item.esgotado) {
    return (
      <div className="card out" role="button" tabIndex={0} aria-label={`${item.nome}, esgotado. Toque para mais informações.`} onClick={() => avisarEsgotado(item)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); avisarEsgotado(item) } }}>
        {corpo}
        <div className="tag">Esgotado</div>
      </div>
    )
  }

  return (
    <div className="card">
      {corpo}
      {quantidade ? (
        <div className="step">
          <button onClick={() => mudar(item, -1)} aria-label={`Diminuir ${item.nome}`}>
            −
          </button>
          <b>{quantidade}</b>
          <button onClick={() => mudar(item, 1)} aria-label={`Aumentar ${item.nome}`}>
            +
          </button>
        </div>
      ) : (
        <button className="add" onClick={() => mudar(item, 1)} aria-label={`Adicionar ${item.nome}`}>
          +
        </button>
      )}
    </div>
  )
}
