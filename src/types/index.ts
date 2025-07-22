export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface CodeReview {
  id: string;
  user_id: string;
  code_content: string;
  review_result: string;
  language: string;
  filename?: string;
  created_at: string;
  updated_at: string;
  table_structures?: string;
  data_volume?: string;
}

export interface ApprovalRequest {
  id: string;
  email: string;
  reason: string;
  status: string;
  password?: string;
  password?: string;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
  approval_token?: string;
  approval_token?: string;
}

export interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}