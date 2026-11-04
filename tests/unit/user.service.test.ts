import { describe, expect, it } from "vitest";

import { ServiceError } from "@/lib/errors";
import {
  createInitialAdmin,
  registerCustomer,
  verifyCredentials,
} from "@/server/services/user.service";
import { createFakeUserRepository } from "../helpers/fake-user-repository";

const CUSTOMER = {
  email: "  User@Example.gov ",
  password: "custom3rPass!",
  displayName: "  Test User  ",
};

describe("registerCustomer", () => {
  it("creates a customer with normalized email and trimmed name", async () => {
    const repo = createFakeUserRepository();
    const user = await registerCustomer(CUSTOMER, repo);
    expect(user.email).toBe("user@example.gov");
    expect(user.displayName).toBe("Test User");
    expect(user.roles).toEqual(["customer"]);
    expect(user.status).toBe("active");
    expect(user).not.toHaveProperty("passwordHash");
  });

  it("rejects duplicate emails safely", async () => {
    const repo = createFakeUserRepository();
    await registerCustomer(CUSTOMER, repo);
    await expect(registerCustomer(CUSTOMER, repo)).rejects.toMatchObject({
      code: "conflict",
      status: 409,
    } satisfies Partial<ServiceError>);
  });

  it("assigns only the customer role regardless of extra input", async () => {
    const repo = createFakeUserRepository();
    const user = await registerCustomer(
      { ...CUSTOMER, ...{ roles: ["admin"] } },
      repo,
    );
    expect(user.roles).toEqual(["customer"]);
  });
});

describe("verifyCredentials", () => {
  it("returns the user for valid credentials", async () => {
    const repo = createFakeUserRepository();
    await registerCustomer(CUSTOMER, repo);
    const user = await verifyCredentials("user@example.gov", CUSTOMER.password, repo);
    expect(user?.email).toBe("user@example.gov");
    expect(user).not.toHaveProperty("passwordHash");
  });

  it("returns null for wrong password and unknown email", async () => {
    const repo = createFakeUserRepository();
    await registerCustomer(CUSTOMER, repo);
    expect(await verifyCredentials("user@example.gov", "wr0ng pass", repo)).toBeNull();
    expect(await verifyCredentials("ghost@example.gov", CUSTOMER.password, repo)).toBeNull();
  });

  it("returns null for suspended accounts", async () => {
    const repo = createFakeUserRepository();
    await registerCustomer(CUSTOMER, repo);
    const doc = repo.users.get("user@example.gov")!;
    doc.status = "suspended";
    expect(await verifyCredentials("user@example.gov", CUSTOMER.password, repo)).toBeNull();
  });
});

describe("createInitialAdmin", () => {
  const ADMIN = { email: "Admin@Example.gov", password: "adm1nSecret!!x", displayName: "Root" };

  it("creates an admin for a fresh email", async () => {
    const repo = createFakeUserRepository();
    const result = await createInitialAdmin(ADMIN, repo);
    expect(result).toEqual({ outcome: "created", email: "admin@example.gov" });
    const stored = repo.users.get("admin@example.gov");
    expect(stored?.roles).toEqual(["admin"]);
    expect(stored?.passwordHash).not.toBe(ADMIN.password);
  });

  it("does not reset an existing admin password on rerun", async () => {
    const repo = createFakeUserRepository();
    await createInitialAdmin(ADMIN, repo);
    const before = repo.users.get("admin@example.gov")!.passwordHash;
    const result = await createInitialAdmin(
      { ...ADMIN, password: "newPassw0rd!!" },
      repo,
    );
    expect(result.outcome).toBe("already-admin");
    expect(repo.users.get("admin@example.gov")!.passwordHash).toBe(before);
  });

  it("refuses to elevate an existing customer account", async () => {
    const repo = createFakeUserRepository();
    await registerCustomer(
      { email: ADMIN.email, password: "cust0merPass!", displayName: "Cust" },
      repo,
    );
    const result = await createInitialAdmin(ADMIN, repo);
    expect(result.outcome).toBe("refused-existing-user");
    expect(repo.users.get("admin@example.gov")!.roles).toEqual(["customer"]);
  });
});
