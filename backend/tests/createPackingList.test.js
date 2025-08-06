const { mockClient } = require("aws-sdk-client-mock");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const ddbMock = mockClient(DynamoDBDocumentClient);

// Adjust the path to your Lambda file
const lambda = require("../src/createPackingList");

describe("createPackingList Lambda", () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it("returns 400 if body is invalid JSON", async () => {
    const event = { body: "{not-json}" };
    const result = await lambda.handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toBe("Invalid JSON");
  });

  it("returns 400 if required fields are missing", async () => {
    const event = { body: JSON.stringify({ packingListId: "id1" }) };
    const result = await lambda.handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toBe("Missing required fields: packingListId and title");
  });

  it("calls DynamoDB PutCommand with correct params and returns 200", async () => {
    ddbMock.on(PutCommand).resolves({});

    const event = {
      body: JSON.stringify({ packingListId: "list-123", title: "My Trip" }),
    };

    const result = await lambda.handler(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toBe("Packing list created successfully");

    const calledWith = ddbMock.commandCalls(PutCommand)[0].args[0].input;

    expect(calledWith.TableName).toBe("roll_with_it");
    expect(calledWith.Item.pk).toBe("list-123");
    expect(calledWith.Item.title).toBe("My Trip");
    expect(Array.isArray(calledWith.Item.items)).toBe(true);
    expect(typeof calledWith.Item.created_at).toBe("string");
  });

  it("returns 500 if DynamoDB PutCommand throws", async () => {
    ddbMock.on(PutCommand).rejects(new Error("DynamoDB error"));

    const event = {
      body: JSON.stringify({ packingListId: "list-123", title: "My Trip" }),
    };

    const result = await lambda.handler(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toBe("Error creating packing list in DynamoDB");
  });
});