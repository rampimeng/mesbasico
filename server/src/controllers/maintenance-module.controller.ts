import { Request, Response } from 'express';
import supabase from '../config/supabase';
import { sendSuccess, sendError } from '../utils/response';

// ============================================
// EQUIPAMENTOS
// ============================================

export const getAllEquipment = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;

    const { data, error } = await supabase
      .from('maintenance_equipment')
      .select(`
        *,
        machine:machines(id, name, code),
        responsible:users!MaintenanceEquipmentResponsible(id, name, email)
      `)
      .eq('companyId', companyId)
      .order('createdAt', { ascending: false });

    if (error) {
      return sendError(res, error.message, 500);
    }

    return sendSuccess(res, data);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch equipment', 500);
  }
};

export const getEquipmentById = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('maintenance_equipment')
      .select(`
        *,
        machine:machines(id, name, code),
        responsible:users!MaintenanceEquipmentResponsible(id, name, email),
        maintenancePlans:maintenance_plans(id, name, type, active),
        workOrders:work_orders(id, workOrderNumber, type, status, openedDate)
      `)
      .eq('id', id)
      .eq('companyId', companyId)
      .single();

    if (error) {
      return sendError(res, 'Equipment not found', 404);
    }

    return sendSuccess(res, data);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch equipment', 500);
  }
};

export const createEquipment = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const equipmentData = req.body;

    // Verificar se o código já existe
    const { data: existing } = await supabase
      .from('maintenance_equipment')
      .select('id')
      .eq('companyId', companyId)
      .eq('code', equipmentData.code)
      .single();

    if (existing) {
      return sendError(res, 'Equipment code already exists', 400);
    }

    const { data, error } = await supabase
      .from('maintenance_equipment')
      .insert({
        ...equipmentData,
        companyId,
      })
      .select()
      .single();

    if (error) {
      return sendError(res, error.message, 400);
    }

    return sendSuccess(res, data, 'Equipment created successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create equipment', 500);
  }
};

export const updateEquipment = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { id } = req.params;
    const equipmentData = req.body;

    // Verificar se o equipamento existe
    const { data: existing } = await supabase
      .from('maintenance_equipment')
      .select('id')
      .eq('id', id)
      .eq('companyId', companyId)
      .single();

    if (!existing) {
      return sendError(res, 'Equipment not found', 404);
    }

    // Se estiver mudando o código, verificar se não existe outro com o mesmo código
    if (equipmentData.code) {
      const { data: duplicate } = await supabase
        .from('maintenance_equipment')
        .select('id')
        .eq('companyId', companyId)
        .eq('code', equipmentData.code)
        .neq('id', id)
        .single();

      if (duplicate) {
        return sendError(res, 'Equipment code already exists', 400);
      }
    }

    const { data, error } = await supabase
      .from('maintenance_equipment')
      .update({
        ...equipmentData,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return sendError(res, error.message, 400);
    }

    return sendSuccess(res, data, 'Equipment updated successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update equipment', 500);
  }
};

export const deleteEquipment = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { id } = req.params;

    // Verificar se o equipamento existe
    const { data: existing } = await supabase
      .from('maintenance_equipment')
      .select('id')
      .eq('id', id)
      .eq('companyId', companyId)
      .single();

    if (!existing) {
      return sendError(res, 'Equipment not found', 404);
    }

    const { error } = await supabase
      .from('maintenance_equipment')
      .delete()
      .eq('id', id);

    if (error) {
      return sendError(res, error.message, 400);
    }

    return sendSuccess(res, null, 'Equipment deleted successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to delete equipment', 500);
  }
};

// ============================================
// COMPONENTES
// ============================================

export const getAllComponents = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;

    const { data, error } = await supabase
      .from('maintenance_components')
      .select(`
        *,
        equipment:maintenance_equipment(id, name, code),
        defaultSupplier:suppliers(id, corporateName, tradeName)
      `)
      .eq('companyId', companyId)
      .order('createdAt', { ascending: false });

    if (error) {
      return sendError(res, error.message, 500);
    }

    return sendSuccess(res, data);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch components', 500);
  }
};

