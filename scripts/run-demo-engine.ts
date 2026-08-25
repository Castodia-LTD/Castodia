import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  console.log("Demo Engine starting...");

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL was not loaded from .env.local",
    );
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY was not loaded from .env.local",
    );
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY was not loaded from .env.local",
    );
  }

  const { runDemoEngine } =
    await import("@/lib/core/demo-engine/api");

  const result =
    await runDemoEngine();

  console.log("Demo Engine complete:");
  console.log(result);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Demo Engine failed:");
    console.error(error);
    process.exit(1);
  });