// Email validation helper function
export function validateEmail(email) {
    const emailPattern = /^[^\s@]+@gmail.com/;
    return emailPattern.test(email);
 }