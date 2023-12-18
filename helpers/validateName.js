export function validateName(name) {
    const namePattern = /^[A-Z][a-z]*$/;
    return namePattern.test(name);
  }