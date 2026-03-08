export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface FieldValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  customValidator?: (value: unknown) => boolean;
  customMessage?: string;
}

export interface FormValidationSchema {
  rules: FieldValidationRule[];
}

export function validateRequired(value: unknown, fieldName: string): ValidationResult {
  const errors: ValidationError[] = [];
  let isValid = true;

  if (value === null || value === undefined) {
    isValid = false;
    errors.push({
      field: fieldName,
      message: `${fieldName} 是必填字段`,
      code: 'REQUIRED',
    });
  } else if (typeof value === 'string' && value.trim() === '') {
    isValid = false;
    errors.push({
      field: fieldName,
      message: `${fieldName} 不能为空`,
      code: 'REQUIRED',
    });
  } else if (Array.isArray(value) && value.length === 0) {
    isValid = false;
    errors.push({
      field: fieldName,
      message: `${fieldName} 至少需要选择一项`,
      code: 'REQUIRED',
    });
  }

  return { isValid, errors };
}

export function validateLength(
  value: string,
  fieldName: string,
  options: {
    minLength?: number;
    maxLength?: number;
  } = {}
): ValidationResult {
  const errors: ValidationError[] = [];
  let isValid = true;
  const { minLength, maxLength } = options;
  const length = value.length;

  if (minLength !== undefined && length < minLength) {
    isValid = false;
    errors.push({
      field: fieldName,
      message: `${fieldName} 长度不能少于 ${minLength} 个字符`,
      code: 'MIN_LENGTH',
    });
  }

  if (maxLength !== undefined && length > maxLength) {
    isValid = false;
    errors.push({
      field: fieldName,
      message: `${fieldName} 长度不能超过 ${maxLength} 个字符`,
      code: 'MAX_LENGTH',
    });
  }

  return { isValid, errors };
}

export function validateRange(
  value: number,
  fieldName: string,
  options: {
    min?: number;
    max?: number;
  } = {}
): ValidationResult {
  const errors: ValidationError[] = [];
  let isValid = true;
  const { min, max } = options;

  if (min !== undefined && value < min) {
    isValid = false;
    errors.push({
      field: fieldName,
      message: `${fieldName} 不能小于 ${min}`,
      code: 'MIN_VALUE',
    });
  }

  if (max !== undefined && value > max) {
    isValid = false;
    errors.push({
      field: fieldName,
      message: `${fieldName} 不能大于 ${max}`,
      code: 'MAX_VALUE',
    });
  }

  return { isValid, errors };
}

export function validatePattern(
  value: string,
  fieldName: string,
  pattern: RegExp,
  message?: string
): ValidationResult {
  const errors: ValidationError[] = [];
  let isValid = true;

  if (!pattern.test(value)) {
    isValid = false;
    errors.push({
      field: fieldName,
      message: message ?? `${fieldName} 格式不正确`,
      code: 'PATTERN_MISMATCH',
    });
  }

  return { isValid, errors };
}

export function validateEmail(value: string, fieldName: string = '邮箱'): ValidationResult {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return validatePattern(value, fieldName, emailPattern, '请输入有效的邮箱地址');
}

export function validatePhone(value: string, fieldName: string = '电话'): ValidationResult {
  const phonePattern = /^1[3-9]\d{9}$/;
  return validatePattern(value, fieldName, phonePattern, '请输入有效的手机号码');
}

export function validateUrl(value: string, fieldName: string = '网址'): ValidationResult {
  try {
    new URL(value);
    return { isValid: true, errors: [] };
  } catch {
    return {
      isValid: false,
      errors: [
        {
          field: fieldName,
          message: '请输入有效的网址',
          code: 'INVALID_URL',
        },
      ],
    };
  }
}

export function validateForm(
  data: Record<string, unknown>,
  schema: FormValidationSchema
): ValidationResult {
  const allErrors: ValidationError[] = [];
  let isFormValid = true;

  for (const rule of schema.rules) {
    const value = data[rule.field];
    const fieldErrors: ValidationError[] = [];

    if (rule.required) {
      const requiredResult = validateRequired(value, rule.field);
      if (!requiredResult.isValid) {
        fieldErrors.push(...requiredResult.errors);
        isFormValid = false;
        allErrors.push(...fieldErrors);
        continue;
      }
    }

    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'string') {
        if (rule.minLength !== undefined || rule.maxLength !== undefined) {
          const lengthResult = validateLength(value, rule.field, {
            minLength: rule.minLength,
            maxLength: rule.maxLength,
          });
          if (!lengthResult.isValid) {
            fieldErrors.push(...lengthResult.errors);
            isFormValid = false;
          }
        }

        if (rule.pattern) {
          const patternResult = validatePattern(
            value,
            rule.field,
            rule.pattern,
            rule.customMessage
          );
          if (!patternResult.isValid) {
            fieldErrors.push(...patternResult.errors);
            isFormValid = false;
          }
        }
      }

      if (typeof value === 'number') {
        if (rule.min !== undefined || rule.max !== undefined) {
          const rangeResult = validateRange(value, rule.field, {
            min: rule.min,
            max: rule.max,
          });
          if (!rangeResult.isValid) {
            fieldErrors.push(...rangeResult.errors);
            isFormValid = false;
          }
        }
      }

      if (rule.customValidator) {
        if (!rule.customValidator(value)) {
          fieldErrors.push({
            field: rule.field,
            message: rule.customMessage ?? `${rule.field} 验证失败`,
            code: 'CUSTOM_VALIDATION_FAILED',
          });
          isFormValid = false;
        }
      }
    }

    allErrors.push(...fieldErrors);
  }

  return {
    isValid: isFormValid,
    errors: allErrors,
  };
}

export function createValidationSchema(
  rules: FieldValidationRule[]
): FormValidationSchema {
  return { rules };
}

export function getErrorsByField(
  errors: ValidationError[],
  fieldName: string
): ValidationError[] {
  return errors.filter((error) => error.field === fieldName);
}

export function getFirstError(errors: ValidationError[]): string | null {
  if (errors.length === 0) {
    return null;
  }
  return errors[0].message;
}

export function hasError(errors: ValidationError[], fieldName: string): boolean {
  return errors.some((error) => error.field === fieldName);
}

export function validateProjectName(value: string): ValidationResult {
  const results: ValidationResult[] = [
    validateRequired(value, '项目名称'),
    validateLength(value, '项目名称', { minLength: 2, maxLength: 100 }),
  ];

  return mergeValidationResults(results);
}

export function validateDescription(value: string): ValidationResult {
  const results: ValidationResult[] = [
    validateRequired(value, '项目描述'),
    validateLength(value, '项目描述', { minLength: 10, maxLength: 2000 }),
  ];

  return mergeValidationResults(results);
}

function mergeValidationResults(results: ValidationResult[]): ValidationResult {
  const allErrors: ValidationError[] = [];
  let isValid = true;

  for (const result of results) {
    if (!result.isValid) {
      isValid = false;
      allErrors.push(...result.errors);
    }
  }

  return { isValid, errors: allErrors };
}
