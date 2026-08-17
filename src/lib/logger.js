const safeErrorFields = (error) => ({
  name: error?.name,
  code: error?.code,
  type: error?.type,
});

export function logError(event, error, context = {}) {
  console.error(
    JSON.stringify({
      level: "error",
      event,
      timestamp: new Date().toISOString(),
      ...safeErrorFields(error),
      ...context,
    }),
  );
}

export function logWarning(event, context = {}) {
  console.warn(
    JSON.stringify({
      level: "warning",
      event,
      timestamp: new Date().toISOString(),
      ...context,
    }),
  );
}
