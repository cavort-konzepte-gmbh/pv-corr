export interface RatingRange {
  min: number | string | null
  max?: number | string | null
  rating: number
}

export interface StandardParameter {
  parameterId: string
  parameterCode: string
  ratingRanges: RatingRange[]
}

export interface Standard {
  id: string
  hiddenId?: string
  name: string
  description?: string
  parameters?: StandardParameter[]
}

export const STANDARDS: Standard[] = [
  {
    id: 'din50929-3',
    name: 'DIN 50929-3:2018',
    description: 'Probability of corrosion of metallic materials when subject to corrosion from the outside',
    parameters: [
      {
        parameterId: 'z1',
        parameterCode: 'Z1',
        ratingRanges: [
          { min: 0, max: 10, rating: 4 },
          { min: 10, max: 30, rating: 2 },
          { min: 30, max: 50, rating: 0 },
          { min: 50, max: 80, rating: -2 },
          { min: 80, max: null, rating: -4 },
        ],
      },
      {
        parameterId: 'z2',
        parameterCode: 'Z2',
        ratingRanges: [
          { min: 500, max: null, rating: 4 },
          { min: 200, max: 500, rating: 2 },
          { min: 50, max: 200, rating: 0 },
          { min: 20, max: 50, rating: -2 },
          { min: 10, max: 20, rating: -4 },
          { min: 0, max: 10, rating: -6 },
        ],
      },
      {
        parameterId: 'z3',
        parameterCode: 'Z3',
        ratingRanges: [
          { min: 0, max: 20, rating: 0 },
          { min: 20, max: 40, rating: -1 },
          { min: 40, max: null, rating: -2 },
        ],
      },
      {
        parameterId: 'z4',
        parameterCode: 'Z4',
        ratingRanges: [
          { min: 0, max: 4, rating: -2 },
          { min: 4, max: 5, rating: -1 },
          { min: 5, max: 8, rating: 0 },
          { min: 8, max: 9, rating: -1 },
          { min: 9, max: null, rating: -2 },
        ],
      },
      {
        parameterId: 'z5',
        parameterCode: 'Z5',
        ratingRanges: [
          { min: 0, max: 2, rating: 0 },
          { min: 2, max: 10, rating: -1 },
          { min: 10, max: 20, rating: -2 },
          { min: 20, max: null, rating: -3 },
        ],
      },
    ],
  },
]

export const DEFAULT_STANDARDS: Standard[] = [
  {
    id: 'din50929-3',
    name: 'DIN 50929-3:2018',
    description: 'Probability of corrosion of metallic materials when subject to corrosion from the outside',
    parameters: [
      {
        parameterId: 'z1',
        parameterCode: 'Z1',
        ratingRanges: [
          { min: 0, max: 10, rating: 4 },
          { min: 10, max: 30, rating: 2 },
          { min: 30, max: 50, rating: 0 },
          { min: 50, max: 80, rating: -2 },
          { min: 80, max: null, rating: -4 },
        ],
      },
      {
        parameterId: 'z2',
        parameterCode: 'Z2',
        ratingRanges: [
          { min: 500, max: null, rating: 4 },
          { min: 200, max: 500, rating: 2 },
          { min: 50, max: 200, rating: 0 },
          { min: 20, max: 50, rating: -2 },
          { min: 10, max: 20, rating: -4 },
          { min: 0, max: 10, rating: -6 },
        ],
      },
      {
        parameterId: 'z3',
        parameterCode: 'Z3',
        ratingRanges: [
          { min: 0, max: 20, rating: 0 },
          { min: 20, max: 40, rating: -1 },
          { min: 40, max: null, rating: -2 },
        ],
      },
      {
        parameterId: 'z4',
        parameterCode: 'Z4',
        ratingRanges: [
          { min: 0, max: 4, rating: -2 },
          { min: 4, max: 5, rating: -1 },
          { min: 5, max: 8, rating: 0 },
          { min: 8, max: 9, rating: -1 },
          { min: 9, max: null, rating: -2 },
        ],
      },
      {
        parameterId: 'z5',
        parameterCode: 'Z5',
        ratingRanges: [
          { min: 0, max: 2, rating: 0 },
          { min: 2, max: 10, rating: -1 },
          { min: 10, max: 20, rating: -2 },
          { min: 20, max: null, rating: -3 },
        ],
      },
    ],
  },
]
