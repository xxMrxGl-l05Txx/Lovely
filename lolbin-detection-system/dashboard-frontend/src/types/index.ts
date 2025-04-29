export interface LOLBin {
  name: string;
  description: string;
  mitreTechniques: string[];
  path: string;
  type: "binary" | "script" | "library";
  riskLevel: "critical" | "high" | "medium" | "low";
}

export interface DetectionAlert {
  id: string;
  timestamp: number;
  lolbin: LOLBin;
  process: string;
  command: string;
  status: "new" | "acknowledged" | "mitigated" | "false-positive";
  details: string;
  affectedSystem: string;
}

export interface MitreTechnique {
  id: string;
  name: string;
  description: string;
  url: string;
  mitigation: string;
}

export interface ChartData {
  name: string;
  value: number;
}