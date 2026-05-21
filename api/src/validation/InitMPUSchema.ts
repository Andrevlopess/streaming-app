import z  from "zod";

export const InitMPUSchema = z.object({
    fileName: z.string("File name is required").min(1, "File name cannot be empty"),
    totalChunks: z.number("Total chunks is required").positive("Total chunks must be a positive integer"),
})

export type InitMPUSchemaType = z.infer<typeof InitMPUSchema>;