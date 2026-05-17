export type Quarter = "Q1" | "Q2" | "Q3" | "Q4";
export type CheckInStatus = "not_started" | "on_track" | "completed";

export type CheckIn = {
  id: string;
  userId: string;
  goalId: string;
  goalTitle?: string; // Optional populated field for UI
  quarter: Quarter;
  year: number;
  plannedValue: number;
  actualValue: number;
  status: CheckInStatus;
  employeeComment?: string;
  managerComment?: string;
  createdAt: Date;
  updatedAt: Date;
};
