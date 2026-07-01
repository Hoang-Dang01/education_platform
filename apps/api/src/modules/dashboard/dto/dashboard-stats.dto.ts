export class KpiDto {
  title: string;
  value: string;
  desc: string;
  color: string;
  icon: string;
}

export class DashboardStatsResponseDto {
  role: string;
  kpis: KpiDto[];
}
