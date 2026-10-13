/** Report application boundary errors locally without editor-specific telemetry. */
export function reportRuntimeError(error: unknown, context: Record<string, unknown> = {}) {
  console.error("Application error", error, context);
}
