export type MemoryPortal = "manager" | "support";

export type MemoryRecord = {
  id: string;

  organisation_id: string;
  service_user_id: string;

  title: string;
  story: string;
  memory_date: string;

  people_involved: string | null;
  category: string | null;

  created_by: string;
  created_at: string;

  updated_by: string | null;
  updated_at: string;

  family_visible: boolean;

  family_visibility_changed_by: string | null;
  family_visibility_changed_at: string | null;
  family_visibility_note: string | null;

  archived: boolean;
  archived_by: string | null;
  archived_at: string | null;
};

export type MemoryPhotoRecord = {
  id: string;

  memory_id: string;

  storage_path: string;
  caption: string | null;
  display_order: number;

  created_by: string;
  created_at: string;

  family_visible: boolean;

  family_visibility_changed_by: string | null;
  family_visibility_changed_at: string | null;
  family_visibility_note: string | null;
};

export type MemoryPhotoWithUrl = MemoryPhotoRecord & {
  signed_url: string | null;
};

export type MemoryWithPhotos = MemoryRecord & {
  photos: MemoryPhotoWithUrl[];

  creator_name: string | null;
  updated_by_name: string | null;

  family_visibility_changed_by_name: string | null;
};

export type CreateMemoryInput = {
  organisationId: string;
  serviceUserId: string;

  title: string;
  story: string;
  memoryDate: string;

  peopleInvolved?: string | null;
  category?: string | null;
};

export type UpdateMemoryInput = {
  memoryId: string;

  title: string;
  story: string;
  memoryDate: string;

  peopleInvolved?: string | null;
  category?: string | null;
};

export type UploadMemoryPhotoInput = {
  organisationId: string;
  serviceUserId: string;
  memoryId: string;

  file: File;

  caption?: string | null;
  displayOrder?: number;
};

export type SetMemoryFamilyAccessInput = {
  memoryId: string;
  familyVisible: boolean;
  note?: string | null;
};

export type SetMemoryPhotoFamilyAccessInput = {
  photoId: string;
  familyVisible: boolean;
  note?: string | null;
};

export type MemoryGalleryFilter = {
  category?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  searchText?: string | null;
};