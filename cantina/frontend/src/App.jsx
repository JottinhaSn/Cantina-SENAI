import { useEffect, useState } from 'react'
import Aluno from './pages/Aluno'
import Atendente from './pages/Atendente'
import Login from './pages/Login'

export default function App() {
  const [acesso, setAcesso] = useState(() => sessionStorage.getItem('cantina-acesso') || '')
  const ehAtendente = window.location.pathname.startsWith('/atendente')

  useEffect(() => {
    if (ehAtendente && acesso !== 'atendente') {
      window.history.replaceState({}, '', '/')
    }
  }, [ehAtendente, acesso])

  function entrar(tipo) {
    sessionStorage.setItem('cantina-acesso', tipo)
    setAcesso(tipo)
    if (tipo === 'atendente') window.history.pushState({}, '', '/atendente')
    else window.history.replaceState({}, '', '/')
  }

  function sair() {
    sessionStorage.removeItem('cantina-acesso')
    setAcesso('')
    window.history.replaceState({}, '', '/')
  }

  if (!acesso || (ehAtendente && acesso !== 'atendente')) {
    return <Login aoEntrar={entrar} />
  }

  if (ehAtendente && acesso === 'atendente') return <Atendente aoSair={sair} />
  return <Aluno aoSair={sair} />
}
