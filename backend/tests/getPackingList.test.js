const { mockClient } = require("aws-sdk-client-mock");
const {
  DynamoDBDocumentClient,
  GetCommand,
} = require("@aws-sdk/lib-dynamodb");

const ddbMock = mockClient(DynamoDBDocumentClient);

// Adjust this path based on where your actual Lambda is
const lambda = require("../src/getPackingList");

describe("getPackingList Lambda", () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it("returns 400 if listId is missing", async () => {
    const result = await lambda.handler({ queryStringParameters: null });

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({ error: "Missing 'listId'" });
  });

  it("returns 404 if item is not found", async () => {
    ddbMock.on(GetCommand).resolves({ Item: undefined });

    const result = await lambda.handler({ queryStringParameters: { listId: "list-123" } });

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body)).toEqual({ error: "Item not found" });
  });

  it("returns 200 and the item if found", async () => {
    const mockItem = { pk: "list-123", items: ["Toothbrush", "Shoes"] };
    ddbMock.on(GetCommand).resolves({ Item: mockItem });

    const result = await lambda.handler({ queryStringParameters: { listId: "list-123" } });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(mockItem);
  });

  it("returns 500 on DynamoDB error", async () => {
    ddbMock.on(GetCommand).rejects(new Error("DynamoDB failure"));

    const result = await lambda.handler({ queryStringParameters: { listId: "list-123" } });

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({ error: "Internal server error" });
  });
});