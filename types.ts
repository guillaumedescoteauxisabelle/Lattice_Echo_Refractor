
export enum PersonaType {
  Mia = 'Mia',
  Miette = 'Miette',
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    rewrite: string;
    mermaidDiagram?: string;
}