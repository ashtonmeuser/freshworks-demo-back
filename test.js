const AWS = require('aws-sdk');
const uuid = require('uuid/v1');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = 'freshworks-demo-feeding-table';

module.exports.handler = async () => {
  try {
    const feeding = {
      id: uuid(),
      location: 'Victoria',
      time: '12:34',
      foodType: 'bread',
      foodQuantity: 2,
      duckQuantity: 3,
    };
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
