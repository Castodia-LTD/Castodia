import { supabase } from "@/lib/supabase";

const MEMORY_PHOTO_BUCKET = "memory-photos";
const SIGNED_URL_DURATION_SECONDS = 60 * 60;

export type FamilyMemoryPhoto = {
  id: string;
  memory_id: string;
  storage_path: string;
  caption: string | null;
  display_order: number;
  signed_url: string | null;
};

export type FamilyMemory = {
  id: string;
  service_user_id: string;
  title: string;
  story: string;
  memory_date: string;
  people_involved: string | null;
  category: string | null;
  created_at: string;

  photos: FamilyMemoryPhoto[];
};

async function createSignedPhotoUrl(
  storagePath: string,
) {
  const { data, error } =
    await supabase.storage
      .from(MEMORY_PHOTO_BUCKET)
      .createSignedUrl(
        storagePath,
        SIGNED_URL_DURATION_SECONDS,
      );

  if (error) {
    console.warn(
      "Unable to create Family memory photo URL:",
      error.message,
    );

    return null;
  }

  return data.signedUrl;
}

export async function getFamilyMemories(
  serviceUserId: string,
): Promise<FamilyMemory[]> {
  const cleanServiceUserId =
    serviceUserId.trim();

  if (!cleanServiceUserId) {
    throw new Error(
      "Service user ID is required.",
    );
  }

  // -----------------------------------------
  // Family-visible memories only
  // -----------------------------------------

  const {
    data: memoryData,
    error: memoryError,
  } = await supabase
    .from("memories")
    .select(`
      id,
      service_user_id,
      title,
      story,
      memory_date,
      people_involved,
      category,
      created_at
    `)
    .eq(
      "service_user_id",
      cleanServiceUserId,
    )
    .eq("family_visible", true)
    .eq("archived", false)
    .order("memory_date", {
      ascending: false,
    })
    .order("created_at", {
      ascending: false,
    });

  if (memoryError) {
    throw new Error(
      memoryError.message,
    );
  }

  const memories =
    (memoryData ?? []) as Omit<
      FamilyMemory,
      "photos"
    >[];

  if (memories.length === 0) {
    return [];
  }

  // -----------------------------------------
  // Family-visible photos only
  // -----------------------------------------

  const memoryIds =
    memories.map(
      (memory) => memory.id,
    );

  const {
    data: photoData,
    error: photoError,
  } = await supabase
    .from("memory_photos")
    .select(`
      id,
      memory_id,
      storage_path,
      caption,
      display_order
    `)
    .in("memory_id", memoryIds)
    .eq("family_visible", true)
    .order("display_order", {
      ascending: true,
    })
    .order("created_at", {
      ascending: true,
    });

  if (photoError) {
    throw new Error(
      photoError.message,
    );
  }

  const photos =
    photoData ?? [];

  const photosWithUrls:
    FamilyMemoryPhoto[] =
    await Promise.all(
      photos.map(
        async (photo) => ({
          id: photo.id as string,

          memory_id:
            photo.memory_id as string,

          storage_path:
            photo.storage_path as string,

          caption:
            (photo.caption as
              | string
              | null) ?? null,

          display_order:
            (photo.display_order as number) ??
            0,

          signed_url:
            await createSignedPhotoUrl(
              photo.storage_path as string,
            ),
        }),
      ),
    );

  return memories.map(
    (memory) => ({
      ...memory,

      photos:
        photosWithUrls.filter(
          (photo) =>
            photo.memory_id ===
            memory.id,
        ),
    }),
  );
}