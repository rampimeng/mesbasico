import { Request, Response } from 'express';
import supabase from '../config/supabase';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos PDF são permitidos'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  }
});

// Upload a new file
export const uploadFile = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { name, description, groupIds } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo foi enviado',
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Nome do arquivo é obrigatório',
      });
    }

    console.log('📤 Uploading file:', { name, companyId, fileSize: file.size, groupIds });

    // Create file record
    const { data: fileRecord, error: fileError } = await supabase
      .from('files')
      .insert({
        companyId,
        name,
        description: description || null,
        fileUrl: `/uploads/${file.filename}`,
        fileSize: file.size,
        mimeType: file.mimetype,
      })
      .select()
      .single();

    if (fileError) {
      console.error('❌ Error creating file record:', fileError);
      // Delete uploaded file if database insert fails
      fs.unlinkSync(file.path);
      return res.status(500).json({
        success: false,
        error: fileError.message,
      });
    }

    // Link file to groups if specified
    if (groupIds && groupIds.length > 0) {
      const groupIdArray = JSON.parse(groupIds);
      const fileGroupsData = groupIdArray.map((groupId: string) => ({
        fileId: fileRecord.id,
        groupId,
      }));

      const { error: linkError } = await supabase
        .from('file_groups')
        .insert(fileGroupsData);

      if (linkError) {
        console.error('❌ Error linking file to groups:', linkError);
        // Don't fail the request, just log the error
      } else {
        console.log(`✅ File linked to ${groupIdArray.length} groups`);
      }
    }

    res.status(201).json({
      success: true,
      data: fileRecord,
      message: 'Arquivo enviado com sucesso',
    });
  } catch (error: any) {
    console.error('❌ Exception in uploadFile:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao enviar arquivo',
    });
  }
};

// Get all files for admin
export const getAllFiles = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;

    console.log('📂 Fetching all files for company:', companyId);

    const { data: files, error } = await supabase
      .from('files')
      .select(`
        *,
        file_groups (
          groupId,
          group:groups (
            id,
            name
          )
        )
      `)
      .eq('companyId', companyId)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('❌ Error fetching files:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    // Format response
    const formattedFiles = (files || []).map(file => ({
      ...file,
      groups: file.file_groups?.map((fg: any) => fg.group) || [],
      groupIds: file.file_groups?.map((fg: any) => fg.groupId) || [],
    }));

    console.log(`✅ Found ${formattedFiles.length} files`);

    res.json({
      success: true,
      data: formattedFiles,
    });
  } catch (error: any) {
    console.error('❌ Exception in getAllFiles:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar arquivos',
    });
  }
};

// Get files for operator (only files linked to their groups)
export const getOperatorFiles = async (req: Request, res: Response) => {
  try {
    const { companyId, id: userId } = req.user!;

    console.log('📂 Fetching files for operator:', { userId, companyId });

    // Get operator's groups
    const { data: operatorGroups, error: groupError } = await supabase
      .from('operator_groups')
      .select('groupId')
      .eq('userId', userId);

    if (groupError) {
      console.error('❌ Error fetching operator groups:', groupError);
      return res.status(500).json({
        success: false,
        error: groupError.message,
      });
    }

    const groupIds = operatorGroups?.map((og: any) => og.groupId) || [];

    if (groupIds.length === 0) {
      console.log('⚠️ Operator has no groups');
      return res.json({
        success: true,
        data: [],
      });
    }

    // Get files linked to these groups
    const { data: fileGroups, error: fileGroupError } = await supabase
      .from('file_groups')
      .select(`
        fileId,
        file:files (
          id,
          name,
          description,
          fileUrl,
          fileSize,
          mimeType,
          createdAt
        )
      `)
      .in('groupId', groupIds);

    if (fileGroupError) {
      console.error('❌ Error fetching file groups:', fileGroupError);
      return res.status(500).json({
        success: false,
        error: fileGroupError.message,
      });
    }

    // Get unique files (a file may be linked to multiple groups the operator has)
    const filesMap = new Map();
    for (const fg of fileGroups || []) {
      if (fg.file && !filesMap.has(fg.file.id)) {
        filesMap.set(fg.file.id, fg.file);
      }
    }

    const files = Array.from(filesMap.values());
    console.log(`✅ Found ${files.length} files for operator`);

    res.json({
      success: true,
      data: files,
    });
  } catch (error: any) {
    console.error('❌ Exception in getOperatorFiles:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar arquivos',
    });
  }
};

// Delete a file
export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user!;

    console.log('🗑️ Deleting file:', { id, companyId });

    // Get file info before deleting
    const { data: file, error: fetchError } = await supabase
      .from('files')
      .select('fileUrl')
      .eq('id', id)
      .eq('companyId', companyId)
      .single();

    if (fetchError || !file) {
      return res.status(404).json({
        success: false,
        error: 'Arquivo não encontrado',
      });
    }

    // Delete file record (cascade will delete file_groups)
    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', id)
      .eq('companyId', companyId);

    if (error) {
      console.error('❌ Error deleting file:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    // Delete physical file
    try {
      const filePath = path.join(__dirname, '../../', file.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('✅ Physical file deleted');
      }
    } catch (fsError) {
      console.error('⚠️ Error deleting physical file:', fsError);
      // Don't fail the request if physical file deletion fails
    }

    res.json({
      success: true,
      message: 'Arquivo deletado com sucesso',
    });
  } catch (error: any) {
    console.error('❌ Exception in deleteFile:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao deletar arquivo',
    });
  }
};

// Update file (mainly for updating linked groups)
export const updateFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user!;
    const { name, description, groupIds } = req.body;

    console.log('🔄 Updating file:', { id, companyId, name, groupIds });

    // Update file basic info
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    updateData.updatedAt = new Date().toISOString();

    const { data: file, error } = await supabase
      .from('files')
      .update(updateData)
      .eq('id', id)
      .eq('companyId', companyId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating file:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    // Update group links if specified
    if (groupIds !== undefined) {
      // Delete existing links
      await supabase
        .from('file_groups')
        .delete()
        .eq('fileId', id);

      // Create new links
      if (groupIds.length > 0) {
        const fileGroupsData = groupIds.map((groupId: string) => ({
          fileId: id,
          groupId,
        }));

        const { error: linkError } = await supabase
          .from('file_groups')
          .insert(fileGroupsData);

        if (linkError) {
          console.error('❌ Error updating file groups:', linkError);
        } else {
          console.log(`✅ File linked to ${groupIds.length} groups`);
        }
      }
    }

    res.json({
      success: true,
      data: file,
      message: 'Arquivo atualizado com sucesso',
    });
  } catch (error: any) {
    console.error('❌ Exception in updateFile:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao atualizar arquivo',
    });
  }
};
