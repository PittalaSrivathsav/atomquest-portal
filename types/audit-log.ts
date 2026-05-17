export type AuditAction = 
  | "create"
  | "update"
  | "delete"
  | "approve"
  | "reject"
  | "submit";

export type AuditEntityType = "goal" | "check_in";

export type AuditLog = {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  entityTitle?: string;
  previousValue?: Record<string, any>;
  newValue?: Record<string, any>;
  createdAt: string;
};
