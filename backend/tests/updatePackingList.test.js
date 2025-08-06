const { mockClient } = require("aws-sdk-client-mock");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

const ddbMock = mockClient(DynamoDBDocumentClient);

// Adjust the path based on your actual Lambda location
const lambda = require("../src/updatePackingList");

describe("updatePackingList Lambda", () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it("returns 400 if listId is missing", async () => {
    const result = await lambda.handler({
      queryStringParameters: null,
      body: JSON.stringify({ name: "My Trip" }),
    });

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toBe("Missing 'listId'");
  });

  it("returns 400 if body is invalid JSON", async () => {
    const result = await lambda.handler({
      queryStringParameters: { listId: "list-1" },
      body: "not-json",
    });

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toBe("Invalid JSON body");
  });

  it("returns 400 if name is missing", async () => {
    const result = await lambda.handler({
      queryStringParameters: { listId: "list-1" },
      body: JSON.stringify({}),
    });

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toBe("Missing or invalid 'name'");
  });

  it("returns 400 if name is not a string", async () => {
    const result = await lambda.handler({
      queryStringParameters: { listId: "list-1" },
      body: JSON.stringify({ name: 123 }),
    });

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toBe("Missing or invalid 'name'");
  });

  it("returns 200 and updated attributes on success", async () => {
    const mockAttributes = { title: "Vacation" };
    ddbMock.on(UpdateCommand).resolves({ Attributes: mockAttributes });

    const result = await lambda.handler({
      queryStringParameters: { listId: "list-1" },
      body: JSON.stringify({ name: "Vacation" }),
    });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(mockAttributes);
  });

  it("returns 500 on DynamoDB error", async () => {
    ddbMock.on(UpdateCommand).rejects(new Error("DynamoDB error"));

    const result = await lambda.handler({
      queryStringParameters: { listId: "list-1" },
      body: JSON.stringify({ name: "Something" }),
    });

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toBe("Internal Server Error");
  });
});