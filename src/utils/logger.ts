export const SENSITIVE_STR = '***sensitive***';

export const omitSensitiveData = (fields: string[], object: any) => {
  if (typeof object !== 'object') {
    return object;
  }

  Object.keys(object).forEach((key) => {
    if (!fields.includes(key)) {
      return omitSensitiveData(fields, object[key]);
    }

    let str = object[key];

    if (typeof object[key] !== 'string') {
      str = JSON.stringify(object[key]);
    }

    if (str.length > 6) {
      object[key] = str
        .slice(0, 3)
        .concat(SENSITIVE_STR)
        .concat(str.slice(str.length - 4));
    } else {
      object[key] = SENSITIVE_STR;
    }
  });

  return object;
};

export const getLogStr = (log: any): string => {
  return ['staging', 'production'].includes(process.env.NODE_ENV)
    ? JSON.stringify(log)
    : JSON.stringify(log, null, 2);
};