export const getComponentById = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('maintenance_components')
      .select(`
        *,
        equipment:maintenance_equipment(id, name, code),
        defaultSupplier:suppliers(id, corporateName, tradeName)
      `)
      .eq('id', id)
      .eq('companyId', companyId)
      .single();

    if (error) {
      return sendError(res, 'Component not found', 404);
    }

    return sendSuccess(res, data);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch component', 500);
  }
};

export const createComponent = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const componentData = req.body;

    // Verificar se o código já existe
    const { data: existing } = await supabase
      .from('maintenance_components')
      .select('id')
      .eq('companyId', companyId)
      .eq('code', componentData.code)
      .single();

    if (existing) {
      return sendError(res, 'Component code already exists', 400);
    }

    const { data, error } = await supabase
      .from('maintenance_components')
      .insert({
        ...componentData,
        companyId,
      })
      .select()
      .single();

    if (error) {
      return sendError(res, error.message, 400);
    }

    return sendSuccess(res, data, 'Component created successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create component', 500);
  }
};

export const updateComponent = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { id } = req.params;
    const componentData = req.body;

    const { data: existing } = await supabase
      .from('maintenance_components')
      .select('id')
      .eq('id', id)
      .eq('companyId', companyId)
      .single();

    if (!existing) {
      return sendError(res, 'Component not found', 404);
    }

    if (componentData.code) {
      const { data: duplicate } = await supabase
        .from('maintenance_components')
        .select('id')
        .eq('companyId', companyId)
        .eq('code', componentData.code)
        .neq('id', id)
        .single();

      if (duplicate) {
        return sendError(res, 'Component code already exists', 400);
      }
    }

    const { data, error } = await supabase
      .from('maintenance_components')
      .update({
        ...componentData,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return sendError(res, error.message, 400);
    }

    return sendSuccess(res, data, 'Component updated successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update component', 500);
  }
};

export const deleteComponent = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { id } = req.params;

    const { data: existing } = await supabase
      .from('maintenance_components')
      .select('id')
      .eq('id', id)
      .eq('companyId', companyId)
      .single();

    if (!existing) {
      return sendError(res, 'Component not found', 404);
    }

    const { error } = await supabase
      .from('maintenance_components')
      .delete()
      .eq('id', id);

    if (error) {
      return sendError(res, error.message, 400);
    }

    return sendSuccess(res, null, 'Component deleted successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to delete component', 500);
  }
};

// ============================================
// PLANOS DE MANUTENÇÃO
// ============================================

export const getAllMaintenancePlans = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;

    const { data, error } = await supabase
      .from('maintenance_plans')
      .select(`
        *,
        equipment:maintenance_equipment(id, name, code),
        responsible:users!MaintenancePlanResponsible(id, name, email)
      `)
      .eq('companyId', companyId)
      .order('createdAt', { ascending: false });

    if (error) {
      return sendError(res, error.message, 500);
    }

    return sendSuccess(res, data);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch maintenance plans', 500);
  }
};

export const getMaintenancePlanById = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('maintenance_plans')
      .select(`
        *,
        equipment:maintenance_equipment(id, name, code),
        responsible:users!MaintenancePlanResponsible(id, name, email),
        workOrders:work_orders(id, workOrderNumber, status, openedDate)
      `)
      .eq('id', id)
      .eq('companyId', companyId)
      .single();

    if (error) {
      return sendError(res, 'Maintenance plan not found', 404);
    }

    return sendSuccess(res, data);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch maintenance plan', 500);
  }
};

export const createMaintenancePlan = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const planData = req.body;

    const { data, error } = await supabase
      .from('maintenance_plans')
      .insert({
        ...planData,
        companyId,
      })
      .select()
      .single();

    if (error) {
      return sendError(res, error.message, 400);
    }

    return sendSuccess(res, data, 'Maintenance plan created successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create maintenance plan', 500);
  }
};

