
export enum PersonaType {
  Mia = 'Mia',
  Miette = 'Miette',
}

export interface ChatMessage {
    role: 'user' | 'model';
    rewrite: string;
    mermaidDiagram?: string;
}
