import cron from 'node-cron';
import supabase from '../config/supabase';
import { getOrCreateShiftEndReason } from './ensureSystemStopReasons';

/**
 * Automatic daily shift closure
 * Closes all active production sessions at midnight (00:00:00)
 */
export const initializeScheduler = () => {
  console.log('📅 Initializing automatic shift closure scheduler...');

  // Schedule task to run at midnight every day (00:00:00)
  // Cron pattern: "0 0 * * *" = At 00:00:00 every day
  cron.schedule('0 0 * * *', async () => {
    console.log('🌙 [MIDNIGHT] Starting automatic shift closure...');

    try {
      // Get all active production sessions
      const { data: activeSessions, error: sessionsError } = await supabase
        .from('production_sessions')
        .select('id, companyId, machineId, operatorId')
        .eq('active', true);

      if (sessionsError) {
        console.error('❌ Error fetching active sessions:', sessionsError);
        return;
      }

      if (!activeSessions || activeSessions.length === 0) {
        console.log('✅ No active sessions to close');
        return;
      }

      console.log(`📋 Found ${activeSessions.length} active sessions to close`);

      let closedCount = 0;
      let errorCount = 0;

      const now = new Date().toISOString();

      // Process each session
      for (const session of activeSessions) {
        try {
          // 1. Close any active time logs for this session
          // First, get active logs to calculate duration
          const { data: activeLogs } = await supabase
            .from('time_logs')
            .select('id, startedAt')
            .eq('sessionId', session.id)
            .is('endedAt', null);

          if (activeLogs && activeLogs.length > 0) {
            for (const log of activeLogs) {
              const start = new Date(log.startedAt);
              const end = new Date(now);
              const durationSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);

              const { error: timeLogError } = await supabase
                .from('time_logs')
                .update({
                  endedAt: now,
                  durationSeconds,
                })
                .eq('id', log.id);

              if (timeLogError) {
                console.error(`❌ Error closing time log ${log.id}:`, timeLogError);
              }
            }
          }

          // 2. Close the production session
          const { error: sessionError } = await supabase
            .from('production_sessions')
            .update({
              endedAt: now,
              active: false,
            })
            .eq('id', session.id);

          if (sessionError) {
            console.error(`❌ Error closing session ${session.id}:`, sessionError);
            errorCount++;
            continue;
          }

          // 3. Update machine status to IDLE
          const { error: machineError } = await supabase
            .from('machines')
            .update({
              status: 'IDLE',
              currentOperatorId: null,
              updatedAt: now,
            })
            .eq('id', session.machineId);

          if (machineError) {
            console.error(`❌ Error updating machine ${session.machineId}:`, machineError);
          }

          closedCount++;
          console.log(`✅ Closed session ${session.id} for machine ${session.machineId}`);
        } catch (error: any) {
          console.error(`❌ Exception closing session ${session.id}:`, error);
          errorCount++;
        }
      }

      console.log(`🌙 [MIDNIGHT] Shift closure complete: ${closedCount} sessions closed, ${errorCount} errors`);
    } catch (error: any) {
      console.error('❌ Exception in automatic shift closure:', error);
    }
  });

  console.log('✅ Scheduler initialized: Automatic shift closure will run daily at 00:00:00');
};
