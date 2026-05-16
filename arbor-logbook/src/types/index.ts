export type TreeStatus = 'healthy' | 'warning' | 'critical' | 'maintenance';

export interface Tree {
  id: string;
  idNumber: string;
  species: string;
  latinName?: string;
  status: TreeStatus;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  lastMaintenance?: string;
  nextCheck: string;
  height: number;
  trunkCircumference: number;
  notes: string;
  image?: string;
}

export interface MaintenanceTask {
  id: string;
  treeId: string;
  type: 'Kronenpflege' | 'Totholz entfernen' | 'Fällung' | 'Kontrolle' | 'Sicherung' | 'Lichtraumprofil'; // Lichtraumprofil ergänzt
  status: 'offen' | 'in_arbeit' | 'erledigt';
  priority: 'hoch' | 'mittel' | 'niedrig';
  assignedTo?: string;
  dueDate: string;
  duration?: string;
  notes?: string; // <--- DIESE ZEILE HAT GEFEHLT
  woodChips?: string; // Optional, da erst beim Abschluss gefüllt
  image?: string;     // Optional, da erst beim Abschluss gefüllt
}

export interface DailyReport {
  id: string;
  date: string;
  tasks: MaintenanceTask[];
  totalHours: number;
  treeCount: number;
}