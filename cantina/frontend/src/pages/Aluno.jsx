import { useEffect, useRef, useState } from 'react'
import { api, dinheiro, numero } from '../api'
import Cabecalho from '../components/Cabecalho'
import Toast from '../components/Toast'
import Modal from '../components/Modal'
import ItemCard from '../components/ItemCard'
import AcompanharPedido from '../components/AcompanharPedido'

const categorias = [
  ['lanches', 'Lanches'],
  ['bebidas', 'Bebidas'],
  ['doces', 'Doces'],
]

const titulos = { cardapio: 'Cantina', carrinho: 'Meu Pedido', pedidos: 'Acompanhar pedido' }

export default function Aluno({ aoSair }) {
  const [tela, setTela] = useState('cardapio')
  const [categoria, setCategoria] = useState('lanches')
  const [cardapio, setCardapio] = useState([])
  const [carrinho, setCarrinho] = useState({})
  const [pedidos, setPedidos] = useState([])
  const [minhas, setMinhas] = useState(() => JSON.parse(localStorage.getItem('minhas') || '[]'))
  const [nome, setNome] = useState(localStorage.getItem('nome') || '')
  const [erroNome, setErroNome] = useState('')
  const [aviso, setAviso] = useState(null)
  const [modal, setModal] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const statusAnterior = useRef({})

  const avisar = (texto, tipo = '', desfazer = null) => setAviso({ texto, tipo, desfazer })

  async function atualizar() {
    try {
      setCardapio(await api.cardapio())
      if (!minhas.length) return
      const lista = await api.pedidos(minhas)
      lista.forEach((pedido) => {
        const antes = statusAnterior.current[pedido.id]
        if (antes && antes !== pedido.status) {
          const texto =
            pedido.status === 'pronto'
              ? `Pedido #${numero(pedido.id)} pronto. Por favor buscar no balcão.`
              : `Pedido #${numero(pedido.id)}: ${pedido.status}.`
          avisar(texto, pedido.status === 'cancelado' ? '' : 'ok')
        }
        statusAnterior.current[pedido.id] = pedido.status
      })
      setPedidos(lista)
    } catch {
      return
    }
  }

  useEffect(() => {
    atualizar()
    const intervalo = setInterval(atualizar, 2500)
    return () => clearInterval(intervalo)
  }, [minhas])

  function mudar(item, delta) {
    const quantidade = (carrinho[item.id] || 0) + delta
    if (quantidade > 10) {
      avisar('Máximo de 10 unidades por item.', 'err')
      return
    }
    const novo = { ...carrinho }
    if (quantidade <= 0) {
      delete novo[item.id]
      avisar(`${item.nome} removido do pedido.`, '', () => setCarrinho((atual) => ({ ...atual, [item.id]: 1 })))
    } else {
      novo[item.id] = quantidade
      if (delta > 0 && quantidade === 1) avisar(`${item.nome} adicionado ao pedido.`, 'ok')
    }
    setCarrinho(novo)
  }

  const linhas = Object.entries(carrinho)
    .map(([id, quantidade]) => ({ item: cardapio.find((i) => i.id === Number(id)), quantidade }))
    .filter((linha) => linha.item)
  const total = linhas.reduce((soma, linha) => soma + linha.item.preco * linha.quantidade, 0)
  const totalItens = linhas.reduce((soma, linha) => soma + linha.quantidade, 0)

  async function confirmar() {
    if (!nome.trim()) {
      setErroNome('Digite seu nome para confirmar o pedido.')
      return
    }
    setEnviando(true)
    try {
      const pedido = await api.criarPedido(
        nome,
        linhas.map((linha) => ({ itemId: linha.item.id, quantidade: linha.quantidade }))
      )
      const novas = [pedido.id, ...minhas].slice(0, 20)
      localStorage.setItem('minhas', JSON.stringify(novas))
      localStorage.setItem('nome', nome.trim())
      statusAnterior.current[pedido.id] = pedido.status
      setMinhas(novas)
      setPedidos([pedido, ...pedidos])
      setCarrinho({})
      setTela('pedidos')
      avisar(`Pedido #${numero(pedido.id)} enviado com sucesso!`, 'ok')
    } catch (e) {
      avisar(e.message, 'err')
    }
    setEnviando(false)
  }

  async function executar(funcao, id, mensagem) {
    try {
      await funcao(id)
      if (mensagem) avisar(mensagem, 'ok')
    } catch (e) {
      avisar(e.message, 'err')
    }
    atualizar()
  }

  const emAndamento = pedidos.filter((p) => ['recebido', 'em preparo', 'pronto'].includes(p.status))

  let conteudo
  let rodape

  if (tela === 'cardapio') {
    conteudo = (
      <>
        {emAndamento.map((pedido) => (
          <button key={pedido.id} className="banner" onClick={() => setTela('pedidos')}>
            Pedido #{numero(pedido.id)} em andamento ({pedido.status}). Toque para acompanhar.
          </button>
        ))}
        <div className="tabs" role="tablist">
          {categorias.map(([chave, rotulo]) => (
            <button key={chave} className="tab" role="tab" aria-selected={categoria === chave} onClick={() => setCategoria(chave)}>
              {rotulo}
            </button>
          ))}
        </div>
        {cardapio
          .filter((item) => item.categoria === categoria)
          .map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              quantidade={carrinho[item.id] || 0}
              mudar={mudar}
              avisarEsgotado={(i) => avisar(`${i.nome} esgotou hoje. Escolha outro item.`, 'err')}
            />
          ))}
      </>
    )
    rodape = totalItens ? (
      <button className="btn pri" onClick={() => setTela('carrinho')}>
        Ver Pedido – {dinheiro(total)} ({totalItens} {totalItens > 1 ? 'itens' : 'item'})
      </button>
    ) : (
      <button className="btn pri" disabled>
        Adicione um item para continuar
      </button>
    )
  } else if (tela === 'carrinho') {
    conteudo = linhas.length ? (
      <>
        {linhas.map(({ item, quantidade }) => (
          <ItemCard key={item.id} item={item} quantidade={quantidade} mudar={mudar} avisarEsgotado={() => {}} />
        ))}
        <label htmlFor="nome">Seu nome</label>
        <input
          type="text"
          id="nome"
          maxLength={30}
          placeholder="Ex.: Maria"
          value={nome}
          onChange={(e) => {
            setNome(e.target.value)
            setErroNome('')
          }}
        />
        {erroNome && (
          <p className="err" role="alert">
            {erroNome}
          </p>
        )}
      </>
    ) : (
      <div className="empty">
        <div>🛒</div>
        <p>Seu pedido está vazio.</p>
      </div>
    )
    rodape = linhas.length ? (
      <>
        <div className="total">
          <span>Total</span>
          <span>{dinheiro(total)}</span>
        </div>
        <button className="btn pri" onClick={confirmar}>
          Confirmar Pedido
        </button>
        <button className="btn sec" onClick={() => setTela('cardapio')}>
          Voltar para a cantina
        </button>
        <p className="note">Pagamento na retirada, no balcão.</p>
      </>
    ) : (
      <button className="btn pri" onClick={() => setTela('cardapio')}>
        Ver cardápio
      </button>
    )
  } else {
    conteudo = pedidos.length ? (
      pedidos.map((pedido) => (
        <AcompanharPedido
          key={pedido.id}
          pedido={pedido}
          cancelar={(id) => setModal({ tipo: 'cancelar', id })}
          retirar={(id) => executar(api.retirar, id, 'Bom apetite! Pedido retirado.')}
        />
      ))
    ) : (
      <div className="empty">
        <div>🍽️</div>
        <p>Você ainda não fez nenhum pedido.</p>
      </div>
    )
    rodape = (
      <button className="btn sec" onClick={() => setTela('cardapio')}>
        Voltar para a cantina
      </button>
    )
  }

  return (
    <div className="app">
      <Cabecalho
        aoSair={aoSair}
        titulo={titulos[tela]}
        voltar={tela === 'cardapio' ? null : () => setTela('cardapio')}
        aoPedirAjuda={() => setModal({ tipo: 'ajuda' })}
      />
      <main>{conteudo}</main>
      <footer>{rodape}</footer>
      <Toast aviso={aviso} fechar={() => setAviso(null)} />

      {enviando && (
        <Modal titulo="Enviando pedido…">
          <p>Aguarde um instante.</p>
        </Modal>
      )}
      {modal?.tipo === 'cancelar' && (
        <Modal titulo={`Cancelar o pedido N° ${numero(modal.id)}?`}>
          <p>Esta ação não pode ser desfeita.</p>
          <button
            className="btn dng"
            onClick={() => {
              const id = modal.id
              setModal(null)
              executar(api.cancelar, id)
            }}
          >
            Sim, cancelar
          </button>
          <button className="btn pri" onClick={() => setModal(null)}>
            Não, manter
          </button>
        </Modal>
      )}
      {modal?.tipo === 'ajuda' && (
        <Modal titulo="Como fazer um pedido">
          <ol>
            <li>Escolha os itens na cantina.</li>
            <li>Informe seu nome e confirme.</li>
            <li>Acompanhe o status e retire no balcão.</li>
          </ol>
          <button className="btn pri" onClick={() => setModal(null)}>
            Entendi
          </button>
        </Modal>
      )}
    </div>
  )
}
