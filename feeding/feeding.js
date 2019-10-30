const AWS = require('aws-sdk');
const uuid = require('uuid/v1');
const { validateData, ValidationError } = require('./validate');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = 'freshworks-demo-feeding-table';

module.exports.handler = async (event) => {
  try {
    const data = validateData(JSON.parse(event.body));
    const feeding = { ...data, id: uuid() };
    const params = {
      TableName: tableName,
      Item: feeding,
      ReturnValues: 'NONE',
    };
    await dynamoDb.put(params).promise();
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ errors: error.errors }),
      };
    }
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ errors: ['Unhandled server error'] }),
    };
  }
};
