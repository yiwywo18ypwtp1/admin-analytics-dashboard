// There is no auth or multi-project support in this app, so the "current"
// project and admin are constants. In a real app they would come from the session.

export const APP_NAME = "Admin Dashboard";

export const CURRENT_PROJECT = {
  name: "Acme SaaS",
  plan: "Pro",
};

export const CURRENT_ADMIN = {
  name: "Alex Morgan",
  email: "admin@acme.dev",
  role: "Owner",
};

// Image hosts that next/image is allowed to optimize (used by next.config.ts and <Avatar>).
// An allowlist, not "any host": otherwise anyone could use our server as a free image proxy.
export const OPTIMIZED_IMAGE_HOSTS = ["i.pravatar.cc"];
