/** Result envelope returned by auth Server Actions to form components. */
export interface AuthFormState {
  /** Safe, user-facing message. Never leaks which factor failed. */
  message?: string;
  fieldErrors?: Partial<Record<"email" | "password" | "displayName", string[]>>;
}
