import { useEffect } from 'react'

export default function Toast({ aviso, fechar }) {
  useEffect(() => {
    if (!aviso) return
    const espera = setTimeout(fechar, 3800)
    return () => clearTimeout(espera)
  }, [aviso])

  if (!aviso) return null

  return (
    <div className={`toast ${aviso.tipo}`} role="status">
      {aviso.texto}{' '}
      {aviso.desfazer && (
        <button
          onClick={() => {
            aviso.desfazer()
            fechar()
          }}
          style={{ background: 'none', border: 0, color: 'inherit', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' }}
        >
          Desfazer
        </button>
      )}
    </div>
  )
}
