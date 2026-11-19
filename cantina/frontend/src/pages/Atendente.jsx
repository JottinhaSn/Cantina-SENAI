import { useEffect, useRef, useState } from 'react'
import { api, dinheiro, hora, numero } from '../api'
import Cabecalho from '../components/Cabecalho'
import Toast from '../components/Toast'
import Modal from '../components/Modal'
import Etiqueta from '../components/Etiqueta'

const filtros = [
  ['todos', 'Todos'],
  ['recebido', 'Novos'],
  ['em preparo', 'Em preparo'],
  ['pronto', 'Prontos'],
]

const proximo = {
  recebido: 'Iniciar preparo',
  'em preparo': 'Marcar como pronto',
  pronto: 'Marcar como retirado',
}

const seguinte = { recebido: 'em preparo', 'em preparo': 'pronto', pronto: 'retirado' }

export default function Atendente({ aoSair }) {
  const [pedidos, setPedidos] = useState([])
  const [cardapio, setCardapio] = useState([])
  const [aba, setAba] = useState('pedidos')
  const [filtro, setFiltro] = useState('todos')
  const [detalhe, setDetalhe] = useState(null)
  const [aviso, setAviso] = useState(null)
  const [ajuda, setAjuda] = useState(false)
  const conhecidos = useRef(null)

  const avisar = (texto, tipo = '') => setAviso({ texto, tipo, desfazer: null })

  async function atualizar() {
    try {
      const [listaPedidos, listaCardapio] = await Promise.all([api.pedidos(), api.cardapio()])
      if (conhecidos.current) {
        listaPedidos
          .filter((p) => !conhecidos.current.has(p.id))
          .forEach((p) => avisar(`Novo pedido #${numero(p.id)} – ${p.nomeCliente}`, 'ok'))
      }
      conhecidos.current = new Set(listaPedidos.map((p) => p.id))
      setPedidos(listaPedidos)
      setCardapio(listaCardapio)
    } catch {
      return
    }
  }

  useEffect(() => {
    atualizar()
    const intervalo = setInterval(atualizar, 2000)
    return () => clearInterval(intervalo)
  }, [])

  async function avancar(pedido) {
    try {
      await api.avancar(pedido.id)
      avisar(`Pedido #${numero(pedido.id)} atualizado para ${seguinte[pedido.status]}.`, 'ok')
    } catch (e) {
      avisar(e.message, 'err')
    }
    atualizar()
  }

  async function alternarEsgotado(item) {
    try {
      await api.esgotado(item.id, !item.esgotado)
      avisar(item.esgotado ? 'Item disponível de novo.' : 'Item marcado como esgotado.', 'ok')
    } catch (e) {
      avisar(e.message, 'err')
    }
    atualizar()
  }

  const pedidoAberto = pedidos.find((p) => p.id === detalhe)
  const lista = pedidos.filter((p) => filtro === 'todos' || p.status === filtro)

  let titulo = aba === 'pedidos' ? 'Pedidos' : 'Cardápio'
  if (pedidoAberto) titulo = 'Detalhes do pedido'

  let conteudo
  if (pedidoAberto) {
    conteudo = (
      <>
        <div className="card blk">
          <div className="row">
            <b>
              #{numero(pedidoAberto.id)} – {pedidoAberto.nomeCliente}
            </b>
            <Etiqueta status={pedidoAberto.status} />
          </div>
          {pedidoAberto.itens.map((linha) => (
            <p key={linha.id} className="pr" style={{ margin: '6px 0 0' }}>
              {linha.quantidade} × {linha.item.nome} – {dinheiro(linha.quantidade * linha.precoUnitario)}
            </p>
          ))}
          <p className="pr" style={{ margin: '6px 0 0' }}>
            Feito às {hora(pedidoAberto.criadoEm)}
          </p>
        </div>
        <div className="total">
          <span>Total</span>
          <span>{dinheiro(pedidoAberto.total)}</span>
        </div>
        {proximo[pedidoAberto.status] ? (
          <button className="btn pri" style={{ marginTop: 14 }} onClick={() => avancar(pedidoAberto)}>
            {proximo[pedidoAberto.status]}
          </button>
        ) : (
          <p className="note" style={{ marginTop: 14 }}>
            {pedidoAberto.status === 'cancelado' ? 'Pedido cancelado pelo aluno.' : 'Pedido já entregue.'}
          </p>
        )}
        <button className="btn sec" style={{ marginTop: 10 }} onClick={() => setDetalhe(null)}>
          ← Voltar para a lista
        </button>
      </>
    )
  } else if (aba === 'pedidos') {
    conteudo = (
      <>
        <div className="tabs" role="tablist">
          {filtros.map(([chave, rotulo]) => (
            <button key={chave} className="tab" role="tab" aria-selected={filtro === chave} onClick={() => setFiltro(chave)}>
              {rotulo}
            </button>
          ))}
        </div>
        {lista.length ? (
          lista.map((pedido) => (
            <div key={pedido.id} className="card ord blk">
              <div className="row">
                <b>
                  #{numero(pedido.id)} – {pedido.nomeCliente}
                </b>
                <Etiqueta status={pedido.status} />
              </div>
              <div className="row" style={{ marginTop: 6 }}>
                <span className="pr">
                  {pedido.itens.map((l) => `${l.quantidade} ${l.item.nome}`).join(', ')} · {hora(pedido.criadoEm)}
                </span>
                <button className="btn sec" onClick={() => setDetalhe(pedido.id)}>
                  Ver Detalhes
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty">
            <div>📋</div>
            <p>
              {pedidos.length
                ? 'Nenhum pedido nesta categoria.'
                : 'Nenhum pedido ainda. Os pedidos feitos pelos estudantes aparecem aqui.'}
            </p>
          </div>
        )}
      </>
    )
  } else {
    conteudo = cardapio.map((item) => (
      <div key={item.id} className="card">
        <div className="img" aria-hidden="true">
          {item.emoji}
        </div>
        <div className="info">
          <div className="nm">{item.nome}</div>
          <div className="pr">
            {dinheiro(item.preco)} · {item.esgotado ? 'Esgotado' : 'Disponível'}
          </div>
        </div>
        <button
          className={item.esgotado ? 'btn pri' : 'btn dng'}
          style={{ width: 'auto', padding: '0 14px', minHeight: 40, fontSize: 14 }}
          onClick={() => alternarEsgotado(item)}
        >
          {item.esgotado ? 'Voltar ao estoque' : 'Marcar esgotado'}
        </button>
      </div>
    ))
  }

  return (
    <div className="app wide">
      <Cabecalho aoSair={aoSair} titulo={titulo} voltar={pedidoAberto ? () => setDetalhe(null) : null} aoPedirAjuda={() => setAjuda(true)} />
      <main>
        {!pedidoAberto && (
          <div className="tabs" role="tablist">
            {[
              ['pedidos', 'Pedidos'],
              ['cardapio', 'Cardápio'],
            ].map(([chave, rotulo]) => (
              <button key={chave} className="tab" role="tab" aria-selected={aba === chave} onClick={() => setAba(chave)}>
                {rotulo}
              </button>
            ))}
          </div>
        )}
        {conteudo}
      </main>
      <Toast aviso={aviso} fechar={() => setAviso(null)} />
      {ajuda && (
        <Modal titulo="Como atender">
          <ol>
            <li>Veja os pedidos novos na lista.</li>
            <li>Toque em Ver Detalhes.</li>
            <li>Atualize o status até o pedido ficar pronto e entregue.</li>
            <li>Na aba Cardápio, marque o que esgotou.</li>
          </ol>
          <button className="btn pri" onClick={() => setAjuda(false)}>
            Entendi
          </button>
        </Modal>
      )}
    </div>
  )
}
