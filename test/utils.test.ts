import { describe, test, expect } from 'vitest'
import { fromCamelCaseToSnakeCase, toCase } from '../src/utils/cases'

describe('FromCamelCaseToSnakeCase', () => {
  const testCases = [
    {
      input: 'camelCase',
      expected: 'camel_case',
    },
    {
      input: 'snakeCase',
      expected: 'snake_case',
    },
    {
      input: 'kebab-case',
      expected: 'kebab-case',
    },
  ]
  testCases.forEach(({ input, expected }) => {
    test(`should convert ${input} to ${expected}`, () => {
      expect(fromCamelCaseToSnakeCase(input)).toBe(expected)
    })
  })
})

describe('toCase function from camelCase to snakeCase', () => {
  const testCases = [
    {
      description: 'should convert an object with camelCase keys to snake_case keys',
      input: {
        camelCase: 'value',
        fooBar: 'baz',
        fooFooBar: 'baz',
      },
      expected: {
        camel_case: 'value',
        foo_bar: 'baz',
        foo_foo_bar: 'baz',
      },
    },
    {
      description: 'should convert an object with numeric values and camelCase keys to snake_case keys',
      input: {
        id: 1,
        hiddenId: 2,
        registrationNumber: 3,
        placeId: 4,
        ceoId: 5,
        contactPersonId: 6,
      },
      expected: {
        id: 1,
        hidden_id: 2,
        registration_number: 3,
        place_id: 4,
        ceo_id: 5,
        contact_person_id: 6,
      },
    },
    {
      description: '',
      input: {
        name: 'value',
        hiddenId: 2,
        clientRef: 'value',
        latitude: 4,
        longitude: 5,
        imageUrl: 'value',
        placeId: 6,
        companyId: 7,
        managerId: 8,
        typeProject: 'value',
      },
      expected: {
        name: 'value',
        hidden_id: 2,
        client_ref: 'value',
        latitude: 4,
        longitude: 5,
        image_url: 'value',
        place_id: 6,
        company_id: 7,
        manager_id: 8,
        type_project: 'value',
      },
    },
  ]
  testCases.forEach(({ description, input, expected }) => {
    test(description, () => {
      expect(toCase(input, 'snakeCase')).toEqual(expected)
    })
  })
})

describe('toCase function from snakeCase to camelCase', () => {
  const testCases = [
    {
      description: 'should convert an object with snake_case keys to camelCase keys',
      input: {
        snake_case: 'value',
        foo_bar: 'baz',
        foo_foo_bar: 'baz',
      },
      expected: {
        snakeCase: 'value',
        fooBar: 'baz',
        fooFooBar: 'baz',
      },
    },
    {
      description: 'should convert an object with mixed snake_case and camelCase keys to camelCase keys',
      input: {
        snake_case: 'value',
        fooBar: 'baz',
        foo_foo_bar: 'baz',
      },
      expected: {
        snakeCase: 'value',
        fooBar: 'baz',
        fooFooBar: 'baz',
      },
    },
    {
      description: 'should convert an object with numeric values and snake_case keys to camelCase keys',
      input: {
        id: 1,
        hidden_id: 2,
        registration_number: 3,
        place_id: 4,
        ceo_id: 5,
        contact_person_id: 6,
      },
      expected: {
        id: 1,
        hiddenId: 2,
        registrationNumber: 3,
        placeId: 4,
        ceoId: 5,
        contactPersonId: 6,
      },
    },
    {
      description: 'should convert an object with boolean values and snake_case keys to camelCase keys',
      input: {
        is_active: true,
        has_access: false,
      },
      expected: {
        isActive: true,
        hasAccess: false,
      },
    },
    {
      description: 'should convert an object with nested objects with snake_case keys to camelCase keys',
      input: {
        snake_case: {
          nested_key: 'value',
          nested_nested_key: 'value',
        },
        foo_bar: {
          nested_key: 'value',
          nested_nested_key: 'value',
        },
      },
      expected: {
        snakeCase: {
          nestedKey: 'value',
          nestedNestedKey: 'value',
        },
        fooBar: {
          nestedKey: 'value',
          nestedNestedKey: 'value',
        },
      },
    },
    {
      description: '',
      input: {
        foo_bar: {
          bar_foo: {
            foo_foo: {
              bar_bar: 'value',
            },
          },
        },
        snake_case: {
          nested_key: {
            nested_nested_key: {
              nested_nested_nested_key: 'value',
            },
          },
        },
      },
      expected: {
        fooBar: {
          barFoo: {
            fooFoo: {
              barBar: 'value',
            },
          },
        },
        snakeCase: {
          nestedKey: {
            nestedNestedKey: {
              nestedNestedNestedKey: 'value',
            },
          },
        },
      },
    },
    {
      description: 'should convert an object with arrays of objects with snake_case keys to camelCase keys',
      input: {
        hiddenId: 2,
        fields: [
          {
            hiddenId: 2,
            gates: [
              {
                hiddenId: 4,
              },
              {
                hiddenId: 5,
              },
            ],
            zones: [
              {
                hiddenId: 6,
                datapoints: [
                  {
                    hiddenId: 7,
                    sequentialId: 1,
                  },
                  {
                    hiddenId: 8,
                    sequentialId: 2,
                  },
                ],
              },
            ],
          },
        ],
      },
      expected: {
        hiddenId: 2,
        fields: [
          {
            hiddenId: 2,
            gates: [
              {
                hiddenId: 4,
              },
              {
                hiddenId: 5,
              },
            ],
            zones: [
              {
                hiddenId: 6,
                datapoints: [
                  {
                    hiddenId: 7,
                    sequentialId: 1,
                  },
                  {
                    hiddenId: 8,
                    sequentialId: 2,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  ]
  testCases.forEach(({ description, input, expected }) => {
    test(description, () => {
      expect(toCase(input, 'camelCase')).toEqual(expected)
    })
  })
})
