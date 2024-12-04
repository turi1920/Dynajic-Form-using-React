export type FormType = 'userInfo' | 'address' | 'payment';

export interface FormField {
  name: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
}

export interface FormData {
  [key: string]: string;
}

export interface ApiResponse {
  fields: FormField[];
}
