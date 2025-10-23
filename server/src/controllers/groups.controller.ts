import { Request, Response } from 'express';
import supabase from '../config/supabase';

// Get all groups for a company
export const getAllGroups = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;

    console.log('🔍 Fetching groups for company:', companyId);

    const { data: groups, error } = await supabase
      .from('groups')
      .select('*')
      .eq('companyId', companyId)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('❌ Error fetching groups:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    console.log(`✅ Found ${groups?.length || 0} groups`);

    // Get all unique shiftIds
    const shiftIds = [...new Set(groups?.map((g: any) => g.shiftId).filter(Boolean))] as string[];

    // Fetch shifts data if there are any
    let shiftsMap = new Map();
    if (shiftIds.length > 0) {
      const { data: shifts } = await supabase
        .from('shifts')
        .select('id, name, totalHours')
        .in('id', shiftIds);

      shiftsMap = new Map(shifts?.map((s: any) => [s.id, s]) || []);
    }

    // Fetch operator links for each group
    const groupsWithOperators = await Promise.all(
      groups.map(async (group: any) => {
        const { data: operatorLinks } = await supabase
          .from('operator_groups')
          .select('userId')
          .eq('groupId', group.id);

        return {
          ...group,
          cyclesPerShift: group.expectedCyclesPerShift, // Map to frontend property name
          shift: group.shiftId ? shiftsMap.get(group.shiftId) || null : null,
          operatorIds: operatorLinks?.map((link: any) => link.userId) || [],
        };
      })
    );

    res.json({
      success: true,
      data: groupsWithOperators,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch groups',
    });
  }
};

// Get single group by ID
export const getGroupById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user!;

    const { data: group, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', id)
      .eq('companyId', companyId)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Group not found',
      });
    }

    res.json({
      success: true,
      data: group,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch group',
    });
  }
};

// Create new group
export const createGroup = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { name, description, cyclesPerShift, shiftId, operatorIds = [] } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Group name is required',
      });
    }

    // Create the group
    const { data: group, error } = await supabase
      .from('groups')
      .insert({
        companyId,
        name,
        description: description || null,
        shiftId: shiftId || null,
        expectedCyclesPerShift: cyclesPerShift || 0,
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    // Link operators to the group
    if (operatorIds.length > 0) {
      const operatorGroupRecords = operatorIds.map((userId: string) => ({
        userId,
        groupId: group.id,
      }));

      const { error: linkError } = await supabase
        .from('operator_groups')
        .insert(operatorGroupRecords);

      if (linkError) {
        console.error('Error linking operators to group:', linkError);
        // Don't fail the entire request, just log the error
      }
    }

    // Fetch shift data if shiftId is present
    let shiftData = null;
    if (group.shiftId) {
      const { data: shift } = await supabase
        .from('shifts')
        .select('id, name, totalHours')
        .eq('id', group.shiftId)
        .single();

      shiftData = shift;
    }

    // Add operatorIds and shift to the response
    const groupWithOperators = {
      ...group,
      cyclesPerShift: group.expectedCyclesPerShift, // Map to frontend property name
      shift: shiftData,
      operatorIds,
    };

    res.status(201).json({
      success: true,
      data: groupWithOperators,
      message: 'Group created successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create group',
    });
  }
};

// Update group
export const updateGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user!;
    const { name, description, cyclesPerShift, shiftId, operatorIds } = req.body;

    console.log('🔄 Updating group:', id, 'with data:', { name, description, cyclesPerShift, shiftId, operatorIds });

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (cyclesPerShift !== undefined) updateData.expectedCyclesPerShift = cyclesPerShift;
    if (shiftId !== undefined) updateData.shiftId = shiftId === '' ? null : shiftId; // Convert empty string to null

    console.log('📝 Update data being sent:', updateData);

    const { data: group, error } = await supabase
      .from('groups')
      .update(updateData)
      .eq('id', id)
      .eq('companyId', companyId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating group:', error);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    console.log('✅ Group updated successfully:', group);

    // Update operator links if operatorIds was provided
    if (operatorIds !== undefined) {
      // Delete existing operator links
      await supabase
        .from('operator_groups')
        .delete()
        .eq('groupId', id);

      // Insert new operator links
      if (operatorIds.length > 0) {
        const operatorGroupRecords = operatorIds.map((userId: string) => ({
          userId,
          groupId: id,
        }));

        const { error: linkError } = await supabase
          .from('operator_groups')
          .insert(operatorGroupRecords);

        if (linkError) {
          console.error('Error linking operators to group:', linkError);
        }
      }
    }

    // Fetch shift data if shiftId is present
    let shiftData = null;
    if (group.shiftId) {
      const { data: shift } = await supabase
        .from('shifts')
        .select('id, name, totalHours')
        .eq('id', group.shiftId)
        .single();

      shiftData = shift;
    }

    // Add operatorIds and shift to the response
    const groupWithOperators = {
      ...group,
      cyclesPerShift: group.expectedCyclesPerShift, // Map to frontend property name
      shift: shiftData,
      operatorIds: operatorIds || [],
    };

    console.log('📤 Sending response:', groupWithOperators);

    res.json({
      success: true,
      data: groupWithOperators,
      message: 'Group updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update group',
    });
  }
};

// Delete group
export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user!;

    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id)
      .eq('companyId', companyId);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: 'Group deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete group',
    });
  }
};
