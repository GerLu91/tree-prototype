import {  type MaintenanceTask, type Tree } from "../types";

export const MOCK_TREES: Tree[] = [
  {
    id: "1",
    idNumber: "BA-0456",
    species: "Winter-Linde",
    latinName: "Tilia cordata",
    status: "maintenance",
    location: {
      lat: 49.4521,
      lng: 11.0767,
      address: "Stadtpark Nord, Sektor A"
    },
    lastMaintenance: "2023-05-12",
    nextCheck: "2024-05-21",
    height: 18,
    trunkCircumference: 120,
    notes: "Leichter Pilzbefall am Stammfuß, Beobachtung nötig.",
    image: "https://images.unsplash.com/photo-1596716564419-c9a51c690c16?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "2",
    idNumber: "BA-0312",
    species: "Spitz-Ahorn",
    latinName: "Acer platanoide",
    status: "warning",
    location: {
      lat: 49.4528,
      lng: 11.0775,
      address: "Stadtpark Nord, Hauptallee"
    },
    lastMaintenance: "2022-10-05",
    nextCheck: "2024-06-15",
    height: 15,
    trunkCircumference: 95,
    notes: "Totholz in der Krone (Durchmesser > 5cm).",
  },
  {
    id: "3",
    idNumber: "BA-0789",
    species: "Rosskastanie",
    latinName: "Aesculus hippocastanum",
    status: "critical",
    location: {
      lat: 49.4515,
      lng: 11.0760,
      address: "Stadtpark Nord, Spielplatz"
    },
    lastMaintenance: "2023-03-20",
    nextCheck: "2024-05-20",
    height: 12,
    trunkCircumference: 110,
    notes: "Starker Befall durch Miniermotte, Vitalität stark eingeschränkt.",
  },
  {
    id: "5", idNumber: "BA-1001", species: "Stiel-Eiche", status: "healthy",
    location: { lat: 49.4540, lng: 11.0750, address: "Stadtpark West" },
    nextCheck: "2025-06-01", height: 25, trunkCircumference: 210, notes: ""
  },
  {
    id: "6", idNumber: "BA-1002", species: "Hainbuche", status: "warning",
    location: { lat: 49.4545, lng: 11.0760, address: "Stadtpark West" },
    nextCheck: "2024-08-12", height: 14, trunkCircumference: 85, notes: "Kronenauslichtung nötig."
  },
  {
    id: "7", idNumber: "BA-1003", species: "Rot-Buche", status: "critical",
    location: { lat: 49.4550, lng: 11.0770, address: "Stadtpark Nord-West" },
    nextCheck: "2024-05-25", height: 20, trunkCircumference: 160, notes: "Starke Fäulnis am Stamm."
  },
  {
    id: "8", idNumber: "BA-1004", species: "Winter-Linde", status: "maintenance",
    location: { lat: 49.4530, lng: 11.0790, address: "Hauptallee" },
    nextCheck: "2024-05-22", height: 18, trunkCircumference: 115, notes: ""
  },
  {
    id: "9", idNumber: "BA-1005", species: "Spitz-Ahorn", status: "healthy",
    location: { lat: 49.4510, lng: 11.0780, address: "Süd-Eingang" },
    nextCheck: "2025-04-10", height: 16, trunkCircumference: 90, notes: ""
  },
  {
    id: "10", idNumber: "BA-1006", species: "Rosskastanie", status: "warning",
    location: { lat: 49.4518, lng: 11.0755, address: "Spielplatz Süd" },
    nextCheck: "2024-09-01", height: 13, trunkCircumference: 105, notes: "Bakterielle Infektion."
  },
  {
    id: "11", idNumber: "BA-1007", species: "Platane", status: "critical",
    location: { lat: 49.4542, lng: 11.0745, address: "Teichanlage" },
    nextCheck: "2024-05-28", height: 24, trunkCircumference: 195, notes: "Massiver Totholzanteil."
  },
  {
    id: "12", idNumber: "BA-1008", species: "Stiel-Eiche", status: "healthy",
    location: { lat: 49.4538, lng: 11.0778, address: "Liegewiese" },
    nextCheck: "2025-10-15", height: 28, trunkCircumference: 240, notes: ""
  },
  {
    id: "13", idNumber: "BA-1009", species: "Birke", status: "healthy",
    location: { lat: 49.4525, lng: 11.0740, address: "West-Pfad" },
    nextCheck: "2025-03-20", height: 12, trunkCircumference: 65, notes: ""
  },
  {
    id: "14", idNumber: "BA-1010", species: "Hainbuche", status: "maintenance",
    location: { lat: 49.4555, lng: 11.0765, address: "Nord-Ring" },
    nextCheck: "2024-05-22", height: 15, trunkCircumference: 78, notes: ""
  },
  {
    id: "15", idNumber: "BA-1011", species: "Berg-Ahorn", status: "warning",
    location: { lat: 49.4512, lng: 11.0772, address: "Süd-Allee" },
    nextCheck: "2024-11-05", height: 17, trunkCircumference: 110, notes: ""
  },
  {
    id: "16", idNumber: "BA-1012", species: "Winter-Linde", status: "healthy",
    location: { lat: 49.4529, lng: 11.0758, address: "Zentrum" },
    nextCheck: "2025-02-14", height: 19, trunkCircumference: 125, notes: ""
  },
  {
    id: "17", idNumber: "BA-1013", species: "Rot-Buche", status: "critical",
    location: { lat: 49.4548, lng: 11.0782, address: "Denkmal" },
    nextCheck: "2024-05-30", height: 22, trunkCircumference: 175, notes: "Brandkrustenpilz."
  },
  {
    id: "18", idNumber: "BA-1014", species: "Esche", status: "maintenance",
    location: { lat: 49.4532, lng: 11.0748, address: "Kiosk" },
    nextCheck: "2024-05-23", height: 16, trunkCircumference: 95, notes: ""
  },
  {
    id: "19", idNumber: "BA-1015", species: "Spitz-Ahorn", status: "healthy",
    location: { lat: 49.4508, lng: 11.0768, address: "Parkplatz" },
    nextCheck: "2025-07-12", height: 14, trunkCircumference: 82, notes: ""
  },
  {
    id: "20", idNumber: "BA-1016", species: "Rosskastanie", status: "warning",
    location: { lat: 49.4522, lng: 11.0788, address: "Ost-Weg" },
    nextCheck: "2024-12-01", height: 15, trunkCircumference: 118, notes: ""
  },
  {
    id: "21", idNumber: "BA-1017", species: "Eiche", status: "healthy",
    location: { lat: 49.4541, lng: 11.0795, address: "Nord-Ost-Ecke" },
    nextCheck: "2025-08-20", height: 26, trunkCircumference: 225, notes: ""
  },
  {
    id: "22", idNumber: "BA-1018", species: "Birke", status: "critical",
    location: { lat: 49.4516, lng: 11.0742, address: "Ententeich" },
    nextCheck: "2024-05-24", height: 11, trunkCircumference: 58, notes: "Stammbruchgefahr."
  },
  {
    id: "23", idNumber: "BA-1019", species: "Platane", status: "healthy",
    location: { lat: 49.4527, lng: 11.0771, address: "Brunnen" },
    nextCheck: "2025-01-30", height: 21, trunkCircumference: 165, notes: ""
  },
  {
    id: "24", idNumber: "BA-1020", species: "Hainbuche", status: "warning",
    location: { lat: 49.4539, lng: 11.0755, address: "Fitness-Parcours" },
    nextCheck: "2024-10-18", height: 13, trunkCircumference: 72, notes: ""
  }
];

export const MOCK_TASKS: MaintenanceTask[] = [
  {
    id: "t1",
    treeId: "1",
    type: "Kronenpflege",
    status: "in_arbeit",
    priority: "hoch",
    dueDate: "2024-05-21",
    duration: "1.5 h"
  },
  {
    id: "t2",
    treeId: "2",
    type: "Totholz entfernen",
    status: "offen",
    priority: "hoch",
    dueDate: "2024-05-21"
  },
  {
    id: "t3",
    treeId: "3",
    type: "Sicherung",
    status: "offen",
    priority: "mittel",
    dueDate: "2024-05-21"
  },
  {
    id: "t4",
    treeId: "4",
    type: "Lichtraumprofil",
    status: "erledigt",
    priority: "niedrig",
    dueDate: "2024-05-21",
    duration: "0.5 h",
    notes: "Standard-Schnitt durchgeführt.",
    woodChips: "0.5 Container"
  }
];