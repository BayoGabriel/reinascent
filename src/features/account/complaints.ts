import "server-only";

import { ServiceError } from "@/lib/errors";
import {
  getComplaintRepository,
  type ComplaintDocument,
  type ComplaintStatus,
} from "@/server/repositories/complaint.repository";
import type { ComplaintInput } from "./schemas";
import type { ComplaintThread } from "./types";

function toThread(doc: ComplaintDocument): ComplaintThread {
  return {
    id: doc._id.toHexString(),
    subject: doc.subject,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
    messages: doc.messages.map((m) => ({
      author: m.author,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    })),
  };
}

export async function listComplaints(
  userId: string,
): Promise<ComplaintThread[]> {
  const repo = await getComplaintRepository();
  if (!repo) return [];
  return (await repo.listByUser(userId)).map(toThread);
}

export async function createComplaint(
  userId: string,
  input: ComplaintInput,
): Promise<void> {
  const repo = await getComplaintRepository();
  if (!repo) {
    throw new ServiceError("internal", "Complaints are unavailable.", 503);
  }
  await repo.insert({ userId, subject: input.subject, body: input.message });
}

export async function setComplaintStatus(
  userId: string,
  complaintId: string,
  status: ComplaintStatus,
): Promise<boolean> {
  const repo = await getComplaintRepository();
  if (!repo) return false;
  return repo.setStatus(userId, complaintId, status);
}
