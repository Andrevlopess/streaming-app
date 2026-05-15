import z  from "zod";

export const UploadSchema = z.object({
    fileName: z.string(),
})

export type UploadSchemaType = z.infer<typeof UploadSchema>;