import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

export const handler = async (event) => {
  console.info("Event received:", event);

  const listId = event.queryStringParameters?.listId;
  if (!listId) {
    return {
      statusCode: 400,
      body: JSON.stringify("Missing 'listId'"),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify("Invalid JSON body"),
    };
  }

  const { name } = body;
  if (!name || typeof name !== "string") {
    return {
      statusCode: 400,
      body: JSON.stringify("Missing or invalid 'name'"),
    };
  }

  const params = {
    TableName: "roll_with_it",
    Key: { pk: listId },
    UpdateExpression: "SET #title = :val",
    ExpressionAttributeNames: { "#title": "title" },
    ExpressionAttributeValues: { ":val": name },
    ReturnValues: "UPDATED_NEW",
  };

  try {
    const result = await ddbDocClient.send(new UpdateCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    };
  } catch (err) {
    console.error("Error updating title:", err);
    return {
      statusCode: 500,
      body: JSON.stringify("Internal Server Error"),
    };
  }
};