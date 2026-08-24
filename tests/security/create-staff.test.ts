import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  createClientMock,
} = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}));

vi.mock(
  "@supabase/supabase-js",
  () => ({
    createClient: createClientMock,
  }),
);

import { POST } from "../../app/api/admin/create-staff/route";

type Profile = {
  id: string;
  organisation_id: string | null;
  role: string;
};

function makeRequest(
  body: Record<string, unknown>,
  token?: string,
) {
  return new Request(
    "http://localhost/api/admin/create-staff",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
      body: JSON.stringify(body),
    },
  );
}

function authClient(options?: {
  userId?: string;
  authError?: Error | null;
}) {
  const userId =
    options?.userId ?? "manager-a";

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: options?.authError
            ? null
            : { id: userId },
        },
        error: options?.authError ?? null,
      }),
    },
  };
}

function adminClient(options?: {
  profile?: Profile | null;
  profileError?: Error | null;
  createUserError?: Error | null;
  profileInsertError?: Error | null;
}) {
  const profile =
    options?.profile === undefined
      ? {
          id: "manager-a",
          organisation_id: "org-a",
          role: "manager",
        }
      : options.profile;

  const single = vi.fn().mockResolvedValue({
    data: profile,
    error: options?.profileError ?? null,
  });

  const eq = vi.fn(() => ({
    single,
  }));

  const select = vi.fn(() => ({
    eq,
  }));

  const insert = vi.fn().mockResolvedValue({
    error:
      options?.profileInsertError ?? null,
  });

  const createUser = vi.fn().mockResolvedValue({
    data: options?.createUserError
      ? { user: null }
      : {
          user: {
            id: "new-user-id",
          },
        },
    error:
      options?.createUserError ?? null,
  });

  const deleteUser =
    vi.fn().mockResolvedValue({
      data: {},
      error: null,
    });

  return {
    client: {
      from: vi.fn((table: string) => {
        if (table !== "profiles") {
          throw new Error(
            `Unexpected table: ${table}`,
          );
        }

        return {
          select,
          insert,
        };
      }),
      auth: {
        admin: {
          createUser,
          deleteUser,
        },
      },
    },
    spies: {
      select,
      eq,
      single,
      insert,
      createUser,
      deleteUser,
    },
  };
}

const validBody = {
  fullName: "Test Support",
  email: "test.support@example.test",
  password: "TempPassword123!",
  role: "support",
};

describe(
  "POST /api/admin/create-staff",
  () => {
    beforeEach(() => {
      createClientMock.mockReset();
    });

    test(
      "denies unauthenticated callers",
      async () => {
        const response = await POST(
          makeRequest(validBody),
        );

        expect(response.status).toBe(401);

        const result =
          await response.json();

        expect(result.error).toMatch(
          /authentication required/i,
        );

        expect(
          createClientMock,
        ).not.toHaveBeenCalled();
      },
    );

    test(
      "denies invalid or expired sessions",
      async () => {
        createClientMock.mockReturnValueOnce(
          authClient({
            authError: new Error(
              "Invalid token",
            ),
          }),
        );

        const response = await POST(
          makeRequest(
            validBody,
            "invalid-token",
          ),
        );

        expect(response.status).toBe(401);

        const result =
          await response.json();

        expect(result.error).toMatch(
          /invalid or expired session/i,
        );
      },
    );

    test(
      "denies support workers from creating staff",
      async () => {
        const admin = adminClient({
          profile: {
            id: "support-a",
            organisation_id: "org-a",
            role: "support",
          },
        });

        createClientMock
          .mockReturnValueOnce(
            authClient({
              userId: "support-a",
            }),
          )
          .mockReturnValueOnce(
            admin.client,
          );

        const response = await POST(
          makeRequest(
            validBody,
            "support-token",
          ),
        );

        expect(response.status).toBe(403);

        expect(
          admin.spies.createUser,
        ).not.toHaveBeenCalled();
      },
    );

    test(
      "rejects platform-level roles",
      async () => {
        const response = await POST(
          makeRequest({
            ...validBody,
            role: "castodia_owner",
          }),
        );

        expect(response.status).toBe(400);
        expect(
          createClientMock,
        ).not.toHaveBeenCalled();
      },
    );

    test(
      "uses the verified manager organisation when creating staff",
      async () => {
        const admin = adminClient({
          profile: {
            id: "verified-manager",
            organisation_id: "org-a",
            role: "manager",
          },
        });

        createClientMock
          .mockReturnValueOnce(
            authClient({
              userId:
                "verified-manager",
            }),
          )
          .mockReturnValueOnce(
            admin.client,
          );

        const response = await POST(
          makeRequest(
            validBody,
            "manager-token",
          ),
        );

        expect(response.status).toBe(200);

        expect(
          admin.spies.createUser,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            email:
              "test.support@example.test",
            password:
              "TempPassword123!",
            email_confirm: true,
          }),
        );

        expect(
          admin.spies.insert,
        ).toHaveBeenCalledWith({
          id: "new-user-id",
          full_name: "Test Support",
          role: "support",
          organisation_id: "org-a",
        });
      },
    );

    test(
      "rolls back the Auth user when profile creation fails",
      async () => {
        const admin = adminClient({
          profileInsertError:
            new Error(
              "Profile insert failed",
            ),
        });

        createClientMock
          .mockReturnValueOnce(
            authClient(),
          )
          .mockReturnValueOnce(
            admin.client,
          );

        const response = await POST(
          makeRequest(
            validBody,
            "manager-token",
          ),
        );

        expect(response.status).toBe(400);

        expect(
          admin.spies.deleteUser,
        ).toHaveBeenCalledWith(
          "new-user-id",
        );
      },
    );
  },
);
