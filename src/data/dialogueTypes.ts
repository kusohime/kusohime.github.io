export type DialogueSpeaker = { name: string; self: boolean };

export type DialogueMotif = {
  from: string;
  to: string;
  fromSpeaker?: string;
  toSpeaker?: string;
  label: string;
  side?: "left" | "right";
  /** An associative/metaphorical reading rather than a direct recurrence. */
  dotted?: boolean;
};

export type DialogueProfile = {
  keyword: { zh: string; en: string };
  speakerAliases?: Record<string, DialogueSpeaker>;
  unknownSpeakers?: DialogueSpeaker[];
  messageSpeakers?: Record<number, DialogueSpeaker>;
  replies?: Array<Omit<DialogueMotif, "label">>;
  motifs: DialogueMotif[];
};
