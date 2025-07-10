import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  if (event.requestContext?.http?.method !== "POST") {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify("Method Not Allowed"),
    };
  }

  const listId = event.queryStringParameters?.listId;
  if (!listId) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify("Missing 'listId'"),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify("Invalid JSON body"),
    };
  }

  const { index, newItem } = body;
  if (typeof index !== "number" || typeof newItem !== "string" || !newItem.trim()) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify("Missing or invalid 'index' or 'newItem'"),
    };
  }

  try {
    // 1. Get the current items
    const getParams = {
      TableName: "roll_with_it",
      Key: { pk: listId },
      ProjectionExpression: "#it",
      ExpressionAttributeNames: { "#it": "items" },
    };

    const getResult = await ddbDocClient.send(new GetCommand(getParams));
    const currentItems = getResult.Item?.items;

    if (!Array.isArray(currentItems)) {
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify("List not found or invalid format"),
      };
    }

    if (index < 0 || index >= currentItems.length) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify("Index out of bounds"),
      };
    }

    // 2. Replace the item at the index
    const updatedItems = [...currentItems];
    updatedItems[index] = newItem;

    // 3. Save the updated list
    const updateParams = {
      TableName: "roll_with_it",
      Key: { pk: listId },
      UpdateExpression: "SET #it = :items",
      ExpressionAttributeNames: { "#it": "items" },
      ExpressionAttributeValues: { ":items": updatedItems },
      ReturnValues: "UPDATED_NEW",
    };

    const updateResult = await ddbDocClient.send(new UpdateCommand(updateParams));

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(updateResult.Attributes),
    };
  } catch (err) {
    console.error("Error updating item:", err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        message: "Internal Server Error",
        error: err.message,
        stack: err.stack,
      }),
    };
  }
};