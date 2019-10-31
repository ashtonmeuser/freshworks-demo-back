const db = require('../common/database');
const { validateData, ValidationError } = require('./validate');

const tableName = 'freshworks-demo-feeding-table';
const response = (data, code = 200) => ({ // Align headers, etc. for all responses
  statusCode: code,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  },
  body: JSON.stringify(data),
});

module.exports.handler = async (event) => {
  try {
    const data = validateData(JSON.parse(event.body)); // Sanitized and validated
    await db.put(tableName, data);
    return response({ data });
  } catch (error) {
    if (error instanceof ValidationError) {
      return response({ errors: error.errors }, 400); // Submitted data failed validation
    }
    return response({ errors: ['Unhandled server error'] }, 500); // FIXME: Handle errors
  }
};
