export type HourAppUsage = {
  packageName: string;
  appName: string;
  totalTimeMs: number;
};

export type UsageByHour = Record<number, HourAppUsage[]>;