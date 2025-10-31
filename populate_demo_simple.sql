-- ============================================
-- SCRIPT PARA POPULAR DADOS DE DEMONSTRAÇÃO
-- Empresa Demo - 01/10/2025 até 29/10/2025
-- Execute direto no SQL Editor do Supabase
-- ============================================

DO $$
DECLARE
    v_company_id UUID;
    v_group_id UUID;
    v_operator_id UUID;
    v_machine_id UUID;
    v_stop_reason_manutencao UUID;
    v_stop_reason_material UUID;
    v_stop_reason_qualidade UUID;
    v_stop_reason_setup UUID;
    v_stop_reason_outro UUID;
    v_current_date DATE;
    v_end_date DATE;
    v_current_time TIMESTAMP;
    v_machine_counter INT;
    v_day_counter INT;
    v_activity_counter INT;
BEGIN
    -- ============================================
    -- 1. BUSCAR EMPRESA DEMO
    -- ============================================
    SELECT id INTO v_company_id
    FROM companies
    WHERE name = 'Empresa Demo'
    LIMIT 1;

    IF v_company_id IS NULL THEN
        RAISE EXCEPTION 'Empresa Demo não encontrada!';
    END IF;

    RAISE NOTICE 'Empresa Demo encontrada: %', v_company_id;

    -- Buscar grupo
    SELECT id INTO v_group_id
    FROM groups
    WHERE "companyId" = v_company_id
    LIMIT 1;

    -- Buscar operador
    SELECT id INTO v_operator_id
    FROM users
    WHERE "companyId" = v_company_id AND role = 'OPERATOR'
    LIMIT 1;

    -- Buscar motivos de parada
    SELECT id INTO v_stop_reason_manutencao FROM stop_reasons WHERE "companyId" = v_company_id AND category = 'MAINTENANCE' LIMIT 1;
    SELECT id INTO v_stop_reason_material FROM stop_reasons WHERE "companyId" = v_company_id AND category = 'MATERIAL' LIMIT 1;
    SELECT id INTO v_stop_reason_qualidade FROM stop_reasons WHERE "companyId" = v_company_id AND category = 'QUALITY' LIMIT 1;
    SELECT id INTO v_stop_reason_setup FROM stop_reasons WHERE "companyId" = v_company_id AND category = 'SETUP' LIMIT 1;
    SELECT id INTO v_stop_reason_outro FROM stop_reasons WHERE "companyId" = v_company_id AND category = 'OTHER' LIMIT 1;

    -- ============================================
    -- 2. LIMPAR DADOS ANTIGOS
    -- ============================================
    RAISE NOTICE 'Limpando dados antigos...';

    DELETE FROM matrix_activities
    WHERE "matrixId" IN (
        SELECT m.id FROM matrices m
        INNER JOIN machines ma ON m."machineId" = ma.id
        WHERE ma."companyId" = v_company_id
    );

    DELETE FROM machine_activities WHERE "machineId" IN (
        SELECT id FROM machines WHERE "companyId" = v_company_id
    );

    DELETE FROM audit_logs WHERE "companyId" = v_company_id;

    DELETE FROM matrices WHERE "machineId" IN (
        SELECT id FROM machines WHERE "companyId" = v_company_id
    );

    DELETE FROM machines WHERE "companyId" = v_company_id;

    -- ============================================
    -- 3. CRIAR 5 MÁQUINAS
    -- ============================================
    RAISE NOTICE 'Criando 5 máquinas...';

    FOR v_machine_counter IN 1..5 LOOP
        INSERT INTO machines ("companyId", "groupId", name, code, "numberOfMatrices", "standardCycleTime", status, active)
        VALUES (
            v_company_id,
            v_group_id,
            'Máquina ' || LPAD(v_machine_counter::TEXT, 2, '0'),
            'MAQ-' || LPAD(v_machine_counter::TEXT, 3, '0'),
            4,
            30 + (v_machine_counter * 5),
            'IDLE',
            true
        )
        RETURNING id INTO v_machine_id;

        -- Criar 4 matrizes para cada máquina
        INSERT INTO matrices ("machineId", "matrixNumber", status) VALUES (v_machine_id, 1, 'IDLE');
        INSERT INTO matrices ("machineId", "matrixNumber", status) VALUES (v_machine_id, 2, 'IDLE');
        INSERT INTO matrices ("machineId", "matrixNumber", status) VALUES (v_machine_id, 3, 'IDLE');
        INSERT INTO matrices ("machineId", "matrixNumber", status) VALUES (v_machine_id, 4, 'IDLE');
    END LOOP;

    RAISE NOTICE '5 máquinas criadas com sucesso!';

    -- ============================================
    -- 4. POPULAR DADOS HISTÓRICOS
    -- ============================================
    RAISE NOTICE 'Gerando dados históricos de 01/10/2025 até hoje...';

    v_current_date := '2025-10-01'::DATE;
    v_end_date := CURRENT_DATE;
    v_day_counter := 0;
    v_activity_counter := 0;

    -- Loop por cada dia
    WHILE v_current_date <= v_end_date LOOP
        -- Pular finais de semana
        IF EXTRACT(DOW FROM v_current_date) NOT IN (0, 6) THEN
            v_day_counter := v_day_counter + 1;

            -- Para cada máquina
            FOR v_machine_id IN (SELECT id FROM machines WHERE "companyId" = v_company_id) LOOP
                v_current_time := v_current_date + '08:00:00'::TIME;

                -- Período 1: 08:00-10:30 - GIRO
                INSERT INTO machine_activities ("machineId", "operatorId", status, "startTime", "endTime", duration, "cyclesCount")
                VALUES (v_machine_id, v_operator_id, 'NORMAL_RUNNING', v_current_time, v_current_time + '2 hours 30 minutes'::INTERVAL, 9000, 75);
                v_current_time := v_current_time + '2 hours 30 minutes'::INTERVAL;
                v_activity_counter := v_activity_counter + 1;

                -- Período 2: 10:30-10:45 - PARADA (Manutenção)
                INSERT INTO machine_activities ("machineId", "operatorId", status, "stopReasonId", "startTime", "endTime", duration, "cyclesCount")
                VALUES (v_machine_id, v_operator_id, 'STOPPED', v_stop_reason_manutencao, v_current_time, v_current_time + '15 minutes'::INTERVAL, 900, 0);
                v_current_time := v_current_time + '15 minutes'::INTERVAL;
                v_activity_counter := v_activity_counter + 1;

                -- Período 3: 10:45-12:00 - GIRO
                INSERT INTO machine_activities ("machineId", "operatorId", status, "startTime", "endTime", duration, "cyclesCount")
                VALUES (v_machine_id, v_operator_id, 'NORMAL_RUNNING', v_current_time, v_current_time + '1 hour 15 minutes'::INTERVAL, 4500, 37);
                v_current_time := v_current_time + '1 hour 15 minutes'::INTERVAL;
                v_activity_counter := v_activity_counter + 1;

                -- Almoço: 12:00-13:00 (pular)
                v_current_time := v_current_date + '13:00:00'::TIME;

                -- Período 4: 13:00-14:00 - GIRO
                INSERT INTO machine_activities ("machineId", "operatorId", status, "startTime", "endTime", duration, "cyclesCount")
                VALUES (v_machine_id, v_operator_id, 'NORMAL_RUNNING', v_current_time, v_current_time + '1 hour'::INTERVAL, 3600, 30);
                v_current_time := v_current_time + '1 hour'::INTERVAL;
                v_activity_counter := v_activity_counter + 1;

                -- Período 5: 14:00-14:20 - PARADA (Falta de Material)
                INSERT INTO machine_activities ("machineId", "operatorId", status, "stopReasonId", "startTime", "endTime", duration, "cyclesCount")
                VALUES (v_machine_id, v_operator_id, 'STOPPED', v_stop_reason_material, v_current_time, v_current_time + '20 minutes'::INTERVAL, 1200, 0);
                v_current_time := v_current_time + '20 minutes'::INTERVAL;
                v_activity_counter := v_activity_counter + 1;

                -- Período 6: 14:20-15:30 - GIRO
                INSERT INTO machine_activities ("machineId", "operatorId", status, "startTime", "endTime", duration, "cyclesCount")
                VALUES (v_machine_id, v_operator_id, 'NORMAL_RUNNING', v_current_time, v_current_time + '1 hour 10 minutes'::INTERVAL, 4200, 35);
                v_current_time := v_current_time + '1 hour 10 minutes'::INTERVAL;
                v_activity_counter := v_activity_counter + 1;

                -- Período 7: 15:30-15:40 - PARADA (Qualidade)
                INSERT INTO machine_activities ("machineId", "operatorId", status, "stopReasonId", "startTime", "endTime", duration, "cyclesCount")
                VALUES (v_machine_id, v_operator_id, 'STOPPED', v_stop_reason_qualidade, v_current_time, v_current_time + '10 minutes'::INTERVAL, 600, 0);
                v_current_time := v_current_time + '10 minutes'::INTERVAL;
                v_activity_counter := v_activity_counter + 1;

                -- Período 8: 15:40-17:00 - GIRO
                INSERT INTO machine_activities ("machineId", "operatorId", status, "startTime", "endTime", duration, "cyclesCount")
                VALUES (v_machine_id, v_operator_id, 'NORMAL_RUNNING', v_current_time, v_current_time + '1 hour 20 minutes'::INTERVAL, 4800, 40);
                v_activity_counter := v_activity_counter + 1;

                -- Adicionar ciclos ao audit_logs para cada período de giro
                -- Período 1: 75 ciclos
                FOR i IN 1..75 LOOP
                    INSERT INTO audit_logs ("companyId", "userId", action, "entityType", "entityId", details, "createdAt")
                    VALUES (v_company_id, v_operator_id, 'CYCLE_COMPLETE', 'Machine', v_machine_id,
                            json_build_object('machineId', v_machine_id),
                            v_current_date + '08:00:00'::TIME + ((i * 2) || ' minutes')::INTERVAL);
                END LOOP;
            END LOOP;

            IF v_day_counter % 5 = 0 THEN
                RAISE NOTICE '  - Processados % dias, % atividades criadas', v_day_counter, v_activity_counter;
            END IF;
        END IF;

        v_current_date := v_current_date + 1;
    END LOOP;

    -- ============================================
    -- 5. ESTATÍSTICAS
    -- ============================================
    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    RAISE NOTICE '✅ DADOS POPULADOS COM SUCESSO!';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Período: 01/10/2025 até %', v_end_date;
    RAISE NOTICE 'Máquinas criadas: 5';
    RAISE NOTICE 'Total de atividades: %', v_activity_counter;
    RAISE NOTICE 'Total de ciclos registrados: %', (SELECT COUNT(*) FROM audit_logs WHERE "companyId" = v_company_id);
    RAISE NOTICE '================================================';

END $$;
