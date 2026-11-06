
import { Router } from 'express'

import * as controller from '../controllers/generic.controller.js'
import { autenticar } from '../controllers/auth.controller.js'

const router = Router()

// ======================================
// CONSULTAS PÚBLICAS
// ======================================

// Problemas
router.get('/problemas', controller.listar)
router.get('/problemas/:id', controller.listar)

// Causas possíveis
router.get('/causas', controller.listar)
router.get('/causas/:id', controller.listar)

// Modelos de veículos
router.get('/veiculos', controller.listar)
router.get('/veiculos/:id', controller.listar)

// Fabricantes
router.get('/fabricantes', controller.listar)
router.get('/fabricantes/:id', controller.listar)

// Relações entre problemas e causas
router.get('/prob_causa', controller.listar)

router.get(
  '/prob_causa/:problema_id/:causa_possivel_id',
  controller.listar
)


// ======================================
// OPERAÇÕES RESTRITAS A ADMINISTRADORES
// ======================================

// Problemas
router.post('/problemas', autenticar, controller.criar)
router.put('/problemas/:id', autenticar, controller.atualizar)
router.delete('/problemas/:id', autenticar, controller.remover)

// Causas possíveis
router.post('/causas', autenticar, controller.criar)
router.put('/causas/:id', autenticar, controller.atualizar)
router.delete('/causas/:id', autenticar, controller.remover)

// Modelos de veículos
router.post('/veiculos', autenticar, controller.criar)
router.put('/veiculos/:id', autenticar, controller.atualizar)
router.delete('/veiculos/:id', autenticar, controller.remover)

// Fabricantes
router.post('/fabricantes', autenticar, controller.criar)
router.put('/fabricantes/:id', autenticar, controller.atualizar)
router.delete('/fabricantes/:id', autenticar, controller.remover)

// Relações entre problemas e causas
router.post('/prob_causa', autenticar, controller.criar)

router.put(
  '/prob_causa/:problema_id/:causa_possivel_id',
  autenticar,
  controller.atualizar
)

router.delete(
  '/prob_causa/:problema_id/:causa_possivel_id',
  autenticar,
  controller.remover
)

export default router
