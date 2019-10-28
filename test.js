const AWS = require('aws-sdk');
const uuid = require('uuid/v1');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = 'freshworks-demo-feeding-table';

module.exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);
    const feeding = { ...data, id: uuid() };
    const params = {
      TableName: tableName,
      Item: feeding,
      ReturnValues: 'NONE',
    };
    await dynamoDb.put(params).promise();
    return {
      statusCode: 200,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }
};
