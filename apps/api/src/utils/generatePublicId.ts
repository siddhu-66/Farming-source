export const generatePublicId = (prefix: string): string => {
  const year = new Date().getFullYear();
  // Generate a random 6 digit string for the POC. In production, this might use a sequence generator.
  const randomStr = Math.floor(100000 + Math.random() * 900000).toString();
  return `${prefix}-${year}-${randomStr}`;
};
