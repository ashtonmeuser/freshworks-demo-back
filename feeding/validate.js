const constants = require('../constants');

const pickProperties = (...props) => (dict) => props.reduce(
  (accumulator, key) => ({ ...accumulator, [key]: dict[key] }), {},
);
const validators = {
  location: (v) => typeof v === 'string' && v.match(/^.{4,}$/) !== null,
  time: (v) => typeof v === 'string' && v.match(/^\d{2}:\d{2}$/) !== null,
  foodType: (v) => typeof v === 'string' && constants.foodTypes.includes(v),
  foodQuantity: (v) => typeof v === 'number' && v > 0,
  duckQuantity: (v) => typeof v === 'number' && v > 0,
};
const messages = {
  location: 'Location must be a string with 4 or more characters',
  time: 'Time must be in the format HH:MM',
  foodType: 'Food type must be from acceptable list',
  foodQuantity: 'Food quantity must be numeral greater than 0',
  duckQuantity: 'Duck quantity must be numeral greater than 0',
};

class ValidationError extends Error {
  constructor(errors) {
    super('Invalid data supplied');
    this.errors = errors;
  }
}

const validateData = (rawData) => {
  const data = pickProperties(...constants.validFields)(rawData);
  const errors = Object.keys(data).map((key) => {
    if (!validators[key](data[key])) {
      return messages[key];
    }
    return null;
  }).filter((v) => v !== null);
  if (errors.length > 0) throw new ValidationError(errors);
  return data;
};

module.exports = { validateData, ValidationError };
