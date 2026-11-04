import { ObjectId } from "mongodb";

import {
  DuplicateEmailError,
  type NewUser,
  type PublicUser,
  type UserDocument,
  type UserRepository,
} from "@/server/repositories/user.repository";

/** In-memory UserRepository for service-level unit tests. */
export function createFakeUserRepository(): UserRepository & {
  users: Map<string, UserDocument>;
} {
  const users = new Map<string, UserDocument>();

  const toPublic = (doc: UserDocument): PublicUser => {
    const { passwordHash, ...rest } = doc;
    void passwordHash;
    return rest;
  };

  return {
    users,
    async ensureIndexes() {},
    async findByEmail(email) {
      const doc = users.get(email);
      return doc ? toPublic(doc) : null;
    },
    async findCredentialsByEmail(email) {
      const doc = users.get(email);
      return doc
        ? { _id: doc._id, passwordHash: doc.passwordHash, status: doc.status }
        : null;
    },
    async findCredentialsById(id) {
      for (const doc of users.values()) {
        if (doc._id.toHexString() === id) {
          return {
            _id: doc._id,
            passwordHash: doc.passwordHash,
            status: doc.status,
          };
        }
      }
      return null;
    },
    async findById(id) {
      for (const doc of users.values()) {
        if (doc._id.toHexString() === id) return toPublic(doc);
      }
      return null;
    },
    async create(user: NewUser) {
      if (users.has(user.email)) throw new DuplicateEmailError();
      const doc: UserDocument = {
        _id: new ObjectId(),
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
        ...user,
      };
      users.set(doc.email, doc);
      return toPublic(doc);
    },
    async updateProfile(id, patch) {
      for (const doc of users.values()) {
        if (doc._id.toHexString() === id) {
          Object.assign(doc, patch, { updatedAt: new Date() });
          return toPublic(doc);
        }
      }
      return null;
    },
    async updateAddress(id, address) {
      for (const doc of users.values()) {
        if (doc._id.toHexString() === id) {
          doc.shippingAddress = address;
          doc.updatedAt = new Date();
          return toPublic(doc);
        }
      }
      return null;
    },
    async updatePassword(id, passwordHash) {
      for (const doc of users.values()) {
        if (doc._id.toHexString() === id) {
          doc.passwordHash = passwordHash;
          doc.updatedAt = new Date();
          delete doc.mustChangePassword;
          return;
        }
      }
    },
    async listAll(limit, skip) {
      return [...users.values()]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(skip, skip + limit)
        .map(toPublic);
    },
    async countAll() {
      return users.size;
    },
    async setStatus(id, status) {
      for (const doc of users.values()) {
        if (doc._id.toHexString() === id) {
          doc.status = status;
          doc.updatedAt = new Date();
          return true;
        }
      }
      return false;
    },
    async setRoles(id, roles) {
      for (const doc of users.values()) {
        if (doc._id.toHexString() === id) {
          doc.roles = roles;
          doc.updatedAt = new Date();
          return true;
        }
      }
      return false;
    },
  };
}
