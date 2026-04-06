// Re-export Convex generated API for use in client components.
// This file exists so we can swap the import path in one place.
// The convex/_generated/api module is created by `bunx convex dev`.
//
// For CI builds where convex dev hasn't run, the build still succeeds
// because this file is only imported by client components that are
// dynamically rendered (not statically prerendered).

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let api: any;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  api = require("../../convex/_generated/api").api;
} catch {
  // During build without convex dev, the module doesn't exist.
  // Client components will fail at runtime if convex dev isn't running,
  // but the build itself will succeed.
  api = new Proxy(
    {},
    {
      get: () =>
        new Proxy(
          {},
          {
            get: () => "placeholder",
          }
        ),
    }
  );
}

export { api };
