export interface Patient {
  chat_id: string;
  name: string;
  last_access?: string;
  first_access?: string;
  language?: string;
  preferences?: any;
}

export interface PatientSummary {
  chat_id: string;
  name: string;
  last_access?: string;
  issue_description: string;
  action_type: 'urgent' | 'review' | 'positive';
  churn_score: number;
  churn_risk_level: 'low' | 'medium' | 'high';
}

export interface PatientListItem {
  chat_id: string;
  name: string;
  last_access?: string;
  churn_score: number;
  churn_risk_level: 'low' | 'medium' | 'high';
}

export interface PatientDetail extends Patient {
  churn_info: ChurnInfo;
  diets: Diet[];
  health_metrics: HealthMetric[];
  food_analyses: FoodAnalysis[];
  psychological_metrics: PsychologicalMetric[];
}

export interface Diet {
  id: number;
  chat_id: string;
  creation_date: string;
  diet_data?: any;
  status?: string;
}

export interface HealthMetric {
  id?: number;
  chat_id: string;
  record_date: string;
  weight?: number;
  hrv?: number;
  body_fat?: number;
  muscle_mass?: number;
  notes?: string;
}

export interface FoodAnalysis {
  id?: number;
  chat_id: string;
  analysis_date: string;
  food_items?: any;
  feedback?: string;
  score?: number;
}

export interface ChurnInfo {
  score: number;
  risk_level: 'low' | 'medium' | 'high';
  details: {
    last_access_score: number;
    interaction_score: number;
    goal_score: number;
    feedback_score: number;
    metrics_score: number;
  };
}

export interface PsychologicalMetric {
  id: number;
  chat_id: string;
  analysis_date: string;
  source_type: 'text' | 'voice';
  source_content?: string;
  emotion_scores: { [key: string]: number };
  dominant_emotion: string;
  sentiment_score: number;
  mood_state: 'positive' | 'negative' | 'neutral' | 'anxious' | 'mixed';
  notes?: string;
  created_at: string;
}

