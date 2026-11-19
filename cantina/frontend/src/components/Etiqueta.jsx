const ordem = ['recebido', 'em preparo', 'pronto', 'retirado']

export default function Etiqueta({ status }) {
  const posicao = ordem.indexOf(status)
  return <span className={`badge ${posicao < 0 ? 'sx' : 's' + posicao}`}>{status}</span>
}
