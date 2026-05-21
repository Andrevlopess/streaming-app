import { s3Client } from "@/clients/s3Client.js";
import { response } from "@/utils/response.js";
import { InitMPUSchema } from "@/validation/InitMPUSchema.js";
import { CreateMultipartUploadCommand, UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { LambdaFunctionURLEvent } from "aws-lambda";
import { randomUUID } from "crypto";
import { env } from "process";
import { ZodError } from "zod";

export async function handler(event: LambdaFunctionURLEvent) {
  try {
    const body = JSON.parse(event.body || "{}");

    const parsed = InitMPUSchema.parse(body);
    const fileKey = `uploads/${randomUUID()}-${parsed.fileName}`;

    const createMultipartUploadCommand = new CreateMultipartUploadCommand({
      Bucket: env.BUCKET_NAME,
      Key: fileKey,
    });

    const { UploadId } = await s3Client.send(createMultipartUploadCommand);

    if (!UploadId) {
      return response(500, { error: "Failed to initiate multipart upload" });
    }

    const signedUrlPromises: Promise<string>[] = [];
    for (let i = 1; i <= parsed.totalChunks; i++) {
      const uploadPartCommand = new UploadPartCommand({
        Bucket: env.BUCKET_NAME,
        Key: fileKey,
        PartNumber: i,
        UploadId,
      });

      signedUrlPromises.push(getSignedUrl(s3Client, uploadPartCommand, { expiresIn: 3600 }));
    }
    const partsUrls = await Promise.all(signedUrlPromises);

    return response(201, {
      fileKey,
      uploadId: UploadId,
      parts: partsUrls.map((url, index) => ({ partNumber: index + 1, url })),
    });
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
