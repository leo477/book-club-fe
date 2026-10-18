let translate = (key: string): string => key;

export const setErrorTranslator = (fn: (key: string) => string): void => {
  translate = fn;
};

export const translateError = (key: string): string => translate(key);
