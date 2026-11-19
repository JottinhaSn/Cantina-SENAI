import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const chave = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !chave) {
  throw new Error('Configure a URL e a chave do Supabase no arquivo frontend/.env.local.')
}

const supabase = createClient(url, chave)

function formatarItem(item) {
  return {
    id: item.id,
    nome: item.nome,
    preco: Number(item.preco),
    emoji: item.emoji,
    categoria: item.categoria,
    esgotado: item.esgotado,
  }
}

function formatarPedido(pedido) {
  return {
    id: pedido.id,
    nomeCliente: pedido.nome_cliente,
    status: pedido.status,
    total: Number(pedido.total),
    criadoEm: pedido.criado_em,
    itens: (pedido.pedido_itens || []).map((linha) => ({
      id: linha.id,
      item: formatarItem(linha.itens),
      quantidade: linha.quantidade,
      precoUnitario: Number(linha.preco_unitario),
    })),
  }
}

async function verificar(resultado) {
  if (resultado.error) throw new Error(resultado.error.message || 'Não foi possível concluir a operação.')
  return resultado.data
}

async function buscarPedidos(ids) {
  let consulta = supabase
    .from('pedidos')
    .select('*, pedido_itens(*, itens(*))')
    .order('id', { ascending: false })

  if (ids?.length) consulta = consulta.in('id', ids)
  const dados = await verificar(await consulta)
  return dados.map(formatarPedido)
}

export const api = {
  async cardapio() {
    const dados = await verificar(
      await supabase.from('itens').select('*').order('id', { ascending: true })
    )
    return dados.map(formatarItem)
  },

  pedidos(ids) {
    return buscarPedidos(ids)
  },

  async criarPedido(nome, linhas) {
    const nomeCliente = nome.trim().slice(0, 30)
    if (!nomeCliente) throw new Error('Digite seu nome para confirmar o pedido.')
    if (!linhas?.length) throw new Error('Seu pedido está vazio. Escolha ao menos um item.')

    const cardapio = await api.cardapio()
    let total = 0
    const itensPedido = linhas.map((linha) => {
      const item = cardapio.find((produto) => produto.id === linha.itemId)
      if (!item || linha.quantidade < 1 || linha.quantidade > 10) {
        throw new Error('Item ou quantidade inválida.')
      }
      if (item.esgotado) throw new Error(`${item.nome} esgotou hoje. Escolha outro item.`)
      total += item.preco * linha.quantidade
      return {
        item_id: item.id,
        quantidade: linha.quantidade,
        preco_unitario: item.preco,
      }
    })

    const pedido = await verificar(
      await supabase
        .from('pedidos')
        .insert({ nome_cliente: nomeCliente, status: 'recebido', total })
        .select()
        .single()
    )

    const linhasComPedido = itensPedido.map((linha) => ({ ...linha, pedido_id: pedido.id }))
    const insercao = await supabase.from('pedido_itens').insert(linhasComPedido)

    if (insercao.error) {
      await supabase.from('pedidos').delete().eq('id', pedido.id)
      throw new Error(insercao.error.message || 'Não foi possível registrar os itens do pedido.')
    }

    const lista = await buscarPedidos([pedido.id])
    return lista[0]
  },

  async avancar(id) {
    const pedido = (await buscarPedidos([id]))[0]
    if (!pedido) throw new Error('Pedido não encontrado.')
    const fluxo = ['recebido', 'em preparo', 'pronto', 'retirado']
    const posicao = fluxo.indexOf(pedido.status)
    if (posicao < 0 || posicao >= fluxo.length - 1) throw new Error('Este pedido não pode mais avançar.')
    await verificar(
      await supabase.from('pedidos').update({ status: fluxo[posicao + 1] }).eq('id', id)
    )
    return (await buscarPedidos([id]))[0]
  },

  async cancelar(id) {
    const pedido = (await buscarPedidos([id]))[0]
    if (!pedido) throw new Error('Pedido não encontrado.')
    if (pedido.status !== 'recebido') {
      throw new Error('Seu pedido já está sendo preparado e não pode mais ser cancelado.')
    }
    await verificar(await supabase.from('pedidos').update({ status: 'cancelado' }).eq('id', id))
    return (await buscarPedidos([id]))[0]
  },

  async retirar(id) {
    const pedido = (await buscarPedidos([id]))[0]
    if (!pedido || pedido.status !== 'pronto') throw new Error('O pedido ainda não está pronto.')
    await verificar(await supabase.from('pedidos').update({ status: 'retirado' }).eq('id', id))
    return (await buscarPedidos([id]))[0]
  },

  async esgotado(id, esgotado) {
    const dados = await verificar(
      await supabase.from('itens').update({ esgotado }).eq('id', id).select().single()
    )
    return formatarItem(dados)
  },
}

export const numero = (id) => String(id).padStart(4, '0')

export const dinheiro = (valor) => 'R$ ' + Number(valor).toFixed(2).replace('.', ',')

export const hora = (data) =>
  new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
