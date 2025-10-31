import { Router } from 'express';
import {
  // Equipamentos
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  // Componentes
  getAllComponents,
  getComponentById,
  createComponent,
  updateComponent,
  deleteComponent,
  // Planos
  getAllMaintenancePlans,
  getMaintenancePlanById,
  createMaintenancePlan,
  updateMaintenancePlan,
  deleteMaintenancePlan,
  // Ordens de Serviço
  getAllWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  // Fornecedores
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../controllers/maintenance-module.controller';
import { authenticate } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';
import { UserRole } from '../types';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// ============================================
// EQUIPAMENTOS
// ============================================
router.get('/equipment', checkRole([UserRole.ADMIN, UserRole.SUPERVISOR]), getAllEquipment);
router.get('/equipment/:id', checkRole([UserRole.ADMIN, UserRole.SUPERVISOR]), getEquipmentById);
router.post('/equipment', checkRole([UserRole.ADMIN]), createEquipment);
router.put('/equipment/:id', checkRole([UserRole.ADMIN]), updateEquipment);
router.delete('/equipment/:id', checkRole([UserRole.ADMIN]), deleteEquipment);

// ============================================
// COMPONENTES
// ============================================
router.get('/components', checkRole([UserRole.ADMIN, UserRole.SUPERVISOR]), getAllComponents);
router.get('/components/:id', checkRole([UserRole.ADMIN, UserRole.SUPERVISOR]), getComponentById);
router.post('/components', checkRole([UserRole.ADMIN]), createComponent);
router.put('/components/:id', checkRole([UserRole.ADMIN]), updateComponent);
router.delete('/components/:id', checkRole([UserRole.ADMIN]), deleteComponent);

// ============================================
// PLANOS DE MANUTENÇÃO
// ============================================
router.get('/plans', checkRole([UserRole.ADMIN, UserRole.SUPERVISOR]), getAllMaintenancePlans);
router.get('/plans/:id', checkRole([UserRole.ADMIN, UserRole.SUPERVISOR]), getMaintenancePlanById);
router.post('/plans', checkRole([UserRole.ADMIN]), createMaintenancePlan);
router.put('/plans/:id', checkRole([UserRole.ADMIN]), updateMaintenancePlan);
router.delete('/plans/:id', checkRole([UserRole.ADMIN]), deleteMaintenancePlan);

// ============================================
// ORDENS DE SERVIÇO
// ============================================
router.get('/work-orders', checkRole([UserRole.ADMIN, UserRole.SUPERVISOR]), getAllWorkOrders);
router.get('/work-orders/:id', checkRole([UserRole.ADMIN, UserRole.SUPERVISOR]), getWorkOrderById);
router.post('/work-orders', checkRole([UserRole.ADMIN, UserRole.SUPERVISOR]), createWorkOrder);
router.put('/work-orders/:id', checkRole([UserRole.ADMIN, UserRole.SUPERVISOR]), updateWorkOrder);
router.delete('/work-orders/:id', checkRole([UserRole.ADMIN]), deleteWorkOrder);

// ============================================
// FORNECEDORES
// ============================================
router.get('/suppliers', checkRole([UserRole.ADMIN, UserRole.SUPERVISOR]), getAllSuppliers);
router.get('/suppliers/:id', checkRole([UserRole.ADMIN, UserRole.SUPERVISOR]), getSupplierById);
router.post('/suppliers', checkRole([UserRole.ADMIN]), createSupplier);
router.put('/suppliers/:id', checkRole([UserRole.ADMIN]), updateSupplier);
router.delete('/suppliers/:id', checkRole([UserRole.ADMIN]), deleteSupplier);

export default router;

