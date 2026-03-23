import type { AdminFormRule } from '~/modules/admin/components/AdminFormField.vue'

export const requiredRule = (message?: string): AdminFormRule => ({
  type: 'required',
  message
})

export const minLengthRule = (length: number, message?: string): AdminFormRule => ({
  type: 'minLength',
  length,
  message
})

export const maxLengthRule = (length: number, message?: string): AdminFormRule => ({
  type: 'maxLength',
  length,
  message
})

export const urlRule = (message?: string): AdminFormRule => ({
  type: 'url',
  message
})

export const regexRule = (pattern: RegExp, message?: string): AdminFormRule => ({
  type: 'regex',
  pattern,
  message
})

export const customRule = (
  validator: (value: any, model?: any) => string | null | undefined,
  message?: string
): AdminFormRule => ({
  type: 'custom',
  validator,
  message
})

export const phoneCnRule = (message?: string): AdminFormRule =>
  regexRule(/^1[3-9]\d{9}$/, message)

