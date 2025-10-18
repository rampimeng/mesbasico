import { Request, Response } from 'express';
import supabase from '../config/supabase';
import bcrypt from 'bcrypt';

// Get all users for a company (excluding passwords)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;

    console.log('📋 Fetching users for company:', companyId);

    const { data: users, error } = await supabase
      .from('users')
      .select('id, companyId, name, email, role, active, mfaEnabled, createdAt, updatedAt')
      .eq('companyId', companyId)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('❌ Error fetching users:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    console.log(`✅ Found ${users?.length || 0} users`);

    // For each user, get their groupIds from operator_groups
    const usersWithGroups = await Promise.all(
      (users || []).map(async (user) => {
        if (user.role === 'OPERATOR') {
          try {
            const { data: operatorGroups, error: groupError } = await supabase
              .from('operator_groups')
              .select('groupId')
              .eq('userId', user.id);

            if (groupError) {
              console.error(`❌ Error fetching groups for user ${user.id}:`, groupError);
              return {
                ...user,
                groupIds: [],
              };
            }

            return {
              ...user,
              groupIds: operatorGroups?.map((og) => og.groupId) || [],
            };
          } catch (err) {
            console.error(`❌ Exception fetching groups for user ${user.id}:`, err);
            return {
              ...user,
              groupIds: [],
            };
          }
        }
        return user;
      })
    );

    console.log('✅ Returning users with groups');

    res.json({
      success: true,
      data: usersWithGroups,
    });
  } catch (error: any) {
    console.error('❌ Exception in getAllUsers:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch users',
    });
  }
};

// Get single user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user!;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, companyId, name, email, role, active, mfaEnabled, createdAt, updatedAt')
      .eq('id', id)
      .eq('companyId', companyId)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch user',
    });
  }
};

// Create new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { name, email, password, role, groupIds } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, password, and role are required',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        companyId,
        name,
        email,
        password: hashedPassword,
        role,
        active: true,
        mfaEnabled: false,
      })
      .select('id, companyId, name, email, role, active, mfaEnabled, createdAt, updatedAt')
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    // If groupIds provided and user is OPERATOR, create operator_groups entries
    if (role === 'OPERATOR' && groupIds && groupIds.length > 0) {
      const operatorGroupsData = groupIds.map((groupId: string) => ({
        userId: user.id,
        groupId,
      }));

      await supabase.from('operator_groups').insert(operatorGroupsData);
    }

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create user',
    });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user!;
    const { name, email, role, active, groupIds } = req.body;

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (active !== undefined) updateData.active = active;

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .eq('companyId', companyId)
      .select('id, companyId, name, email, role, active, mfaEnabled, createdAt, updatedAt')
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    // Update operator_groups if provided
    if (groupIds !== undefined) {
      // Delete existing operator_groups
      await supabase.from('operator_groups').delete().eq('userId', id);

      // Insert new operator_groups
      if (groupIds.length > 0) {
        const operatorGroupsData = groupIds.map((groupId: string) => ({
          userId: id,
          groupId,
        }));
        await supabase.from('operator_groups').insert(operatorGroupsData);
      }
    }

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update user',
    });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user!;

    const { error } = await supabase
      .from('users')
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
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete user',
    });
  }
};

// Get operator groups
export const getOperatorGroups = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // userId
    const { companyId } = req.user!;

    // Verify user belongs to company
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .eq('companyId', companyId)
      .single();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const { data: operatorGroups, error } = await supabase
      .from('operator_groups')
      .select('*, groups(*)')
      .eq('userId', id);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      data: operatorGroups,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch operator groups',
    });
  }
};
