import { dialogueEarly } from "./dialogueEarly";
import { dialogueLate } from "./dialogueLate";
import { dialogueTrilogues } from "./dialogueTrilogues";
import { dialogueConnectionCases } from "./dialogueConnections";
import type { DialogueProfile } from "./dialogueTypes";

export const dialogueProfiles: Record<string, DialogueProfile> = {
  ...dialogueEarly,
  ...dialogueLate,
  ...dialogueTrilogues,
};

// Preserve the established studies alongside the newly edited conversations.
Object.entries(dialogueConnectionCases).forEach(([slug, study]) => {
  const profile = dialogueProfiles[slug];
  if (profile) profile.motifs = [...study.motifs, ...profile.motifs];
});

export function dialogueSlug(pathname: string) {
  const slug = pathname.replace(/\/$/, "").split("/").pop() ?? "";
  return slug === "dialogues" || slug === "cui-xiong-pian" ? "0" : slug;
}