export const updateMaintenancePlan = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { id } = req.params;
    const planData = req.body;

    const { data: existing } = await supabase
      .from('maintenance_plans')
      .select('id')
      .eq('id', id)
      .eq('companyId', companyId)
      .single();

    if (!existing) {
      return sendError(res, 'Maintenance plan not found', 404);
    }

    const { data, error } = await supabase
      .from('maintenance_plans')
      .update({
        ...planData,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return sendError(res, error.message, 400);
    }

    return sendSuccess(res, data, 'Maintenance plan updated successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update maintenance plan', 500);
  }
};

export const deleteMaintenancePlan = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { id } = req.params;

    const { data: existing } = await supabase
      .from('maintenance_plans')
      .select('id')
      .eq('id', id)
      .eq('companyId', companyId)
      .single();

    if (!existing) {
      return sendError(res, 'Maintenance plan not found', 404);
    }

    const { error } = await supabase
      .from('maintenance_plans')
      .delete()
      .eq('id', id);

    if (error) {
      return sendError(res, error.message, 400);
    }

    return sendSuccess(res, null, 'Maintenance plan deleted successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to delete maintenance plan', 500);
  }
};

// ============================================
// ORDENS DE SERVIÇO (OS)
// ============================================

// Gerar próximo número de OS
const generateWorkOrderNumber = async (companyId: string): Promise<string> => {
  const year = new Date().getFullYear();
  const { data: lastOS } = await supabase
    .from('work_orders')
    .select('workOrderNumber')
    .eq('companyId', companyId)
    .like('workOrderNumber', `OS-${year}-%`)
    .order('workOrderNumber', { ascending: false })
    .limit(1)
    .single();

  let sequence = 1;
  if (lastOS?.workOrderNumber) {
    const match = lastOS.workOrderNumber.match(/OS-\d{4}-(\d+)/);
    if (match) {
      sequence = parseInt(match[1], 10) + 1;
    }
  }

  return `OS-${year}-${sequence.toString().padStart(6, '0')}`;
};

export const getAllWorkOrders = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { status, type, equipmentId } = req.query;

    let query = supabase
      .from('work_orders')
      .select(`
        *,
        equipment:maintenance_equipment(id, name, code),
        maintenancePlan:maintenance_plans(id, name),
        assignedTo:users!WorkOrderAssigned(id, name, email),
        approvedBy:users!WorkOrderApprover(id, name, email),
        materials:work_order_materials(
          id,
          quantity,
          unitCost,
          totalCost,
          component:maintenance_components(id, code, description)
        )
      `)
      .eq('companyId', companyId);

    if (status) {
      query = query.eq('status', status);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (equipmentId) {
      query = query.eq('equipmentId', equipmentId);
    }

    const { data, error } = await query.order('openedDate', { ascending: false });

    if (error) {
      return sendError(res, error.message, 500);
    }

    return sendSuccess(res, data);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch work orders', 500);
  }
};

