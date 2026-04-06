import crypto from 'crypto';
import prisma from './prisma';

export interface AuditLogEntry {
  adminId: number;
  adminRole: string;
  actionType: string;
  targetUserId?: number;
  previousValue?: unknown;
  newValue?: unknown;
  reason?: string;
  ipAddress?: string;
  deviceInfo?: string;
  twoFactorConfirmed?: boolean;
  metadata?: Record<string, unknown>;
}

export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  const p = prisma as any;

  // Get the previous log's chainHash to build the chain
  const lastLog = await p.auditLog.findFirst({
    orderBy: { id: 'desc' },
    select: { chainHash: true },
  });
  const previousHash = lastLog?.chainHash ?? (process.env.AUDIT_LOG_HASH_SEED ?? 'genesis');

  // Build deterministic string to hash
  const content = JSON.stringify({
    adminId: entry.adminId,
    adminRole: entry.adminRole,
    actionType: entry.actionType,
    targetUserId: entry.targetUserId ?? null,
    previousValue: entry.previousValue ?? null,
    newValue: entry.newValue ?? null,
    reason: entry.reason ?? '',
    ipAddress: entry.ipAddress ?? '',
    timestamp: new Date().toISOString(),
  });

  const chainHash = crypto
    .createHash('sha256')
    .update(content + previousHash)
    .digest('hex');

  await p.auditLog.create({
    data: {
      adminId: entry.adminId,
      adminRole: entry.adminRole,
      actionType: entry.actionType,
      targetUserId: entry.targetUserId ?? null,
      previousValue: (entry.previousValue ?? null) as any,
      newValue: (entry.newValue ?? null) as any,
      reason: entry.reason ?? '',
      ipAddress: entry.ipAddress ?? '',
      deviceInfo: entry.deviceInfo ?? '',
      twoFactorConfirmed: entry.twoFactorConfirmed ?? false,
      metadata: (entry.metadata ?? {}) as any,
      chainHash,
      previousHash,
    },
  });
}
