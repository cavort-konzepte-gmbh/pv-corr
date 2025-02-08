const isObject = (value: unknown): value is object => {
  return value !== null && value !== undefined && !Array.isArray(value) && typeof value === "object"
}

const isPrimitive = (value: unknown): value is string | number | boolean => {
  return ["number", "string", "boolean", "bigint", "symbol"].includes(typeof value)
}

/**
 * Compare two objects and return true if they are equal, otherwise false.
 * Note: This function does not account for un-ordered values.
 * 
 * TODO: Implement a new version of this function that will compare the values in an un-ordered way.
 *
 * @param oldObj - The first object to compare
 * @param newObj - The second object to compare
 * @returns {boolean} - Returns true if both objects are equal, otherwise false
 */
export const comparator = <Old extends Record<string, any>, New extends Record<string, any>>(oldObj: Old, newObj: New): boolean => {
  if (oldObj as unknown === newObj) return true
  if (!oldObj || !newObj || typeof oldObj !== typeof newObj) return false
  if (isPrimitive(oldObj) && isPrimitive(newObj)) return oldObj === newObj
  for (const key in oldObj) {
    if (!newObj.hasOwnProperty(key)) return false
    if (Array.isArray(oldObj[key]) || isObject(oldObj[key])) {
      if (Object.keys(oldObj[key] as Old).length !== Object.keys(newObj[key] as New).length) return false
      if (!comparator(oldObj[key] as Record<string, unknown>, newObj[key] as Record<string, unknown>)) {
        return false
      }
    } else {
      if ((oldObj[key] as unknown) !== (newObj[key] as unknown)) {
        return false
      }
    }
  }
  return true
}