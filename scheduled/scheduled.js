const AWS = require('aws-sdk');
const uuid = require('uuid/v1');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = 'freshworks-demo-feeding-table';
const dayLetter = () => 'UMTWRFS'.split('')[new Date().getDay()]; // Single-letter weekday form
const response = (data, code = 200) => ({ // Align headers, etc. for all responses
  statusCode: code,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  },
  body: JSON.stringify(data),
});
const toPutRequest = (item) => ({
  PutRequest: { Item: item },
});

module.exports.handler = async () => {
  const yesterday = Math.round(Date.now() / 1000) - 24 * 60 * 60; // 24 hours ago
  // Query for items scheduled for current weekday, skipping those created today
  const params = {
    TableName: tableName,
    FilterExpression: 'contains(schedule, :schedule) and createdAt < :yesterday',
    ExpressionAttributeValues: {
      ':schedule': dayLetter(), // UMTWRFS
      ':yesterday': yesterday,
    },
  };

  try {
    const scanResult = await dynamoDb.scan(params).promise();
    // Overwrite item ID, creation time, and schedule
    const newItems = scanResult.Items.map((item) => ({
      ...item,
      id: uuid(),
      createdAt: Math.round(Date.now() / 1000),
      schedule: undefined,
    }));
    const putParams = { // Map items to DB bulk write request
      RequestItems: {
        [tableName]: newItems.map(toPutRequest),
      },
    };
    const writeResult = await dynamoDb.batchWrite(putParams).promise(); // Execute bulk write

    return response({ newItems, writeResult }, 500);
  } catch (error) {
    return response(error, 500);
  }
};
