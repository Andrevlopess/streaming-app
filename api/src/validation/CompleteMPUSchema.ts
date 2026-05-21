import z from "zod";

export const CompleteMPUSchema = z.object({
  fileKey: z.string().min(1),
  uploadId: z.string().min(1),
  parts: z.array(
    z.object({
      partNumber: z.number().positive("Part number must be a positive integer"),
      ETag: z.string().min(1, "ETag is required"),
    }),
  ),
});

export type CompleteMPUSchemaType = z.infer<typeof CompleteMPUSchema>;
