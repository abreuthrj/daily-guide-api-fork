import { ValueTransformer } from 'typeorm';

export const jsonTransformer: ValueTransformer = {
  from: (value) => {
    if (!value) {
      return null;
    }

    return JSON.parse(value);
  },
  to: (value) => {
    if (!value) {
      return null;
    }

    return JSON.stringify(value);
  },
};
