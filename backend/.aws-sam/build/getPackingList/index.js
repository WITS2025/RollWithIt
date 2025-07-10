import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*", // Replace "*" with your frontend URL in production
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "PUT,OPTIONS",
};


export const handler = async (event) => {
  console.log("Event:", event);
  const listId = event?.queryStringParameters?.listId;

  if (!listId) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Missing 'listId'" }),
    };
  }

  try {
    const data = await ddbDocClient.send(new GetCommand({
      TableName: "roll_with_it",
      Key: { pk: listId }
    }));

    if (!data.Item) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Item not found" }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data.Item),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
