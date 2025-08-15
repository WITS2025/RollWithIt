const { mockClient } = require("aws-sdk-client-mock");
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

const ddbMock = mockClient(DynamoDBDocumentClient);
const lambda = require("../src/updatePackingListItem"); // adjust path as needed

describe("updatePackingListItem Lambda", () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it("returns 200 for OPTIONS preflight", async () => {
    const result = await lambda.handler({ httpMethod: "OPTIONS" });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe("");
  });

  it("returns 400 if listId is missing", async () => {
    const result = await lambda.handler({
      httpMethod: "POST",
      queryStringParameters: null,
      body: JSON.stringify({ index: 0, newItem: "Socks" }),
    });

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toBe("Missing 'listId'");
  });

  it("returns 400 for invalid JSON body", async () => {
    const result = await lambda.handler({
      httpMethod: "POST",
      queryStringParameters: { listId: "list-1" },
      body: "{not-json}",
    });

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toBe("Invalid JSON body");
  });

  it("returns 400 for missing or invalid index or newItem", async () => {
    const result = await lambda.handler({
      httpMethod: "POST",
      queryStringParameters: { listId: "list-1" },
      body: JSON.stringify({ index: "one", newItem: "" }),
    });

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toBe("Missing or invalid 'index' or 'newItem'");
  });

  it("returns 404 if list not found or items is not an array", async () => {
    ddbMock.on(GetCommand).resolves({ Item: null });

    const result = await lambda.handler({
      httpMethod: "POST",
      queryStringParameters: { listId: "list-1" },
      body: JSON.stringify({ index: 0, newItem: "Socks" }),
    });

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body)).toBe("List not found or invalid format");
  });

  it("returns 400 if index is out of bounds", async () => {
    ddbMock.on(GetCommand).resolves({ Item: { items: ["A", "B"] } });

    const result = await lambda.handler({
      httpMethod: "POST",
      queryStringParameters: { listId: "list-1" },
      body: JSON.stringify({ index: 5, newItem: "Z" }),
    });

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toBe("Index out of bounds");
  });

  it("returns 200 and updated attributes on success", async () => {
    ddbMock.on(GetCommand).resolves({ Item: { items: ["Socks", "Toothbrush"] } });
    ddbMock.on(UpdateCommand).resolves({ Attributes: { items: ["Shoes", "Toothbrush"] } });

    const result = await lambda.handler({
      httpMethod: "POST",
      queryStringParameters: { listId: "list-123" },
      body: JSON.stringify({ index: 0, newItem: "Shoes" }),
    });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ items: ["Shoes", "Toothbrush"] });
  });

  it("returns 500 on DynamoDB error", async () => {
    ddbMock.on(GetCommand).rejects(new Error("DynamoDB failure"));

    const result = await lambda.handler({
      httpMethod: "POST",
      queryStringParameters: { listId: "list-123" },
      body: JSON.stringify({ index: 0, newItem: "Hat" }),
    });

    expect(result.statusCode).toBe(500);
    const parsed = JSON.parse(result.body);
    expect(parsed.message).toBe("Internal Server Error");
    expect(parsed.error).toBe("DynamoDB failure");
  });
});