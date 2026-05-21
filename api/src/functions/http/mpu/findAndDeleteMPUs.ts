import { s3Client } from "@/clients/s3Client.js";
import { response } from "@/utils/response.js";
import { AbortMultipartUploadCommand, ListMultipartUploadsCommand } from "@aws-sdk/client-s3";
import { env } from "process";
import { ZodError } from "zod";

export async function handler() {
  try {
    const listPendingMPUCommand = new ListMultipartUploadsCommand({
      Bucket: env.BUCKET_NAME,
    });

    const { Uploads } = await s3Client.send(listPendingMPUCommand);

    console.log(Uploads);

    if (!Uploads || Uploads.length === 0) {
      return response(204, { message: "No pending multipart uploads found" });
    }

    const promises = Uploads?.map((upload) => {
      const abortCmd = new AbortMultipartUploadCommand({
        Bucket: env.BUCKET_NAME,
        UploadId: upload.UploadId,
        Key: upload.Key,
      });

      return s3Client.send(abortCmd);
    });

    const res = await Promise.all(promises);
    console.log(res);

    return response(200, {
      deletedMPUs: Uploads?.map((upload) => ({
        fileKey: upload.Key,
        uploadId: upload.UploadId,
      })),
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
