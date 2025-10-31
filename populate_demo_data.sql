-- ============================================
-- SCRIPT PARA POPULAR DADOS DE DEMONSTRAÇÃO
-- Empresa Demo - 01/10/2025 até 29/10/2025
-- ============================================

DO $$
DECLARE
    v_company_id UUID;
    v_group_id UUID;
    v_operator_id UUID;
    v_machine_ids UUID[];
    v_stop_reason_ids JSON;
    v_current_date DATE;
    v_end_date DATE;
    v_shift_start TIME;
    v_shift_end TIME;
    v_current_time TIMESTAMP;
    v_machine_id UUID;
    v_status TEXT;
    v_stop_reason_id UUID;
    v_duration_minutes INT;
    v_cycles_in_period INT;
    i INT;
    j INT;
BEGIN
    -- Data inicial e final
    v_current_date := '2025-10-01'::DATE;
    v_end_date := CURRENT_DATE;

    -- Horário do turno (8:00 às 17:00 com 1h de almoço = 8h úteis)
    v_shift_start := '08:00:00'::TIME;
    v_shift_end := '17:00:00'::TIME;

    -- ============================================
    -- 1. BUSCAR IDs NECESSÁRIOS
    -- ============================================

    RAISE NOTICE '🔍 Buscando dados da Empresa Demo...';

    -- Buscar empresa Demo
    SELECT id INTO v_company_id
    FROM companies
    WHERE name = 'Empresa Demo'
    LIMIT 1;

    IF v_company_id IS NULL THEN
        RAISE EXCEPTION '❌ Empresa Demo não encontrada! Execute o seed primeiro.';
    END IF;

    RAISE NOTICE '✅ Empresa Demo encontrada: %', v_company_id;

    -- Buscar grupo
    SELECT id INTO v_group_id
    FROM groups
    WHERE "companyId" = v_company_id
    LIMIT 1;

    RAISE NOTICE '✅ Grupo encontrado: %', v_group_id;

    -- Buscar operador
    SELECT id INTO v_operator_id
    FROM users
    WHERE "companyId" = v_company_id AND role = 'OPERATOR'
    LIMIT 1;

    RAISE NOTICE '✅ Operador encontrado: %', v_operator_id;

    -- ============================================
    -- 2. CRIAR MÁQUINAS ADICIONAIS
    -- ============================================

    RAISE NOTICE '⚙️  Criando máquinas adicionais...';

    -- Deletar atividades antigas para poder recriar as máquinas
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

    -- Criar 5 máquinas
    FOR i IN 1..5 LOOP
        INSERT INTO machines (id, "companyId", "groupId", name, code, "numberOfMatrices", "standardCycleTime", status, active)
        VALUES (
            gen_random_uuid(),
            v_company_id,
            v_group_id,
            'Máquina ' || LPAD(i::TEXT, 2, '0'),
            'MAQ-' || LPAD(i::TEXT, 3, '0'),
            4, -- 4 matrizes por máquina
            30 + (i * 5), -- Ciclo de 30-55 segundos
            'IDLE',
            true
        );
    END LOOP;

    -- Buscar IDs das máquinas criadas
    SELECT ARRAY_AGG(id) INTO v_machine_ids
    FROM machines
    WHERE "companyId" = v_company_id;

    RAISE NOTICE '✅ % máquinas criadas', array_length(v_machine_ids, 1);

    -- Criar matrizes para cada máquina
    FOREACH v_machine_id IN ARRAY v_machine_ids LOOP
        FOR i IN 1..4 LOOP
            INSERT INTO matrices (id, "machineId", "matrixNumber", status)
            VALUES (
                gen_random_uuid(),
                v_machine_id,
                i,
                'IDLE'
            );
        END LOOP;
    END LOOP;

    RAISE NOTICE '✅ Matrizes criadas para todas as máquinas';

    -- ============================================
    -- 3. BUSCAR MOTIVOS DE PARADA
    -- ============================================

    SELECT json_object_agg(category, id) INTO v_stop_reason_ids
    FROM (
        SELECT category, id
        FROM stop_reasons
        WHERE "companyId" = v_company_id
        LIMIT 5
    ) sub;

    RAISE NOTICE '✅ Motivos de parada carregados';

    -- ============================================
    -- 4. GERAR DADOS HISTÓRICOS
    -- ============================================

    RAISE NOTICE '📊 Gerando dados históricos de % até %...', v_current_date, v_end_date;

    -- Loop por cada dia
    WHILE v_current_date <= v_end_date LOOP
        -- Pular finais de semana
        IF EXTRACT(DOW FROM v_current_date) NOT IN (0, 6) THEN
            RAISE NOTICE '📅 Processando dia: %', v_current_date;

            -- Para cada máquina
            FOREACH v_machine_id IN ARRAY v_machine_ids LOOP
                v_current_time := v_current_date + v_shift_start;

                -- Simular um turno de 8 horas com eventos variados
                WHILE v_current_time < (v_current_date + v_shift_end) LOOP
                    -- Escolher aleatoriamente: GIRO (70%) ou PARADA (30%)
                    IF random() < 0.7 THEN
                        -- GIRO NORMAL
                        v_status := 'NORMAL_RUNNING';
                        v_stop_reason_id := NULL;
                        v_duration_minutes := 30 + floor(random() * 90)::INT; -- 30-120 min
                        v_cycles_in_period := floor(v_duration_minutes / 2.0)::INT; -- ~1 ciclo a cada 2 min
                    ELSE
                        -- PARADA
                        v_status := 'STOPPED';

                        -- Escolher motivo de parada aleatório
                        CASE floor(random() * 5)::INT
                            WHEN 0 THEN v_stop_reason_id := (SELECT id FROM stop_reasons WHERE "companyId" = v_company_id AND category = 'MAINTENANCE' LIMIT 1);
                            WHEN 1 THEN v_stop_reason_id := (SELECT id FROM stop_reasons WHERE "companyId" = v_company_id AND category = 'MATERIAL' LIMIT 1);
                            WHEN 2 THEN v_stop_reason_id := (SELECT id FROM stop_reasons WHERE "companyId" = v_company_id AND category = 'QUALITY' LIMIT 1);
                            WHEN 3 THEN v_stop_reason_id := (SELECT id FROM stop_reasons WHERE "companyId" = v_company_id AND category = 'SETUP' LIMIT 1);
                            ELSE v_stop_reason_id := (SELECT id FROM stop_reasons WHERE "companyId" = v_company_id AND category = 'OTHER' LIMIT 1);
                        END CASE;

                        v_duration_minutes := 5 + floor(random() * 25)::INT; -- 5-30 min de parada
                        v_cycles_in_period := 0;
                    END IF;

                    -- Inserir atividade da máquina
                    INSERT INTO machine_activities (
                        id,
                        "machineId",
                        "operatorId",
                        status,
                        "stopReasonId",
                        "startTime",
                        "endTime",
                        duration,
                        "cyclesCount"
                    ) VALUES (
                        gen_random_uuid(),
                        v_machine_id,
                        v_operator_id,
                        v_status,
                        v_stop_reason_id,
                        v_current_time,
                        v_current_time + (v_duration_minutes || ' minutes')::INTERVAL,
                        v_duration_minutes * 60,
                        v_cycles_in_period
                    );

                    -- Registrar ciclos no audit_logs
                    IF v_cycles_in_period > 0 THEN
                        FOR j IN 1..v_cycles_in_period LOOP
                            INSERT INTO audit_logs (
                                id,
                                "companyId",
                                "userId",
                                action,
                                "entityType",
                                "entityId",
                                details,
                                "createdAt"
                            ) VALUES (
                                gen_random_uuid(),
                                v_company_id,
                                v_operator_id,
                                'CYCLE_COMPLETE',
                                'Machine',
                                v_machine_id,
                                json_build_object('machineId', v_machine_id, 'cycleNumber', j),
                                v_current_time + ((j * v_duration_minutes / v_cycles_in_period) || ' minutes')::INTERVAL
                            );
                        END LOOP;
                    END IF;

                    -- Avançar o tempo
                    v_current_time := v_current_time + (v_duration_minutes || ' minutes')::INTERVAL;

                    -- Pausa para almoço (12:00-13:00)
                    IF v_current_time::TIME >= '12:00:00'::TIME AND v_current_time::TIME < '13:00:00'::TIME THEN
                        v_current_time := v_current_date + '13:00:00'::TIME;
                    END IF;
                END LOOP;
            END LOOP;
        END IF;

        -- Próximo dia
        v_current_date := v_current_date + 1;
    END LOOP;

    -- ============================================
    -- 5. ESTATÍSTICAS FINAIS
    -- ============================================

    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    RAISE NOTICE '✅ DADOS POPULADOS COM SUCESSO!';
    RAISE NOTICE '================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Estatísticas:';
    RAISE NOTICE '  - Período: 01/10/2025 até %', v_end_date;
    RAISE NOTICE '  - Máquinas criadas: %', array_length(v_machine_ids, 1);
    RAISE NOTICE '  - Total de atividades: %', (SELECT COUNT(*) FROM machine_activities WHERE "machineId" = ANY(v_machine_ids));
    RAISE NOTICE '  - Total de ciclos: %', (SELECT COUNT(*) FROM audit_logs WHERE "companyId" = v_company_id AND action = 'CYCLE_COMPLETE');
    RAISE NOTICE '  - Atividades de GIRO: %', (SELECT COUNT(*) FROM machine_activities WHERE "machineId" = ANY(v_machine_ids) AND status = 'NORMAL_RUNNING');
    RAISE NOTICE '  - Atividades de PARADA: %', (SELECT COUNT(*) FROM machine_activities WHERE "machineId" = ANY(v_machine_ids) AND status = 'STOPPED');
    RAISE NOTICE '';
    RAISE NOTICE '📈 Paradas por motivo:';

    FOR v_stop_reason_id IN
        SELECT DISTINCT sr.id
        FROM stop_reasons sr
        WHERE sr."companyId" = v_company_id
    LOOP
        RAISE NOTICE '  - %: % paradas',
            (SELECT name FROM stop_reasons WHERE id = v_stop_reason_id),
            (SELECT COUNT(*) FROM machine_activities WHERE "stopReasonId" = v_stop_reason_id);
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE '================================================';

END $$;
