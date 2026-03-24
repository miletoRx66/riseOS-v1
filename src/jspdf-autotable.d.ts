declare module "jspdf-autotable" {
  import { jsPDF } from "jspdf";

  interface AutoTableOptions {
    startY?: number;
    head?: any[][];
    body?: any[][];
    theme?: "striped" | "grid" | "plain";
    styles?: any;
    headStyles?: any;
    alternateRowStyles?: any;
    columnStyles?: any;
  }

  export default function autoTable(doc: jsPDF, options: AutoTableOptions): void;
}
