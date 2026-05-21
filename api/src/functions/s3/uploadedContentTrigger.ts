import { dynamoClient } from "@/clients/dynamoClient.js";
import { env } from "@/config/env.js";
import { response } from "@/utils/response.js";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { S3Event } from "aws-lambda";

export async function handler(event: S3Event) {
  try {
    console.log(event);
    
    const commands = event.Records.map((record) => {
      return new UpdateCommand({
        TableName: env.TABLE_NAME,
        Key: {
          fileKey: decodeURIComponent(record.s3.object.key),
        },
        UpdateExpression: "SET #status = :status REMOVE #expiresAt",
        ExpressionAttributeNames: {
          "#status": "status",
          "#expiresAt": "expiresAt",
        },
        ExpressionAttributeValues: {
          ":status": "completed",
        },
      });
    });

    await Promise.all(commands.map((command) => dynamoClient.send(command)));
    return response(200, { success: true });
  } catch (error) {
    console.error(error);
    return response(500, { success: false, error: "Internal server error" });
  }
}
