import { z } from 'zod';

export const PersonaEnum = z.enum(['patient', 'clinician']);
export type Persona = z.infer<typeof PersonaEnum>;

export const MilestoneSchema = z.object({
  id: z.string(),
  phase: z.string(),
  description: z.string(),
  tasks: z.array(z.string()),
});

export const PatientResponseSchema = z.object({
  simplifiedExplanation: z.string(),
  anxietyReliefTips: z.array(z.string()),
  costRange: z.object({
    min: z.number(),
    max: z.number(),
    notes: z.string(),
  }),
  recoveryTimeline: z.array(MilestoneSchema),
  precautions: z.array(z.string()),
});

export const ClinicianResponseSchema = z.object({
  clinicalIndications: z.array(z.string()),
  contraindications: z.array(z.string()),
  cdtCodes: z.array(z.object({
    code: z.string(),
    description: z.string()
  })),
  pharmacology: z.object({
    anesthesia: z.string(),
    prescriptions: z.array(z.string())
  }),
  soapNoteTemplate: z.object({
    subjective: z.string(),
    objective: z.string(),
    assessment: z.string(),
    plan: z.string()
  })
});

export const DentalResponseSchema = z.object({
  persona: PersonaEnum,
  patientData: PatientResponseSchema.optional(),
  clinicianData: ClinicianResponseSchema.optional(),
});

export type DentalResponse = z.infer<typeof DentalResponseSchema>;
