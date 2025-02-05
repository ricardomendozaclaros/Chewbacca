import parse from '../utils/parse.json';

export const useParseValue = () => {
  const parseValue = (field, value) => {
    // Handle null/undefined cases
    if (!field || !value) return value;

    // For signature types, always check in description
    if (parse.description[value]) {
      return parse.description[value];
    }

    // For other fields, check in specific category
    if (parse[field] && parse[field][value]) {
      return parse[field][value];
    }

    return value;
  };

  return { parseValue };
};