const AWS = require('aws-sdk');
const uuid = require('uuid/v1');
const { validateData, ValidationError } = require('./validate');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = 'freshworks-demo-feeding-table';
const response = (data, code = 200) => ({
  statusCode: code,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  },
  body: JSON.stringify(data),
});

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
    return response({ data });
  } catch (error) {
    if (error instanceof ValidationError) {
      return response({ errors: error.errors }, 400);
    }
    return response({ errors: ['Unhandled server error'] }, 500);
  }
};
