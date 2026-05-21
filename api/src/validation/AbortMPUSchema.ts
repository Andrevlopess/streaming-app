import z  from "zod";

export const AbortMPUSchema = z.object({
    fileKey: z.string().min(1),
    uploadId: z.string().min(1),
})

export type AbortMPUSchemaType = z.infer<typeof AbortMPUSchema>;