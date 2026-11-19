import { dinheiro, numero } from '../api'

const etapas = ['Pedido recebido', 'Pedido em preparo', 'Pedido pronto']
const ordem = ['recebido', 'em preparo', 'pronto', 'retirado']
const mensagens = [
  'Recebemos seu pedido!',
  'Estamos preparando seu pedido.',
  'Pedido pronto. Por favor buscar no balcão.',
  'Pedido retirado. Obrigado!',
]

export default function AcompanharPedido({ pedido, cancelar, retirar }) {
  const posicao = ordem.indexOf(pedido.status)
  const resumo = pedido.itens.map((linha) => `${linha.quantidade} ${linha.item.nome}`).join(', ')

  return (
    <div className="card blk">
      <div className="big">
        Pedido N° {numero(pedido.id)} – {pedido.nomeCliente}
      </div>
      <p className="note" style={{ marginBottom: 8 }}>
        {resumo} · {dinheiro(pedido.total)}
      </p>

      {pedido.status === 'cancelado' ? (
        <div className="msg bad">Pedido cancelado. Nenhuma cobrança será feita.</div>
      ) : (
        <>
          <ul className="tl">
            {etapas.map((etapa, i) => {
              const classe = posicao > i || posicao === 3 ? 'done' : posicao === i ? 'cur' : ''
              return (
                <li key={etapa} className={classe}>
                  <span className="dot">{classe === 'done' ? '✓' : i + 1}</span>
                  {etapa}
                </li>
              )
            })}
          </ul>
          <div className={posicao >= 2 ? 'msg ok' : 'msg'}>{mensagens[posicao]}</div>

          {posicao === 0 && (
            <button className="btn dng" onClick={() => cancelar(pedido.id)}>
              Cancelar pedido
            </button>
          )}
          {posicao === 1 && (
            <>
              <button className="btn dng" disabled>
                Cancelar pedido
              </button>
              <p className="note" style={{ marginTop: 6 }}>
                Seu pedido já está sendo preparado e não pode mais ser cancelado.
              </p>
            </>
          )}
          {posicao === 2 && (
            <button className="btn pri" onClick={() => retirar(pedido.id)}>
              Já retirei meu pedido
            </button>
          )}
        </>
      )}
    </div>
  )
}
