import parse from '../utils/parse';

export const useParseValue = () => {
  const parseValue = (field, value) => {
    if (parse[field] && parse[field][value]) {
      return parse[field][value];
    }
    return value;
  };

  return { parseValue };
};