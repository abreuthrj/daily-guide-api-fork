import {
  UnprocessableEntityException,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class UnprocessibleEntityValidationPipe extends ValidationPipe {
  constructor(options: ValidationPipeOptions = {}) {
    options.exceptionFactory = (originalErrors: ValidationError[]) => {
      const errors = originalErrors
        .map((error: ValidationError) => {
          const errors = [];
          errors.push([error.property, Object.values(error.constraints)]);

          error.children.forEach((child: ValidationError) => {
            errors.push([child.property, Object.values(child.constraints)]);
          });

          return errors;
        })
        .reduce((acc, errors) => acc.concat(errors), []);

      return new UnprocessableEntityException({
        message: Object.fromEntries(errors),
      });
    };

    super(options);
  }
}
