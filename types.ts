
export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface ChatMessage {
  role: Role;
  content: string;
}
