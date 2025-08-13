export const removeAccent = (str: string) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export const removeQuotes = (str: string) => {
  if (str.indexOf('"') === 0) {
    str = str.substring(1);
  }

  if (str.lastIndexOf('"') === str.length - 1) {
    str = str.substring(0, str.length - 1);
  }

  if (str.lastIndexOf('".') === str.length - 2) {
    str = str.substring(0, str.length - 2) + '.';
  }

  return str;
};
