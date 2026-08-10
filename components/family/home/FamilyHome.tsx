"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  Loader2,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

import {
  getFamilyMemories,
  type FamilyMemory,
} from "@/lib/family/memories/api";

import FamilyWelcome from "./FamilyWelcome";
import MemoryOfTheDay from "./MemoryOfTheDay";
import RecentMemories from "./RecentMemories";
import MemoriesByMonth from "./MemoriesByMonth";

type FamilyUser = {
  id: string;
  auth_user_id: string;
  service_user_id: string;
  organisation_id: string;
  full_name: string;
  email: string;
  relationship: string | null;
  is_active: boolean;
};

type ServiceUser = {
  id: string;
  full_name: string;
  first_name: string | null;
  surname: string | null;
  photo_path: string | null;
};

type FamilyHomeData = {
  familyUser: FamilyUser;
  serviceUser: ServiceUser;
  memories: FamilyMemory[];
};

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Castodia Family could not be loaded.";
}

export default function FamilyHome() {
  const [data, setData] =
    useState<FamilyHomeData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadFamilyHome() {
      try {
        setLoading(true);
        setErrorMessage(null);

        // -------------------------------------
        // 1. Authenticated user
        // -------------------------------------

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          throw new Error(
            "Your Family session could not be found.",
          );
        }

        // -------------------------------------
        // 2. Resolve Family access
        // -------------------------------------

        const {
          data: familyRows,
          error: familyError,
        } = await supabase
          .from("family_users")
          .select(`
            id,
            auth_user_id,
            service_user_id,
            organisation_id,
            full_name,
            email,
            relationship,
            is_active
          `)
          .eq("auth_user_id", user.id)
          .eq("is_active", true)
          .limit(1);

        if (familyError) {
          throw familyError;
        }

        const familyUser =
          familyRows?.[0] ?? null;

        if (!familyUser) {
          throw new Error(
            "Your Family access could not be found.",
          );
        }

        // -------------------------------------
        // 3. Resolve linked service user
        // -------------------------------------

        const {
          data: serviceUserRows,
          error: serviceUserError,
        } = await supabase
          .from("service_users")
          .select(`
            id,
            full_name,
            first_name,
            surname,
            photo_path
          `)
          .eq(
            "id",
            familyUser.service_user_id,
          )
          .limit(1);

        if (serviceUserError) {
          throw serviceUserError;
        }

        const serviceUser =
          serviceUserRows?.[0] ?? null;

        if (!serviceUser) {
          throw new Error(
            "The person linked to your Family account could not be found.",
          );
        }

        // -------------------------------------
        // 4. Load approved Family memories
        // -------------------------------------

        const memories =
          await getFamilyMemories(
            serviceUser.id,
          );

        // -------------------------------------
        // 5. Store completed home data
        // -------------------------------------

        if (!mounted) {
          return;
        }

        setData({
          familyUser:
            familyUser as FamilyUser,

          serviceUser:
            serviceUser as ServiceUser,

          memories,
        });
      } catch (error) {
        console.error(
          "Unable to load Family home:",
          error,
        );

        if (!mounted) {
          return;
        }

        setData(null);

        setErrorMessage(
          getErrorMessage(error),
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadFamilyHome();

    return () => {
      mounted = false;
    };
  }, []);

  // -------------------------------------------
  // Loading
  // -------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="text-center">
          <Loader2
            className="mx-auto h-6 w-6 animate-spin text-[#61745f]"
          />

          <p className="mt-4 text-sm font-medium text-[#69736a]">
            Loading your Family space...
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------
  // Error
  // -------------------------------------------

  if (errorMessage || !data) {
    return (
      <div className="rounded-[28px] border border-[#d8cabb] bg-[#fff8f2]/80 p-6 shadow-sm backdrop-blur-xl">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0ded2] text-[#865f4a]">
          <AlertTriangle size={20} />
        </div>

        <h1 className="mt-4 text-xl font-semibold text-[#4d433d]">
          Family home unavailable
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-[#796c63]">
          {errorMessage ||
            "Your Family home could not be loaded."}
        </p>
      </div>
    );
  }

  // -------------------------------------------
  // Resolved data
  // -------------------------------------------

  const {
    familyUser,
    serviceUser,
    memories,
  } = data;

  const serviceUserName =
    serviceUser.first_name?.trim() ||
    serviceUser.full_name.trim();

  // -------------------------------------------
  // Prepare real memory data for components
  // -------------------------------------------

  const featuredMemory =
    memories.length > 0
      ? memories[0]
      : null;

  const recentMemories =
    memories.slice(0, 5);

  const monthsMap = new Map<
    string,
    {
      key: string;
      label: string;
      count: number;
      coverImageUrl: string | null;
    }
  >();

  for (const memory of memories) {
    const date =
      new Date(memory.memory_date);

    const key = `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}`;

    const label =
      new Intl.DateTimeFormat(
        "en-GB",
        {
          month: "long",
          year: "numeric",
        },
      ).format(date);

    const existing =
      monthsMap.get(key);

    if (existing) {
      existing.count += 1;

      if (
        !existing.coverImageUrl &&
        memory.photos[0]?.signed_url
      ) {
        existing.coverImageUrl =
          memory.photos[0].signed_url;
      }

      continue;
    }

    monthsMap.set(key, {
      key,
      label,
      count: 1,

      coverImageUrl:
        memory.photos[0]?.signed_url ??
        null,
    });
  }

  const months =
    Array.from(
      monthsMap.values(),
    );

  // -------------------------------------------
  // Render
  // -------------------------------------------

  return (
    <div className="space-y-10">
      <FamilyWelcome
        familyMemberName={
          familyUser.full_name
        }
        serviceUserName={
          serviceUserName
        }
        relationship={
          familyUser.relationship
        }
      />

      <MemoryOfTheDay
        serviceUserName={
          serviceUserName
        }
        memory={
          featuredMemory
            ? {
                id:
                  featuredMemory.id,

                title:
                  featuredMemory.title,

                description:
                  featuredMemory.story,

                memoryDate:
                  featuredMemory.memory_date,

                location:
                  null,

                imageUrl:
                  featuredMemory
                    .photos[0]
                    ?.signed_url ??
                  null,
              }
            : null
        }
      />

      <RecentMemories
        serviceUserName={
          serviceUserName
        }
        memories={recentMemories.map(
          (memory) => ({
            id: memory.id,

            title:
              memory.title,

            memoryDate:
              memory.memory_date,

            imageUrl:
              memory.photos[0]
                ?.signed_url ??
              null,
          }),
        )}
      />

      <MemoriesByMonth
        serviceUserName={
          serviceUserName
        }
        months={months}
      />
    </div>
  );
}