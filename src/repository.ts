import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand} from '@aws-sdk/lib-dynamodb'
import { LocationUpdate } from "./types";

export const client = new DynamoDBClient({
    region: "us-east-1",
    endpoint: "http://localhost:8000",
    credentials: { accessKeyId: "fake", secretAccessKey: "fake"}
})

const ddbDocClient = DynamoDBDocumentClient.from(client)

export const saveLocationHistory = async (data: LocationUpdate) => {
    const params = {
        TableName: "RiderHistory",
        Item: {
            ...data,
            pk: `ORDER#${data.orderId}`,
            sk: `TIME#${data.timestamp}`
        },
    };

    try {
        await ddbDocClient.send(new PutCommand(params))
    } catch (err) {
        console.error("Erro ao persistir no DynamoDB:", err)
    }
}