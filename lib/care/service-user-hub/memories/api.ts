import { supabase } from "@/lib/supabase";

import type {
  CreateMemoryInput,
  MemoryPhotoRecord,
  MemoryPhotoWithUrl,
  MemoryRecord,
  MemoryWithPhotos,
  SetMemoryFamilyAccessInput,
  SetMemoryPhotoFamilyAccessInput,
  UpdateMemoryInput,
  UploadMemoryPhotoInput,
} from "./types";

const MEMORY_PHOTO_BUCKET = "memory-photos";
const SIGNED_URL_DURATION_SECONDS = 60 * 60;

function requiredText(
  value: string,
  fieldName: string,
) {
  const cleanValue = value.trim();

  if (!cleanValue) {
    throw new Error(`${fieldName} is required.`);
  }

  return cleanValue;
}

function optionalText(
  value: string | null | undefined,
) {
  const cleanValue = value?.trim();

  return cleanValue || null;
}

async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    throw new Error("You must be signed in.");
  }

  return user;
}

async function getProfileNames(
  profileIds: string[],
) {
  const uniqueIds = Array.from(
    new Set(profileIds.filter(Boolean)),
  );

  if (uniqueIds.length === 0) {
    return new Map<string, string | null>();
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", uniqueIds);

  if (error) {
    throw new Error(error.message);
  }

  return new Map(
    (data ?? []).map((profile) => [
      profile.id as string,
      (profile.full_name as string | null) ?? null,
    ]),
  );
}

async function createSignedPhotoUrl(
  storagePath: string,
) {
  const { data, error } = await supabase.storage
    .from(MEMORY_PHOTO_BUCKET)
    .createSignedUrl(
      storagePath,
      SIGNED_URL_DURATION_SECONDS,
    );

  if (error) {
    console.warn(
      "Unable to create signed memory photo URL:",
      error.message,
    );

    return null;
  }

  return data.signedUrl;
}

async function attachSignedUrls(
  photos: MemoryPhotoRecord[],
): Promise<MemoryPhotoWithUrl[]> {
  return Promise.all(
    photos.map(async (photo) => ({
      ...photo,
      signed_url: await createSignedPhotoUrl(
        photo.storage_path,
      ),
    })),
  );
}

export async function getMemories(
  serviceUserId: string,
): Promise<MemoryWithPhotos[]> {
  const cleanServiceUserId = requiredText(
    serviceUserId,
    "Service user ID",
  );

  const {
    data: memoryData,
    error: memoryError,
  } = await supabase
    .from("memories")
    .select("*")
    .eq(
      "service_user_id",
      cleanServiceUserId,
    )
    .eq("archived", false)
    .order("memory_date", {
      ascending: false,
    })
    .order("created_at", {
      ascending: false,
    });

  if (memoryError) {
    throw new Error(memoryError.message);
  }

  const memories =
    (memoryData ?? []) as MemoryRecord[];

  if (memories.length === 0) {
    return [];
  }

  const memoryIds = memories.map(
    (memory) => memory.id,
  );

  const {
    data: photoData,
    error: photoError,
  } = await supabase
    .from("memory_photos")
    .select("*")
    .in("memory_id", memoryIds)
    .order("display_order", {
      ascending: true,
    })
    .order("created_at", {
      ascending: true,
    });

  if (photoError) {
    throw new Error(photoError.message);
  }

  const photos =
    (photoData ?? []) as MemoryPhotoRecord[];

  const photosWithUrls =
    await attachSignedUrls(photos);

  const profileIds = memories.flatMap(
    (memory) =>
      [
        memory.created_by,
        memory.updated_by,
        memory.family_visibility_changed_by,
      ].filter(
        (value): value is string =>
          Boolean(value),
      ),
  );

  const names =
    await getProfileNames(profileIds);

  return memories.map((memory) => ({
    ...memory,

    photos: photosWithUrls.filter(
      (photo) =>
        photo.memory_id === memory.id,
    ),

    creator_name:
      names.get(memory.created_by) ??
      null,

    updated_by_name:
      memory.updated_by
        ? names.get(
            memory.updated_by,
          ) ?? null
        : null,

    family_visibility_changed_by_name:
      memory.family_visibility_changed_by
        ? names.get(
            memory.family_visibility_changed_by,
          ) ?? null
        : null,
  }));
}

export async function getMemory(
  memoryId: string,
): Promise<MemoryWithPhotos | null> {
  const cleanMemoryId = requiredText(
    memoryId,
    "Memory ID",
  );

  const {
    data: memoryRows,
    error,
  } = await supabase
    .from("memories")
    .select("*")
    .eq("id", cleanMemoryId)
    .eq("archived", false)
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  const memory =
    memoryRows?.[0] ?? null;

  if (!memory) {
    return null;
  }

  const {
    data: photoData,
    error: photoError,
  } = await supabase
    .from("memory_photos")
    .select("*")
    .eq(
      "memory_id",
      cleanMemoryId,
    )
    .order("display_order", {
      ascending: true,
    })
    .order("created_at", {
      ascending: true,
    });

  if (photoError) {
    throw new Error(photoError.message);
  }

  const typedMemory =
    memory as MemoryRecord;

  const photos =
    await attachSignedUrls(
      (photoData ??
        []) as MemoryPhotoRecord[],
    );

  const names =
    await getProfileNames(
      [
        typedMemory.created_by,
        typedMemory.updated_by,
        typedMemory.family_visibility_changed_by,
      ].filter(
        (value): value is string =>
          Boolean(value),
      ),
    );

  return {
    ...typedMemory,
    photos,

    creator_name:
      names.get(
        typedMemory.created_by,
      ) ?? null,

    updated_by_name:
      typedMemory.updated_by
        ? names.get(
            typedMemory.updated_by,
          ) ?? null
        : null,

    family_visibility_changed_by_name:
      typedMemory.family_visibility_changed_by
        ? names.get(
            typedMemory.family_visibility_changed_by,
          ) ?? null
        : null,
  };
}

export async function createMemory(
  input: CreateMemoryInput,
): Promise<MemoryRecord> {
  const user = await getCurrentUser();

  const title = requiredText(
    input.title,
    "Memory title",
  );

  const story = requiredText(
    input.story,
    "Memory story",
  );

  const memoryDate = requiredText(
    input.memoryDate,
    "Memory date",
  );

  console.log("Creating memory:", {
    userId: user.id,
    organisationId:
      input.organisationId,
    serviceUserId:
      input.serviceUserId,
  });

  const {
    data,
    error,
    status,
    statusText,
  } = await supabase
    .from("memories")
    .insert({
      organisation_id:
        input.organisationId,

      service_user_id:
        input.serviceUserId,

      title,
      story,

      memory_date:
        memoryDate,

      people_involved:
        optionalText(
          input.peopleInvolved,
        ),

      category:
        optionalText(
          input.category,
        ),

      created_by:
        user.id,

      family_visible:
        false,

      archived:
        false,
    })
    .select("*");

  console.log(
    "Memory insert result:",
    {
      data,
      error,
      status,
      statusText,
    },
  );

  if (error) {
    throw new Error(
      `Memory insert failed: ${error.message}`,
    );
  }

  if (
    !data ||
    data.length === 0
  ) {
    throw new Error(
      "The memory insert returned no record. Check the memories RLS INSERT and SELECT policies.",
    );
  }

  if (data.length > 1) {
    throw new Error(
      "The memory insert unexpectedly returned more than one record.",
    );
  }

  return data[0] as MemoryRecord;
}

export async function updateMemory(
  input: UpdateMemoryInput,
): Promise<MemoryRecord> {
  const user = await getCurrentUser();

  const title = requiredText(
    input.title,
    "Memory title",
  );

  const story = requiredText(
    input.story,
    "Memory story",
  );

  const memoryDate = requiredText(
    input.memoryDate,
    "Memory date",
  );

  const {
    data,
    error,
  } = await supabase
    .from("memories")
    .update({
      title,
      story,

      memory_date:
        memoryDate,

      people_involved:
        optionalText(
          input.peopleInvolved,
        ),

      category:
        optionalText(
          input.category,
        ),

      updated_by:
        user.id,

      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "id",
      input.memoryId,
    )
    .eq("archived", false)
    .select("*");

  if (error) {
    throw new Error(error.message);
  }

  if (
    !data ||
    data.length === 0
  ) {
    throw new Error(
      "The memory could not be updated or is no longer available.",
    );
  }

  if (data.length > 1) {
    throw new Error(
      "The memory update unexpectedly returned more than one record.",
    );
  }

  return data[0] as MemoryRecord;
}

export async function uploadMemoryPhoto(
  input: UploadMemoryPhotoInput,
): Promise<MemoryPhotoRecord> {
  const user = await getCurrentUser();

  if (!input.file) {
    throw new Error(
      "Please choose a photograph to upload.",
    );
  }

  const extension =
    input.file.name
      .split(".")
      .pop()
      ?.toLowerCase() ||
    "jpg";

  const photoId =
    crypto.randomUUID();

  const storagePath = [
    input.organisationId,
    input.serviceUserId,
    input.memoryId,
    `${photoId}.${extension}`,
  ].join("/");

  const { error: uploadError } =
    await supabase.storage
      .from(
        MEMORY_PHOTO_BUCKET,
      )
      .upload(
        storagePath,
        input.file,
        {
          cacheControl:
            "3600",

          upsert:
            false,
        },
      );

  if (uploadError) {
    throw new Error(
      uploadError.message,
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("memory_photos")
    .insert({
      memory_id:
        input.memoryId,

      storage_path:
        storagePath,

      caption:
        optionalText(
          input.caption,
        ),

      display_order:
        input.displayOrder ?? 0,

      created_by:
        user.id,

      family_visible:
        true,
    })
    .select("*");

  if (error) {
    await supabase.storage
      .from(
        MEMORY_PHOTO_BUCKET,
      )
      .remove([
        storagePath,
      ]);

    throw new Error(
      error.message,
    );
  }

  if (
    !data ||
    data.length === 0
  ) {
    await supabase.storage
      .from(
        MEMORY_PHOTO_BUCKET,
      )
      .remove([
        storagePath,
      ]);

    throw new Error(
      "The photograph uploaded successfully, but its memory record could not be saved.",
    );
  }

  if (data.length > 1) {
    throw new Error(
      "The photograph insert unexpectedly returned more than one record.",
    );
  }

  return data[0] as MemoryPhotoRecord;
}

export async function removeMemoryPhoto(
  photo: MemoryPhotoRecord,
): Promise<void> {
  const { error: storageError } =
    await supabase.storage
      .from(
        MEMORY_PHOTO_BUCKET,
      )
      .remove([
        photo.storage_path,
      ]);

  if (storageError) {
    throw new Error(
      storageError.message,
    );
  }

  const { error } =
    await supabase
      .from(
        "memory_photos",
      )
      .delete()
      .eq(
        "id",
        photo.id,
      );

  if (error) {
    throw new Error(
      error.message,
    );
  }
}

export async function setMemoryFamilyAccess(
  input: SetMemoryFamilyAccessInput,
): Promise<void> {
  const { error } =
    await supabase
      .from("memories")
      .update({
        family_visible:
          input.familyVisible,

        family_visibility_note:
          optionalText(
            input.note,
          ),
      })
      .eq(
        "id",
        input.memoryId,
      )
      .eq("archived", false);

  if (error) {
    throw new Error(
      error.message,
    );
  }
}

export async function setMemoryPhotoFamilyAccess(
  input: SetMemoryPhotoFamilyAccessInput,
): Promise<void> {
  const { error } =
    await supabase
      .from(
        "memory_photos",
      )
      .update({
        family_visible:
          input.familyVisible,

        family_visibility_note:
          optionalText(
            input.note,
          ),
      })
      .eq(
        "id",
        input.photoId,
      );

  if (error) {
    throw new Error(
      error.message,
    );
  }
}

export async function archiveMemory(
  memoryId: string,
): Promise<void> {
  const cleanMemoryId =
    requiredText(
      memoryId,
      "Memory ID",
    );

  const { error } =
    await supabase
      .from("memories")
      .update({
        archived: true,
      })
      .eq(
        "id",
        cleanMemoryId,
      );

  if (error) {
    throw new Error(
      error.message,
    );
  }
}