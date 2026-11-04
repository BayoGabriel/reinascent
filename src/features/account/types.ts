/** Account-domain view types — plain JSON only, safe for client props. */

/** Result envelope returned by account Server Actions to form components. */
export interface AccountFormState {
  /** Safe, user-facing message (error or success). */
  message?: string;
  ok?: boolean;
  fieldErrors?: Record<string, string[]>;
}

/** Shipping address shown on the Address screen. */
export interface AddressView {
  name: string;
  phone: string;
  address: string;
  email: string;
}

/** Display-safe saved card — never carries PAN or CVV. */
export interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  nameOnCard: string;
  isDefault: boolean;
}

export interface ComplaintMessageView {
  author: "customer" | "admin";
  body: string;
  createdAt: string;
}

export interface ComplaintThread {
  id: string;
  subject: string;
  status: "open" | "solved";
  messages: ComplaintMessageView[];
  createdAt: string;
}

/** Ledger row derived from the user's paid orders. */
export interface TransactionRow {
  orderNumber: string;
  reference: string;
  method: string;
  channel: string | null;
  total: number;
  currency: string;
  paidAt: string;
}
