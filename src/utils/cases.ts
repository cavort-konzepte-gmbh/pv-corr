/**
 * Takes a string in camelCase and returns it in snake_case.
 *
 * @param {string} str - string in camelCase
 * @returns {string} - string in snake_case
 */
export const fromCamelCaseToSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

/**
 * Takes a string in snake_case and returns it in camelCase.
 *
 * @param {string} str - string in snake_case
 * @returns {string} - string in camelCase
 */
export const fromSnakeCaseToCamelCase = (str: string): string => {
  return str.replace(/(_\w)/g, (match) => match[1].toUpperCase());
}

/**
 * Takes an object and returns the object with keys in snake_case or camelCase.
 *
 * @param {object} object - object with keys in camelCase
 * @param {"snakeCase" | "camelCase"} to - the case to convert the keys to
 * @returns {object[]} - array of objects with keys in snake_case
 */
export const toCase = <T extends object>(object: Record<string, any>, to: "snakeCase" | "camelCase"): T => {
  const convert = to === "snakeCase" ? fromCamelCaseToSnakeCase : fromSnakeCaseToCamelCase;
  return Object.keys(object).reduce<T>((previous, now) => {
    let value = null
    if (isObject(object[now])) {
      value = toCase(object[now] as Record<string, any>, to);
    } else if(Array.isArray(object[now])) {
      value = object[now].map((item: Record<string, any>) => toCase(item, to));
    } else {
      value = object[now];
    }
    const key = convert(now);
    return { ...previous, [key]: value };
  }, {} as T);
};

/**
 * Checks if a value is an object.
 * 
 * @param {unknown} value - value to check if it is an object
 * @returns {boolean} - true if value is an object, false otherwise
 */
export const isObject = (value: unknown): boolean => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}