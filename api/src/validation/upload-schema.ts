import z  from "zod";

export const UploadSchema = z.object({
    fileName: z.string("File name is required").min(1, "File name cannot be empty"),
})

export type UploadSchemaType = z.infer<typeof UploadSchema>;