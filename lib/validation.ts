// URL validation helper
const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

export const validateTaskLink = (url: string): { isValid: boolean; error?: string } => {
  if (!url || url.trim() === '') {
    return { isValid: true }; // Optional if alternateUrl is provided
  }
  
  if (!isValidUrl(url.trim())) {
    return { isValid: false, error: 'Please provide a valid URL (http:// or https://)' };
  }
  
  return { isValid: true };
};

export const validateAlternateUrl = (url: string): { isValid: boolean; error?: string } => {
  if (!url || url.trim() === '') {
    return { isValid: true }; // Optional field
  }
  
  if (!isValidUrl(url.trim())) {
    return { isValid: false, error: 'Please provide a valid URL (http:// or https://)' };
  }
  
  return { isValid: true };
};

export const validateRewardPoints = (points: number): { isValid: boolean; error?: string } => {
  if (isNaN(points)) {
    return { isValid: false, error: 'Reward points must be a number' };
  }
  
  if (points < 0) {
    return { isValid: false, error: 'Reward points cannot be negative' };
  }
  
  if (points > 10000) {
    return { isValid: false, error: 'Reward points cannot exceed 10,000' };
  }
  
  return { isValid: true };
};

export const validateTaskTitle = (title: string): { isValid: boolean; error?: string } => {
  if (!title || title.trim() === '') {
    return { isValid: false, error: 'Task title is required' };
  }
  
  if (title.trim().length < 3) {
    return { isValid: false, error: 'Task title must be at least 3 characters long' };
  }
  
  if (title.trim().length > 100) {
    return { isValid: false, error: 'Task title cannot exceed 100 characters' };
  }
  
  return { isValid: true };
};

export const validateTaskDescription = (description: string): { isValid: boolean; error?: string } => {
  if (!description || description.trim() === '') {
    return { isValid: false, error: 'Task description is required' };
  }
  
  if (description.trim().length < 10) {
    return { isValid: false, error: 'Task description must be at least 10 characters long' };
  }
  
  if (description.trim().length > 500) {
    return { isValid: false, error: 'Task description cannot exceed 500 characters' };
  }
  
  return { isValid: true };
};

export const validateTaskInstructions = (instructions: string): { isValid: boolean; error?: string } => {
  if (!instructions || instructions.trim() === '') {
    return { isValid: false, error: 'Task instructions are required' };
  }
  
  if (instructions.trim().length < 10) {
    return { isValid: false, error: 'Task instructions must be at least 10 characters long' };
  }
  
  if (instructions.trim().length > 1000) {
    return { isValid: false, error: 'Task instructions cannot exceed 1000 characters' };
  }
  
  return { isValid: true };
};

export const validateValidationType = (validationType: string): { isValid: boolean; error?: string } => {
  if (!validationType || validationType.trim() === '') {
    return { isValid: false, error: 'Validation type is required' };
  }
  
  if (validationType.trim().length > 100) {
    return { isValid: false, error: 'Validation type cannot exceed 100 characters' };
  }
  
  return { isValid: true };
};

export const validateDeadline = (deadline: string): { isValid: boolean; error?: string } => {
  if (!deadline || deadline.trim() === '') {
    return { isValid: true }; // Optional field
  }
  
  const deadlineDate = new Date(deadline);
  const now = new Date();
  
  if (isNaN(deadlineDate.getTime())) {
    return { isValid: false, error: 'Invalid deadline format' };
  }
  
  if (deadlineDate <= now) {
    return { isValid: false, error: 'Deadline must be in the future' };
  }
  
  return { isValid: true };
};

export const validateTaskData = (taskData: {
  title: string;
  description: string;
  category: string;
  rewardPoints: number;
  validationType: string;
  instructions: string;
  taskLink: string;
  alternateUrl: string;
  deadline: string;
  status: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  const titleValidation = validateTaskTitle(taskData.title);
  if (!titleValidation.isValid) errors.push(titleValidation.error!);
  
  const descriptionValidation = validateTaskDescription(taskData.description);
  if (!descriptionValidation.isValid) errors.push(descriptionValidation.error!);
  
  const instructionsValidation = validateTaskInstructions(taskData.instructions);
  if (!instructionsValidation.isValid) errors.push(instructionsValidation.error!);
  
  const validationTypeValidation = validateValidationType(taskData.validationType);
  if (!validationTypeValidation.isValid) errors.push(validationTypeValidation.error!);
  
  // Validate that at least one link is provided
  const hasTaskLink = taskData.taskLink && taskData.taskLink.trim() !== '';
  const hasAlternateUrl = taskData.alternateUrl && taskData.alternateUrl.trim() !== '';
  
  if (!hasTaskLink && !hasAlternateUrl) {
    errors.push('At least one link is required (Task Link or Alternate URL)');
  }
  
  if (hasTaskLink) {
    const taskLinkValidation = validateTaskLink(taskData.taskLink);
    if (!taskLinkValidation.isValid) errors.push(taskLinkValidation.error!);
  }
  
  if (hasAlternateUrl) {
    const alternateUrlValidation = validateAlternateUrl(taskData.alternateUrl);
    if (!alternateUrlValidation.isValid) errors.push(alternateUrlValidation.error!);
  }
  
  const rewardPointsValidation = validateRewardPoints(taskData.rewardPoints);
  if (!rewardPointsValidation.isValid) errors.push(rewardPointsValidation.error!);
  
  const deadlineValidation = validateDeadline(taskData.deadline);
  if (!deadlineValidation.isValid) errors.push(deadlineValidation.error!);
  
  // Validate category
  if (!['social', 'content', 'commerce'].includes(taskData.category)) {
    errors.push('Invalid category. Must be one of: social, content, commerce');
  }
  
  // Validate status
  if (!['active', 'expired', 'disabled'].includes(taskData.status)) {
    errors.push('Invalid status. Must be one of: active, expired, disabled');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
