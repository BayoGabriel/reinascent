import { describe, expect, it } from "vitest";

import {
  adminBootstrapSchema,
  registerSchema,
  signInSchema,
} from "@/features/auth/schemas";
import { reviewSubmissionSchema } from "@/features/products/schema";
import { normalizeEmail } from "@/server/services/user.service";

describe("email normalization", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Alice@Example.COM ")).toBe("alice@example.com");
  });
});

describe("signInSchema", () => {
  it("accepts credentials", () => {
    expect(
      signInSchema.safeParse({ email: "a@b.co", password: "x" }).success,
    ).toBe(true);
  });

  it("rejects an invalid email and empty password", () => {
    const bad = signInSchema.safeParse({ email: "nope", password: "" });
    expect(bad.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const valid = {
    displayName: "Amina Yusuf",
    email: "amina@example.gov",
    password: "str0ngPassword1",
  };

  it("accepts a valid registration", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects weak passwords", () => {
    for (const password of ["short1a", "onlyletterslong", "12345678901234"]) {
      expect(
        registerSchema.safeParse({ ...valid, password }).success,
      ).toBe(false);
    }
  });

  it("rejects short display names", () => {
    expect(
      registerSchema.safeParse({ ...valid, displayName: "A" }).success,
    ).toBe(false);
  });
});

describe("adminBootstrapSchema", () => {
  it("defaults displayName and validates policy", () => {
    const parsed = adminBootstrapSchema.parse({
      email: "root@example.gov",
      password: "adm1nPassword99",
    });
    expect(parsed.displayName).toBe("Administrator");
  });
});

describe("reviewSubmissionSchema", () => {
  const valid = {
    slug: "amber-damp-incense",
    rating: 4,
    title: "Lovely scent",
    body: "Burns evenly and the fragrance fills the room.",
  };

  it("accepts a valid review", () => {
    expect(reviewSubmissionSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing or out-of-range ratings", () => {
    for (const rating of [0, 6, 2.5, NaN]) {
      expect(
        reviewSubmissionSchema.safeParse({ ...valid, rating }).success,
      ).toBe(false);
    }
  });

  it("requires a title and a body under 1000 chars", () => {
    expect(
      reviewSubmissionSchema.safeParse({ ...valid, title: " " }).success,
    ).toBe(false);
    expect(
      reviewSubmissionSchema.safeParse({ ...valid, body: "x".repeat(1001) })
        .success,
    ).toBe(false);
  });

  it("rejects malformed slugs", () => {
    for (const slug of ["Amber", "a/b", "../x", ""]) {
      expect(
        reviewSubmissionSchema.safeParse({ ...valid, slug }).success,
      ).toBe(false);
    }
  });
});
