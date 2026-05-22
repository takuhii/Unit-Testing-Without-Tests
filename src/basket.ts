/**
 * Shopping basket utility functions.
 *
 * This file is intentionally designed to be easy to unit test.
 * There are multiple paths, edge cases, and validation rules
 * that make it good practice for writing Jest/Vitest tests.
 */

export interface BasketItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  taxable?: boolean;
}

export interface DiscountCode {
  code: string;
  percentage: number;
  active: boolean;
}

export interface BasketSummary {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}

const TAX_RATE = 0.2;

export function calculateBasketTotal(
  items: BasketItem[],
  discountCode?: DiscountCode
): BasketSummary {
  if (!Array.isArray(items)) {
    throw new Error("Items must be an array");
  }

  if (items.length === 0) {
    return {
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
    };
  }

  let subtotal = 0;
  let tax = 0;

  for (const item of items) {
    validateItem(item);

    const itemTotal = item.price * item.quantity;

    subtotal += itemTotal;

    if (item.taxable !== false) {
      tax += itemTotal * TAX_RATE;
    }
  }

  let discount = 0;

  if (discountCode) {
    validateDiscountCode(discountCode);

    if (discountCode.active) {
      discount = subtotal * (discountCode.percentage / 100);
    }
  }

  const total = subtotal + tax - discount;

  return {
    subtotal: roundToTwoDecimals(subtotal),
    tax: roundToTwoDecimals(tax),
    discount: roundToTwoDecimals(discount),
    total: roundToTwoDecimals(total),
  };
}

export function isBasketEmpty(items: BasketItem[]): boolean {
  return items.length === 0;
}

export function calculateItemCount(items: BasketItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function hasDiscount(discount?: DiscountCode): boolean {
  return !!discount?.active;
}

function validateItem(item: BasketItem): void {
  if (!item.id || item.id.trim().length === 0) {
    throw new Error("Item ID is required");
  }

  if (!item.name || item.name.trim().length === 0) {
    throw new Error("Item name is required");
  }

  if (item.price < 0) {
    throw new Error("Item price cannot be negative");
  }

  if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
    throw new Error("Quantity must be a positive integer");
  }
}

function validateDiscountCode(discountCode: DiscountCode): void {
  if (!discountCode.code) {
    throw new Error("Discount code is required");
  }

  if (
    discountCode.percentage < 0 ||
    discountCode.percentage > 100
  ) {
    throw new Error("Discount percentage must be between 0 and 100");
  }
}

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}
