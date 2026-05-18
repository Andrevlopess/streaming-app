import { dynamoClient } from "@/clients/dynamoClient.js";
import { s3Client } from "@/clients/s3Client.js";
import { response } from "@/utils/response.js";
import { UploadSchema } from "@/validation/upload-schema.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { LambdaFunctionURLEvent } from "aws-lambda";
import { randomUUID } from "crypto";
import { env } from "process";
import { ZodError } from "zod";

export async function handler(event: LambdaFunctionURLEvent) {
  try {
    const body = JSON.parse(event.body || "{}");

    const parsed = UploadSchema.parse(body);
    const fileKey = `${randomUUID()}-${parsed.fileName}`;

    const putObjectCommand = new PutObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: fileKey,
    });
    const putItemCommand = new PutCommand({
      TableName: env.TABLE_NAME,
      Item: {
        fileKey,
        originalFileName: parsed.fileName,
      },
    });

    const signedUrl = await getSignedUrl(s3Client, putObjectCommand, { expiresIn: 3600 });
    await dynamoClient.send(putItemCommand);

    return response(200, { success: true, signedUrl });
  } catch (error) {
    console.error(error);
    
    if (error instanceof ZodError) {
      return response(400, {
        success: false,
        error: "Invalid input",
        details: error.issues[0]?.message,
      });
    }
    return response(500, { success: false, error: "Internal server error" });
  }
}
