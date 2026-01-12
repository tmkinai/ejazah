export function clsx(...classes: any[]): string {
  return classes.filter(Boolean).join(' ')
}

export function cn(...inputs: any[]): string {
  return inputs.filter(x => typeof x === 'string').join(' ')
}

export const classNameUtils = {
  cn,
  clsx,
}
