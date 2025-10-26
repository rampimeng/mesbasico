import { Request, Response } from 'express';
import supabase from '../config/supabase';

/**
 * Close all historical open time logs
 * This is a maintenance endpoint to fix any logs that were left open due to errors or edge cases
 */
export const closeHistoricalLogs = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { maxAgeHours = 24 } = req.body; // Default: close logs older than 24 hours

    console.log('🔧 Maintenance: Closing historical open logs for company:', companyId);

    // Calculate cutoff time
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - maxAgeHours);

    // Get all open time logs older than cutoff
    const { data: openLogs, error: fetchError } = await supabase
      .from('time_logs')
      .select('*')
      .eq('companyId', companyId)
      .is('endedAt', null)
      .lt('startedAt', cutoffTime.toISOString());

    if (fetchError) {
      console.error('❌ Error fetching open logs:', fetchError);
      return res.status(500).json({
        success: false,
        error: fetchError.message,
      });
    }

    if (!openLogs || openLogs.length === 0) {
      console.log('✅ No open logs found to close');
      return res.json({
        success: true,
        message: 'No open logs found to close',
        closed: 0,
      });
    }

    console.log(`📋 Found ${openLogs.length} open logs to close`);

    // Close each log
    let closedCount = 0;
    let errorCount = 0;
    const now = new Date();

    for (const log of openLogs) {
      try {
        const startedAt = new Date(log.startedAt);
        const durationSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);

        const { error: updateError } = await supabase
          .from('time_logs')
          .update({
            endedAt: now.toISOString(),
            durationSeconds,
          })
          .eq('id', log.id);

        if (updateError) {
          console.error(`❌ Error closing log ${log.id}:`, updateError);
          errorCount++;
        } else {
          console.log(`✅ Closed log ${log.id} - Machine: ${log.machineId}, Status: ${log.status}, Duration: ${durationSeconds}s`);
          closedCount++;
        }
      } catch (error) {
        console.error(`❌ Exception closing log ${log.id}:`, error);
        errorCount++;
      }
    }

    console.log(`✅ Maintenance complete: ${closedCount} logs closed, ${errorCount} errors`);

    res.json({
      success: true,
      message: `Closed ${closedCount} historical logs`,
      closed: closedCount,
      errors: errorCount,
    });
  } catch (error: any) {
    console.error('❌ Exception in closeHistoricalLogs:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to close historical logs',
    });
  }
};

/**
 * Get statistics about open time logs
 */
export const getOpenLogsStats = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;

    console.log('📊 Getting open logs stats for company:', companyId);

    // Get all open time logs
    const { data: openLogs, error: fetchError } = await supabase
      .from('time_logs')
      .select('*')
      .eq('companyId', companyId)
      .is('endedAt', null);

    if (fetchError) {
      console.error('❌ Error fetching open logs:', fetchError);
      return res.status(500).json({
        success: false,
        error: fetchError.message,
      });
    }

    const stats = {
      total: openLogs?.length || 0,
      byStatus: {} as Record<string, number>,
      byMachine: {} as Record<string, number>,
      oldestLog: null as any,
    };

    if (openLogs && openLogs.length > 0) {
      // Group by status
      openLogs.forEach((log) => {
        stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1;
        stats.byMachine[log.machineId] = (stats.byMachine[log.machineId] || 0) + 1;
      });

      // Find oldest log
      const sortedLogs = [...openLogs].sort(
        (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
      );
      stats.oldestLog = {
        id: sortedLogs[0].id,
        startedAt: sortedLogs[0].startedAt,
        ageHours: Math.floor((Date.now() - new Date(sortedLogs[0].startedAt).getTime()) / (1000 * 60 * 60)),
        status: sortedLogs[0].status,
        machineId: sortedLogs[0].machineId,
      };
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('❌ Exception in getOpenLogsStats:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get open logs stats',
    });
  }
};
