import { Request, Response } from 'express';
import prisma from '../config/database';
import { comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { sendSuccess, sendError, sendUnauthorized } from '../utils/response';
import { LoginRequest, LoginResponse } from '../types';

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password, mfaCode }: LoginRequest = req.body;

      // Validação básica
      if (!email || !password) {
        return sendError(res, 'Email and password are required');
      }

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          company: true,
        },
      });

      if (!user) {
        return sendUnauthorized(res, 'Invalid credentials');
      }

      // Verificar se o usuário está ativo
      if (!user.active) {
        return sendUnauthorized(res, 'User account is disabled');
      }

      // Verificar senha
      const passwordMatch = await comparePassword(password, user.password);
      if (!passwordMatch) {
        return sendUnauthorized(res, 'Invalid credentials');
      }

      // Verificar se a empresa está ativa (exceto para MASTER)
      if (user.role !== 'MASTER' && user.company && !user.company.active) {
        return sendUnauthorized(res, 'Company account is disabled');
      }

      // Verificar MFA se necessário
      if (user.mfaEnabled) {
        if (!mfaCode) {
          return sendError(res, 'MFA code is required', 400);
        }
        // TODO: Implementar verificação real de MFA (TOTP)
        // Por enquanto, aceita qualquer código para demonstração
        if (mfaCode !== '123456') {
          return sendUnauthorized(res, 'Invalid MFA code');
        }
      }

      // Gerar token JWT
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId || undefined,
      });

      // Registrar login no audit log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          companyId: user.companyId,
          action: 'LOGIN',
          entityType: 'User',
          entityId: user.id,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });

      // Preparar resposta
      const response: LoginResponse = {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId || undefined,
        },
      };

      if (user.company) {
        response.company = {
          id: user.company.id,
          name: user.company.name,
          logoUrl: user.company.logoUrl || undefined,
          dashboardToken: user.company.dashboardToken,
        };
      }

      return sendSuccess(res, response, 'Login successful');
    } catch (error) {
      console.error('Login error:', error);
      return sendError(res, 'An error occurred during login', 500);
    }
  }

  async logout(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendUnauthorized(res);
      }

      // Registrar logout no audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          companyId: req.user.companyId,
          action: 'LOGOUT',
          entityType: 'User',
          entityId: req.user.id,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });

      return sendSuccess(res, null, 'Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      return sendError(res, 'An error occurred during logout', 500);
    }
  }

  async me(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendUnauthorized(res);
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          companyId: true,
          company: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              dashboardToken: true,
              active: true,
            },
          },
        },
      });

      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      return sendSuccess(res, user);
    } catch (error) {
      console.error('Me error:', error);
      return sendError(res, 'An error occurred', 500);
    }
  }
}
