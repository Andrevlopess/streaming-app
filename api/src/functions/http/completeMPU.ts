import { s3Client } from "@/clients/s3Client.js";
import { response } from "@/utils/response.js";
import { CompleteMPUSchema } from "@/validation/CompleteMPUSchema.js";
import { CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import type { LambdaFunctionURLEvent } from "aws-lambda";
import { env } from "process";
import { ZodError } from "zod";

export async function handler(event: LambdaFunctionURLEvent) {
  try {
    const body = JSON.parse(event.body || "{}");

    const { fileKey, uploadId, parts } = CompleteMPUSchema.parse(body);

    const createMultipartUploadCommand = new CompleteMultipartUploadCommand({
      Bucket: env.BUCKET_NAME,
      Key: fileKey,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map((part) => ({
          PartNumber: part.partNumber,
          ETag: part.ETag,
        })),
      },
    });

    await s3Client.send(createMultipartUploadCommand);

    return response(204);

  } catch (error) {
    console.error(error);

    if (error instanceof ZodError) {
      return response(400, {
        error: "Invalid input",
        details: error.issues[0]?.message,
      });
    }
    return response(500, { error: "Internal server error" });
  }
}
