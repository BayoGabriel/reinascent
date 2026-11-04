type LogLevel = "info" | "warn" | "error";

type LogFields = Record<string, string | number | boolean | undefined>;

function write(level: LogLevel, message: string, fields?: LogFields): void {
  const entry = { level, message, ...fields };
  // Never pass secrets, hashes, tokens, cookies, or PII into fields.
  console[level](JSON.stringify(entry));
}

export const logger = {
  info: (message: string, fields?: LogFields) => write("info", message, fields),
  warn: (message: string, fields?: LogFields) => write("warn", message, fields),
  error: (message: string, fields?: LogFields) =>
    write("error", message, fields),
};
