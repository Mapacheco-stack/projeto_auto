# AutoWiki

Aplicação Express + Prisma para consultar problemas automotivos e suas possíveis causas.

## Configuração

1. Instale Node.js LTS e PostgreSQL.
2. Execute `npm install`.
3. Copie `.env.example` para `.env`, preencha `DATABASE_URL` com os dados do seu PostgreSQL e defina um `JWT_SECRET` próprio. Sem `JWT_SECRET`, o login valida a senha mas não consegue emitir o token.
4. Gere o cliente Prisma: `npm run prisma:generate`.
5. Confira se o banco já contém as tabelas descritas em `prisma/schema.prisma`. Se o banco estiver vazio, revise o esquema e crie/aplique uma migration antes de iniciar; não rode migrations em produção sem backup.
6. Inicie com `npm run dev` e abra `http://localhost:3000`.

## Endpoints públicos

- `GET /fabricantes`
- `GET /veiculos` — inclui o fabricante de cada modelo.
- `GET /problemas` — inclui as relações com possíveis causas.
- `GET /causas`

## Endpoints administrativos

### Login de administrador

O acesso administrativo começa em `POST /logadmin`. O campo `admin` corresponde ao
campo `nome` da tabela `admins`; o campo `senha` deve ser enviado em texto simples
no pedido e é comparado com o hash bcrypt guardado na coluna `senha`.

```bash
curl -X POST http://localhost:3200/logadmin \
  -H 'Content-Type: application/json' \
  -d '{"admin":"admin","senha":"SUA_SENHA"}'
```

As rotas de escrita exigem `Authorization: Bearer <token>` obtido em `POST /logadmin`.

O login já está disponível em `GET /admin.html`. O formulário envia `POST /logadmin`, guarda o token em `localStorage` e valida a sessão em `GET /admin/me`. A função `apiAdmin` em `views/admin.js` adiciona automaticamente `Authorization: Bearer <token>` às chamadas protegidas.

Depois do login, o próprio `admin.html` mostra o painel visual de CRUD. Nele é possível criar, listar, editar e excluir fabricantes, veículos, problemas, causas e relações entre problemas e causas, sem usar terminal, curl, Postman ou Insomnia.

- `POST`, `PUT /:id` e `DELETE /:id` para `/fabricantes`, `/veiculos`, `/problemas` e `/causas`.
- `POST /prob_causa` com `problema_id`, `causa_possivel_id` e, opcionalmente, `ordem_exibicao`.
- `PUT` e `DELETE /prob_causa/:problemaId/:causaId` para editar ou remover a relação composta.

A home é informativa: a escolha do modelo contextualiza a consulta, mas o esquema atual não relaciona um problema a um modelo específico. As possíveis causas vêm da relação `problemas_causas`.
