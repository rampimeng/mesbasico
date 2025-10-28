import { Request, Response } from 'express';
import supabase from '../config/supabase';

// Get company data by dashboard token (public endpoint)
export const getCompanyByToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    console.log('🔍 Looking up company by dashboard token:', token);

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required',
      });
    }

    // Find company by dashboardToken
    const { data: company, error } = await supabase
      .from('companies')
      .select('id, name, cnpj, logoUrl, dashboardToken')
      .eq('dashboardToken', token)
      .eq('active', true)
      .single();

    if (error || !company) {
      console.error('❌ Company not found or error:', error);
      return res.status(404).json({
        success: false,
        error: 'Dashboard not found',
      });
    }

    console.log('✅ Company found:', company.name);

    res.json({
      success: true,
      data: company,
    });
  } catch (error: any) {
    console.error('❌ Exception in getCompanyByToken:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch company data',
    });
  }
};

// Get real-time dashboard data (machines, groups, analytics)
export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    console.log('📊 Fetching dashboard data for token:', token);

    // First, get the company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('dashboardToken', token)
      .eq('active', true)
      .single();

    if (companyError || !company) {
      return res.status(404).json({
        success: false,
        error: 'Dashboard not found',
      });
    }

    const companyId = company.id;

    // Fetch groups
    const { data: groups } = await supabase
      .from('groups')
      .select('id, name, expectedCyclesPerShift')
      .eq('companyId', companyId);

    // Fetch machines with their current status
    const { data: machines } = await supabase
      .from('machines')
      .select('id, name, code, groupId, numberOfMatrices, status, currentOperatorId')
      .eq('companyId', companyId);

    // Fetch matrices (no companyId filter - matrices table doesn't have companyId column)
    // We'll filter by machineId when building the response
    const machineIds = (machines || []).map(m => m.id);
    const { data: matrices, error: matricesError } = await supabase
      .from('matrices')
      .select('id, machineId, matrixNumber, status')
      .in('machineId', machineIds.length > 0 ? machineIds : ['']);

    if (matricesError) {
      console.error('❌ Error fetching matrices:', matricesError);
    }

    console.log(`📊 Fetched ${machines?.length || 0} machines and ${matrices?.length || 0} matrices`);

    // Calculate real uptime for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    const { data: todayLogs } = await supabase
      .from('time_logs')
      .select('machineId, status, durationSeconds')
      .eq('companyId', companyId)
      .gte('startedAt', todayStr);

    // Calculate uptime per machine
    const machineUptime: Record<string, { production: number; total: number; percentage: number }> = {};

    for (const machine of machines || []) {
      const machineLogs = (todayLogs || []).filter(log => log.machineId === machine.id);
      const totalTime = machineLogs.reduce((sum, log) => sum + (log.durationSeconds || 0), 0);
      const productionTime = machineLogs
        .filter(log => log.status === 'NORMAL_RUNNING')
        .reduce((sum, log) => sum + (log.durationSeconds || 0), 0);

      machineUptime[machine.id] = {
        production: productionTime,
        total: totalTime,
        percentage: totalTime > 0 ? Math.round((productionTime / totalTime) * 100) : 0,
      };
    }

    // Calculate group uptime
    const groupUptime: Record<string, number> = {};
    for (const group of groups || []) {
      const groupMachines = (machines || []).filter(m => m.groupId === group.id);
      if (groupMachines.length === 0) {
        groupUptime[group.id] = 0;
        continue;
      }

      const totalUptime = groupMachines.reduce((sum, machine) => {
        return sum + (machineUptime[machine.id]?.percentage || 0);
      }, 0);

      groupUptime[group.id] = Math.round(totalUptime / groupMachines.length);
    }

    console.log('✅ Dashboard data fetched successfully');

    res.json({
      success: true,
      data: {
        company,
        groups: (groups || []).map(g => ({
          ...g,
          uptime: groupUptime[g.id] || 0,
        })),
        machines: (machines || []).map(m => ({
          ...m,
          uptime: machineUptime[m.id]?.percentage || 0,
          matrices: (matrices || []).filter(mat => mat.machineId === m.id),
        })),
      },
    });
  } catch (error: any) {
    console.error('❌ Exception in getDashboardData:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch dashboard data',
    });
  }
};
