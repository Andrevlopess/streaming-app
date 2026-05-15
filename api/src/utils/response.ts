import type { APIGatewayProxyStructuredResultV2 } from "aws-lambda";

export function response(statusCode: number, body?: Record<string, any>): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode: statusCode,
    body: body && JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  };
}
