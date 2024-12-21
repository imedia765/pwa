export const validateProfileForm = (formData: FormData, newPassword: string, confirmPassword: string) => {
  const requiredFields = [
    'fullName', 'email', 'phone', 'address', 'town', 
    'postcode', 'dob', 'gender', 'maritalStatus'
  ];

  // Check if all required fields are filled
  const missingFields = requiredFields.filter(field => !formData.get(field));
  if (missingFields.length > 0) {
    throw new Error("Please fill in all required fields to complete your profile.");
  }

  // Validate password match if changing password
  if (newPassword && newPassword !== confirmPassword) {
    throw new Error("Passwords don't match");
  }

  // Validate email format
  const email = formData.get('email') as string;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Please enter a valid email address");
  }

  return true;
};