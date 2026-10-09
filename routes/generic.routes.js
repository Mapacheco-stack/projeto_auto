import { Router } from 'express'

import * as controller from '../controllers/generic.controller.js'
import { autenticar } from '../controllers/auth.controller.js'

const router = Router()


//lista pública de problemas nos veículos e modelos de veículos
router.get ('/problemas','problemas/:id', controller.listar)
router.get ('/causas', 'causas/:id', controller.listar)
router.get ('/veiculos', 'veiculos/:id', controller.listar)

//rotas de acesso restrito aos admins (editar os problemas e suas possíveis causas)
router.post('/problemas', autenticar, controller.criar)
router.put('/problemas/:id', autenticar, controller.atualizar)
router.delete('/problemas/:id', autenticar, controller.remover)

router.post('/causas', autenticar, controller.criar)
router.put('/causas/:id', autenticar, controller.atualizar)
router.delete('/causas/:id', autenticar, controller.remover)

//rota de edição das relações entre os problemas por meio do id (tabela problemas_causas dentro do banco de dados) acessível somente ao admin

router.get('/prob_causa', 'prob_causa/:id', controller.listar)
router.put('prob_causa/:id', controller.atualizar)
router.post('/prob_causa', controller.criar)
router.delete('prob_causa/:id', controller.remover)


export default router