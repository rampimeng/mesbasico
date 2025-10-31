import { Request, Response } from 'express';
import supabase from '../config/supabase';
import bcrypt from 'bcrypt';

// Generate unique dashboard token
const generateDashboardToken = (): string => {
  return `dash_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

// Get all companies (Master only)
export const getAllCompanies = async (req: Request, res: Response) => {
  try {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      data: companies,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch companies',
    });
  }
};

// Get single company by ID
export const getCompanyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Company not found',
      });
    }

    res.json({
      success: true,
      data: company,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch company',
    });
  }
};

// Create new company
export const createCompany = async (req: Request, res: Response) => {
  try {
    const { name, cnpj, email, contactName, contactPhone, logoUrl, adminEmail, adminName, adminPassword } = req.body;

    // Validate required fields
    if (!name || !cnpj || !email || !contactName || !contactPhone || !adminEmail || !adminName || !adminPassword) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    // Generate dashboard token
    const dashboardToken = generateDashboardToken();

    // Create company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name,
        cnpj,
        email,
        contactName,
        contactPhone,
        logoUrl: logoUrl || null,
        dashboardToken,
        active: true,
        enabledModules: [], // Inicializa sem módulos habilitados
      })
      .select()
      .single();

    if (companyError) {
      return res.status(400).json({
        success: false,
        error: companyError.message,
      });
    }

    // Hash admin password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user for the company
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .insert({
        companyId: company.id,
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        active: true,
        mfaEnabled: false,
      })
      .select()
      .single();

    if (adminError) {
      // Rollback: delete company if admin creation fails
      await supabase.from('companies').delete().eq('id', company.id);

      return res.status(400).json({
        success: false,
        error: adminError.message,
      });
    }

    res.status(201).json({
      success: true,
      data: {
        company,
        adminUser: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
        },
      },
      message: 'Company and admin user created successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create company',
    });
  }
};

// Update company
export const updateCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, cnpj, email, contactName, contactPhone, logoUrl, active } = req.body;

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (cnpj !== undefined) updateData.cnpj = cnpj;
    if (email !== undefined) updateData.email = email;
    if (contactName !== undefined) updateData.contactName = contactName;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (active !== undefined) updateData.active = active;

    const { data: company, error } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      data: company,
      message: 'Company updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update company',
    });
  }
};

// Toggle company active status
export const toggleCompanyStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get current status
    const { data: company, error: fetchError } = await supabase
      .from('companies')
      .select('active')
      .eq('id', id)
      .single();

    if (fetchError) {
      return res.status(404).json({
        success: false,
        error: 'Company not found',
      });
    }

    // Toggle status
    const { data: updatedCompany, error: updateError } = await supabase
      .from('companies')
      .update({
        active: !company.active,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({
        success: false,
        error: updateError.message,
      });
    }

    res.json({
      success: true,
      data: updatedCompany,
      message: `Company ${updatedCompany.active ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to toggle company status',
    });
  }
};

// Change admin password for a company
export const changeAdminPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
      });
    }

    // Find admin user for the company
    const { data: adminUser, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('companyId', id)
      .eq('role', 'ADMIN')
      .single();

    if (findError || !adminUser) {
      return res.status(404).json({
        success: false,
        error: 'Admin user not found for this company',
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password: hashedPassword,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', adminUser.id);

    if (updateError) {
      return res.status(400).json({
        success: false,
        error: updateError.message,
      });
    }

    res.json({
      success: true,
      message: 'Admin password changed successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to change admin password',
    });
  }
};

// Toggle PDCA feature for a company
export const togglePDCA = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get current PDCA status
    const { data: company, error: fetchError } = await supabase
      .from('companies')
      .select('pdcaEnabled')
      .eq('id', id)
      .single();

    if (fetchError) {
      return res.status(404).json({
        success: false,
        error: 'Company not found',
      });
    }

    // Toggle PDCA status
    const { data: updatedCompany, error: updateError } = await supabase
      .from('companies')
      .update({
        pdcaEnabled: !company.pdcaEnabled,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({
        success: false,
        error: updateError.message,
      });
    }

    res.json({
      success: true,
      data: updatedCompany,
      message: `PDCA feature ${updatedCompany.pdcaEnabled ? 'enabled' : 'disabled'} successfully`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to toggle PDCA feature',
    });
  }
};

// Toggle module for a company (enable/disable MES, QUALITY, etc.)
export const toggleModule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { module } = req.body;

    if (!module || typeof module !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Module name is required',
      });
    }

    // Get current enabledModules
    const { data: company, error: fetchError } = await supabase
      .from('companies')
      .select('enabledModules')
      .eq('id', id)
      .single();

    if (fetchError) {
      return res.status(404).json({
        success: false,
        error: 'Company not found',
      });
    }

    // Parse enabledModules (it comes as JSON)
    let enabledModules: string[] = [];
    if (company.enabledModules) {
      enabledModules = Array.isArray(company.enabledModules)
        ? company.enabledModules
        : JSON.parse(company.enabledModules as any);
    }

    // Toggle module
    const moduleIndex = enabledModules.indexOf(module);
    if (moduleIndex > -1) {
      // Module is enabled, disable it
      enabledModules.splice(moduleIndex, 1);
    } else {
      // Module is disabled, enable it
      enabledModules.push(module);
    }

    // Update company
    const { data: updatedCompany, error: updateError } = await supabase
      .from('companies')
      .update({
        enabledModules: enabledModules,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({
        success: false,
        error: updateError.message,
      });
    }

    res.json({
      success: true,
      data: updatedCompany,
      message: `Module "${module}" ${moduleIndex > -1 ? 'disabled' : 'enabled'} successfully`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to toggle module',
    });
  }
};

// Delete company (soft delete by setting active to false)
export const deleteCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: 'Company deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete company',
    });
  }
};
