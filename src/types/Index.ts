export interface FileItem extends File {
    id?: string;
  }
  
  export interface Message {
    id: number;
    text: string;
    sender: 'user' | 'assistant';
    timestamp: Date;
    files?: FileItem[];
  }