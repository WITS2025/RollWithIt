const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
};

exports.handler = async (event) => {
  console.log("Event received:", event);

  const params = {
    TableName: "roll_with_it",
  };

  try {
    const data = await ddbDocClient.send(new ScanCommand(params));
    console.log("Scan success:", data);

    if (!data.Items || data.Items.length === 0) {
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify([]),
      };
    }
    const packingLists = (data.Items || []).filter(item => item.pk !== "theme");

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(packingLists),
    };
  } catch (err) {
    console.error("Error retrieving items from DynamoDB", err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify("Error retrieving items from DynamoDB"),
    };
  }
};   
