export interface AnalyticsOverview {
  total_patients: number;
  active_patients: number;
  new_patients_last_month: number;
  average_churn_score: number;
  patients_by_risk_level: { [key: string]: number };
}

export interface ComplianceStats {
  average_compliance: number;
  compliance_trend: Array<{ date: string; compliance: number }>;
  patients_above_threshold: number;
  patients_below_threshold: number;
}

export interface WeightLossStats {
  total_weight_loss: number;
  average_weight_loss_per_patient: number;
  patients_with_progress: number;
  patients_without_progress: number;
  weight_loss_trend: Array<{ date: string; average_weight_loss: number }>;
}

export interface PlanEffectiveness {
  most_effective_plan_type: string;
  plan_success_rate: { [key: string]: number };
  average_duration: { [key: string]: number };
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  compliance: ComplianceStats;
  weight_loss: WeightLossStats;
  plan_effectiveness: PlanEffectiveness;
}

