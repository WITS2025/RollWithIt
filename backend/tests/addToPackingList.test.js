const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { handler } = require('../src/addToPackingList')
const ddbMock = mockClient(DynamoDBDocumentClient);

beforeEach(() => {
    ddbMock.reset();
});

describe('addToPackingList Lambda', () => {
    it('should return 200 and updated item list when a valid input is provided', async () => {
        const mockListId = 'list-123';
        const mockItems = ['Toothbrush', 'Socks'];
        const newItem = 'Shoes';

        //Mock GetCommand to return current list
        ddbMock.on(GetCommand).resolves({
            Item: { pk: mockListId, items: [...mockItems] }
        });

        // Mock UpdateCommand to simulate successful update
        ddbMock.on(UpdateCommand).resolves({
            Attributes: {
                items: [...mockItems, newItem]
            }
        });

        const event = {
            queryStringParameters: { listId: mockListId },
            body: JSON.stringify({ newItem })
        };

        const response = await handler(event);
        expect(response.statusCode).toBe(200);

        const responseBody = JSON.parse(response.body);
        expect(responseBody.items).toContain(newItem);
    });

    it('should return 400 when ListId is missing', async () => {
        const event ={
            queryStringParameters: {},
            body: JSON.stringify({ newItem: 'Tent' })
        };

        const response = await handler(event);
        expect(response.statusCode).toBe(400);
        expect(response.body).toMatch(/Missing 'listId'/);
    });

    it("should return 400 when list is not found", async () => {
        ddbMock.on(GetCommand).resolves({ Item: null });
        
        const event = {
            queryStringParameters: { ListId: 'list-400'},
            body: JSON.stringify({ newItem: 'Hat'})       
        };
    });

    it("should return 500 when DynamoDB update fails:", async () => {
        const mockListId = 'list-123';
        
        ddbMock.on(GetCommand).resolves({
            Item: { pk: mockListId, items: ['Socks'] }
        });

        ddbMock.on(UpdateCommand).rejects(new Error("DynamoDB error"));

        const event = {
            queryStringParameters: { listId: mockListId },
            body: JSON.stringify({ newItem: 'Hat' })
        };

        const response = await handler(event);
        expect(response.statusCode).toBe(500);
        expect(response.body).toMatch(/Error updating item/);
    });
  });