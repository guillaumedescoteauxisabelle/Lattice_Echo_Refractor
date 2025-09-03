import { PersonaType } from '../types';

export interface TTSVoiceConfig {
    voiceName: string;
    rate: number;
    pitch: number;
}

export const personaVoiceConfig: Record<PersonaType, TTSVoiceConfig> = {
    [PersonaType.Mia]: {
        voiceName: 'Google UK English Female',
        rate: 0.935,
        pitch: 0.9,
    },
    [PersonaType.Miette]: {
        voiceName: 'Google UK English Female',
        rate: 0.94,
        pitch: 1.3,
    },
};