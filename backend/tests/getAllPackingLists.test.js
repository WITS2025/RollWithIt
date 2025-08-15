const { mockClient } = require("aws-sdk-client-mock");
const {
  DynamoDBClient,
} = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");

const ddbMock = mockClient(DynamoDBDocumentClient);

const lambda = require("../src/getAllPackingLists"); 

describe("getAllPackingLists Lambda", () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it("returns 200 and items when scan is successful", async () => {
    const mockItems = [{ id: "item1" }, { id: "item2" }];
    ddbMock.on(ScanCommand).resolves({ Items: mockItems });

    const result = await lambda.handler({});

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(mockItems);
  });

  it("returns 404 when no items found", async () => {
    ddbMock.on(ScanCommand).resolves({ Items: [] });

    const result = await lambda.handler({});

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body)).toEqual([]);
  });

  it("returns 500 on DynamoDB error", async () => {
    ddbMock.on(ScanCommand).rejects(new Error("DynamoDB error"));

    const result = await lambda.handler({});

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toBe("Error retrieving items from DynamoDB");
  });
});