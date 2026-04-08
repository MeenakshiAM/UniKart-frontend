const registerNumberPattern = /^LBT(2[0-6])(IT|CS|EC|ER|CV)\d{3}$/;
const allowedDepartments = ["IT", "CS", "EC", "ER", "CV"];

function calculateAge(dateOfBirth) {
  const birthDate = new Date(dateOfBirth);

  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthOffset = today.getMonth() - birthDate.getMonth();

  if (monthOffset < 0 || (monthOffset === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
}

export function validateSignup(values) {
  if (!values.name.trim()) {
    return "Name is required.";
  }

  if (!values.email.trim()) {
    return "Email is required.";
  }

  if (!values.password.trim()) {
    return "Password is required.";
  }

  if (!registerNumberPattern.test(values.registerNumber.trim())) {
    return "Register number must follow the backend format like LBT24IT001.";
  }

  const age = calculateAge(values.dateOfBirth);

  if (age === null) {
    return "Please choose a valid date of birth.";
  }

  if (age < 18 || age > 25) {
    return "Age must be between 18 and 25 to match the backend rules.";
  }

  if (!allowedDepartments.includes(values.department)) {
    return "Department must be one of IT, CS, EC, ER, or CV.";
  }

  return "";
}

export function validateLogin(values) {
  if (!values.email.trim() || !values.password.trim()) {
    return "Email and password are required.";
  }

  return "";
}
