# Cantina SENAI

Sistema de pedidos da cantina. O estudante escolhe os produtos, confirma o pedido e acompanha o andamento. A atendente recebe os pedidos, atualiza o status e pode marcar produtos como esgotados.

Nesta versão, o site usa o Supabase para guardar os dados na nuvem. Assim, os pedidos feitos em um celular também aparecem no painel aberto em outro dispositivo.

## O que precisa estar instalado

- Node.js e npm
- VS Code (ou outro editor)
- Uma conta no Supabase

## 1. Preparar o banco no Supabase

1. Abra o projeto `cantina-senai` no Supabase.
2. Entre em **SQL Editor**.
3. Clique em **New query**.
4. Abra o arquivo `supabase/schema.sql` deste projeto.
5. Copie todo o conteúdo, cole no editor SQL e clique em **Run**.
6. Confira se as tabelas `itens`, `pedidos` e `pedido_itens` foram criadas.

O script também cadastra os produtos iniciais do cardápio e configura as políticas de acesso usadas nesta demonstração.

## 2. Configurar o site

O arquivo `frontend/.env.local` guarda o endereço e a chave pública do projeto Supabase para os testes no computador. Se precisar configurar manualmente, crie esse arquivo dentro da pasta `frontend` com este formato:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publishable
```

Use a Project URL e a Publishable key exibidas no painel do Supabase. Não coloque uma Secret key ou service_role no frontend.

## 3. Rodar localmente

Abra um terminal na pasta `frontend` e execute:

```powershell
npm install
npm run dev
```

Abra o endereço informado pelo Vite, normalmente `http://localhost:5173`.

Não é necessário iniciar o backend Java nem o MySQL local para esta versão conectada ao Supabase.

## 4. Publicar na Vercel

1. Envie o projeto para um repositório no GitHub.
2. Na Vercel, importe esse repositório.
3. Configure **Root Directory** como `frontend`.
4. Use o preset **Vite**, o comando `npm run build` e a pasta de saída `dist`.
5. Em **Environment Variables**, adicione:
   - `VITE_SUPABASE_URL` com a Project URL.
   - `VITE_SUPABASE_ANON_KEY` com a Publishable key.
6. Faça o deploy.

Depois de adicionar ou alterar variáveis, faça um novo deploy para que elas sejam aplicadas.

## 5. Entrar e testar

- **Cliente:** acesso aberto, sem cadastro. Informe seu nome ao confirmar o pedido.
- **Atendente:** escolha a opção de atendente e informe a senha de demonstração `atm123`.

Para testar a comunicação entre dispositivos, abra o link publicado em um celular e faça um pedido. Em outro dispositivo, entre como atendente. O pedido deve aparecer no painel e as mudanças de status devem ser refletidas na tela do cliente.

## Observação sobre segurança

Esta é uma versão acadêmica de demonstração. A senha `atm123` é verificada no próprio navegador e não representa autenticação segura. As políticas do banco permitem que visitantes anônimos consultem os pedidos e executem as operações necessárias para a apresentação. Não use esta configuração para dados reais ou para uma cantina em produção sem implementar autenticação e regras de acesso mais restritas.

## Heurísticas de Nielsen presentes no sistema

1. **Visibilidade do estado:** o carrinho mostra quantidades e total; os pedidos exibem o status e o andamento.
2. **Correspondência com o mundo real:** os textos usam termos comuns da cantina, como lanches, balcão, preparo e retirada.
3. **Controle e liberdade:** é possível voltar, sair, desfazer a remoção de um item e cancelar um pedido enquanto ele ainda está recebido.
4. **Consistência:** cabeçalho, botões, cores e etiquetas seguem o mesmo padrão nas telas.
5. **Prevenção de erros:** produtos esgotados não entram no carrinho, o nome é obrigatório e ações que não podem ser feitas ficam desabilitadas.
6. **Reconhecimento em vez de memorização:** produtos, preços, quantidades, total e status ficam visíveis durante o uso.
7. **Flexibilidade e eficiência:** as categorias, os contadores de quantidade e os filtros ajudam a encontrar e alterar informações rapidamente.
8. **Design minimalista:** as telas mostram o que é necessário para fazer e acompanhar um pedido.
9. **Ajuda para reconhecer e corrigir erros:** as mensagens explicam o que aconteceu e indicam como continuar.
10. **Ajuda e documentação:** o botão de ajuda apresenta instruções para o cliente e para a atendente.