export const getWorkOrderById = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        equipment:maintenance_equipment(id, name, code),
        maintenancePlan:maintenance_plans(id, name),
        assignedTo:users!WorkOrderAssigned(id, name, email),
        approvedBy:users!WorkOrderApprover(id, name, email),
        materials:work_order_materials(
          id,
          quantity,
          unitCost,
          totalCost,
          component:maintenance_components(id, code, description)
        )
      `)
      .eq('id', id)
      .eq('companyId', companyId)
      .single();

    if (error) {
      return sendError(res, 'Work order not found', 404);
    }

    return sendSuccess(res, data);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch work order', 500);
  }
};

export const createWorkOrder = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const workOrderData = req.body;

    // Gerar número da OS
    const workOrderNumber = await generateWorkOrderNumber(companyId);

    const { data, error } = await supabase
      .from('work_orders')
      .insert({
        ...workOrderData,
        companyId,
        workOrderNumber,
      })
      .select()
      .single();

    if (error) {
      return sendError(res, error.message, 400);
    }

    return sendSuccess(res, data, 'Work order created successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create work order', 500);
  }
};

export const updateWorkOrder = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { id } = req.params;
    const workOrderData = req.body;

    const { data: existing } = await supabase
      .from('work_orders')
      .select('id')
      .eq('id', id)
      .eq('companyId', companyId)
      .single();

    if (!existing) {
      return sendError(res, 'Work order not found', 404);
    }

    // Se estiver finalizando, atualizar closedDate e calcular custos
    if (workOrderData.status === 'FINISHED' && !workOrderData.closedDate) {
      workOrderData.closedDate = new Date().toISOString();
    }

    // Calcular custo total se materiais foram atualizados
    if (workOrderData.materials) {
      const materialsCost = workOrderData.materials.reduce(
        (sum: number, m: any) => sum + (m.totalCost || 0),
        0
      );
      workOrderData.materialsCost = materialsCost;
      workOrderData.totalCost = (workOrderData.laborCost || 0) + materialsCost;
    } else {
      workOrderData.totalCost = (workOrderData.laborCost || 0) + (workOrderData.materialsCost || 0);
    }

    const { data, error } = await supabase
      .from('work_orders')
      .update({
        ...workOrderData,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return sendError(res, error.message, 400);
    }

    return sendSuccess(res, data, 'Work order updated successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update work order', 500);
  }
};

export const deleteWorkOrder = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { id } = req.params;

    const { data: existing } = await supabase
      .from('work_orders')
      .select('id')
      .eq('id', id)
      .eq('companyId', companyId)
      .single();

    if (!existing) {
      return sendError(res, 'Work order not found', 404);
    }

    const { error } = await supabase
      .from('work_orders')
      .delete()
      .eq('id', id);

    if (error) {
      return sendError(res, error.message, 400);
    }

    return sendSuccess(res, null, 'Work order deleted successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to delete work order', 500);
  }
};

// ============================================
// FORNECEDORES
// ============================================

export const getAllSuppliers = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;

    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('companyId', companyId)
      .order('createdAt', { ascending: false });

    if (error) {
      return sendError(res, error.message, 500);
    }

    return sendSuccess(res, data);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch suppliers', 500);
  }
};

export const getSupplierById = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('suppliers')
      .select(`
        *,
        components:maintenance_components(id, code, description)
      `)
      .eq('id', id)
      .eq('companyId', companyId)
      .single();

    if (error) {
      return sendError(res, 'Supplier not found', 404);
    }

    return sendSuccess(res, data);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch supplier', 500);
  }
};

export const createSupplier = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const supplierData = req.body;

    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        ...supplierData,
        companyId,
      })
      .select()
      .single();

    if (error) {
      return sendError(res, error.message, 400);
    }

    return sendSuccess(res, data, 'Supplier created successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create supplier', 500);
  }
};

export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { id } = req.params;
    const supplierData = req.body;

    const { data: existing } = await supabase
      .from('suppliers')
      .select('id')
      .eq('id', id)
      .eq('companyId', companyId)
      .single();

    if (!existing) {
      return sendError(res, 'Supplier not found', 404);
    }

    const { data, error } = await supabase
      .from('suppliers')
      .update({
        ...supplierData,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return sendError(res, error.message, 400);
    }

    return sendSuccess(res, data, 'Supplier updated successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update supplier', 500);
  }
};

export const deleteSupplier = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { id } = req.params;

    const { data: existing } = await supabase
      .from('suppliers')
      .select('id')
      .eq('id', id)
      .eq('companyId', companyId)
      .single();

    if (!existing) {
      return sendError(res, 'Supplier not found', 404);
    }

    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) {
      return sendError(res, error.message, 400);
    }

    return sendSuccess(res, null, 'Supplier deleted successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to delete supplier', 500);
  }
};

