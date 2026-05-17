import * as xlsx from "xlsx";
import type { AdminReportRow } from "@/actions/admin";

export function exportToCSV(data: AdminReportRow[], filename: string = "reports.csv") {
  const ws = xlsx.utils.json_to_sheet(formatDataForExport(data));
  const csvOutput = xlsx.utils.sheet_to_csv(ws);
  
  const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
  downloadFile(blob, filename);
}

export function exportToExcel(data: AdminReportRow[], filename: string = "reports.xlsx") {
  const ws = xlsx.utils.json_to_sheet(formatDataForExport(data));
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Reports");
  
  const excelBuffer = xlsx.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  downloadFile(blob, filename);
}

function formatDataForExport(data: AdminReportRow[]) {
  return data.map((row) => ({
    "Employee Name": row.employeeName,
    "Employee Email": row.employeeEmail,
    "Quarter": `${row.quarter} ${row.year}`,
    "Goal Title": row.goalTitle,
    "Goal Status": formatStatus(row.goalStatus),
    "Priority": formatStatus(row.goalPriority),
    "Progress (%)": row.goalProgress,
    "Planned": row.plannedValue,
    "Actual": row.actualValue,
    "Check-In Status": formatStatus(row.checkInStatus),
  }));
}

function formatStatus(status: string) {
  if (!status) return "";
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
