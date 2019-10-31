const AWS = require('aws-sdk');
const uuid = require('uuid/v1');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const timestamp = () => Math.round(Date.now() / 1000); // UNIX timestamp in seconds
const toPutRequest = (item) => ({ // Map to DB client write request, add ID (hash key)
  PutRequest: {
    Item: {
      ...item,
      id: uuid(), // Create ID
      createdAt: timestamp(), // Current timestamp
    },
  },
});

const put = async (table, items) => { // Write items (single or array)
  const itemArray = Array.isArray(items) ? items : [items];
  const params = { // Map items to DB bulk write request
    RequestItems: {
      [table]: itemArray.map(toPutRequest),
    },
  };

  await dynamoDb.batchWrite(params).promise();
};

const scan = async (table, query, attributes) => { // Query DB (expensive)
  const params = {
    TableName: table,
    FilterExpression: query,
    ExpressionAttributeValues: attributes,
  };

  return (await dynamoDb.scan(params).promise()).Items;
};

module.exports = {
  timestamp, // Useful elsewhere, I suppose
  put,
  scan,
};
