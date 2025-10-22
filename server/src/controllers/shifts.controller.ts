import { Request, Response } from 'express';
import supabase from '../config/supabase';

// Get all shifts for a company
export const getAllShifts = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;

    const { data: shifts, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('companyId', companyId)
      .order('createdAt', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      data: shifts,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch shifts',
    });
  }
};

// Get single shift by ID
export const getShiftById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user!;

    const { data: shift, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('id', id)
      .eq('companyId', companyId)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Shift not found',
      });
    }

    res.json({
      success: true,
      data: shift,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch shift',
    });
  }
};

// Create new shift
export const createShift = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { name, startTime, lunchTime, endTime, totalHours } = req.body;

    if (!name || !startTime || !lunchTime || !endTime || !totalHours) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required',
      });
    }

    const { data: shift, error } = await supabase
      .from('shifts')
      .insert({
        companyId,
        name,
        startTime,
        lunchTime,
        endTime,
        totalHours,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.status(201).json({
      success: true,
      data: shift,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create shift',
    });
  }
};

// Update shift
export const updateShift = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user!;
    const { name, startTime, lunchTime, endTime, totalHours } = req.body;

    const { data: shift, error } = await supabase
      .from('shifts')
      .update({
        name,
        startTime,
        lunchTime,
        endTime,
        totalHours,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('companyId', companyId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    if (!shift) {
      return res.status(404).json({
        success: false,
        error: 'Shift not found',
      });
    }

    res.json({
      success: true,
      data: shift,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update shift',
    });
  }
};

// Delete shift
export const deleteShift = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user!;

    const { error } = await supabase
      .from('shifts')
      .delete()
      .eq('id', id)
      .eq('companyId', companyId);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: 'Shift deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete shift',
    });
  }
};
