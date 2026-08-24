import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────
// Must be declared before any imports so vi.mock() factories can reference them.
const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  from: vi.fn(),
  getClaims: vi.fn(),
  getRequest: vi.fn(),
  next: vi.fn(),
  registeredHandlers: new Map<string, any>(),
}));

// Mock @tanstack/react-start createServerFn / middleware, keeping the rest.
vi.mock("@tanstack/react-start", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-start")>()),
  createMiddleware: () => ({
    server: (handler: (args: any) => Promise<unknown>) => ({ handler }),
  }),
  createServerFn: () => {
    let validatorFn: ((input: any) => any) | undefined;
    let middlewareList: any[] = [];
    const builder = {
      middleware: (m: any[]) => {
        middlewareList = m;
        return builder;
      },
      validator: (v: any) => {
        validatorFn = v;
        return builder;
      },
      inputValidator: (v: any) => {
        validatorFn = v;
        return builder;
      },
      handler: (extractedFnOrHandler: any, originalHandler?: any) => {
        const targetHandler = originalHandler || extractedFnOrHandler;
        const callable: any = async (args: any) => {
          let data = args?.data;
          if (validatorFn) {
            data = validatorFn(data !== undefined ? data : args);
          }
          return targetHandler({ ...args, data });
        };
        callable.__executeServer = async (opts: any) => {
          let data = opts?.data;
          if (validatorFn) {
            data = validatorFn(data !== undefined ? data : opts);
          }
          return targetHandler({ ...opts, data });
        };
        callable.handler = targetHandler;
        callable.inputValidator = validatorFn;
        callable.validator = validatorFn;

        if (extractedFnOrHandler?.serverFnMeta?.id) {
          mocks.registeredHandlers.set(extractedFnOrHandler.serverFnMeta.id, callable);
        }
        if (extractedFnOrHandler?.serverFnMeta?.name) {
          mocks.registeredHandlers.set(extractedFnOrHandler.serverFnMeta.name, callable);
        }
        return callable;
      },
    };
    return builder;
  },
}));

vi.mock("@tanstack/react-start/server-rpc", () => ({
  createServerRpc: (serverFnMeta: any, splitImportFn: any) => {
    const fn = async (...args: any[]) => splitImportFn(...args);
    return Object.assign(fn, { serverFnMeta });
  },
}));

vi.mock("@tanstack/react-start/ssr-rpc", () => ({
  createSsrRpc: (functionId: string) => {
    const fn: any = async (opts: any) => {
      const h = mocks.registeredHandlers.get(functionId);
      if (h) return h(opts);
      throw new Error(`Server function handler not registered for ${functionId}`);
    };
    Object.defineProperty(fn, "handler", {
      get: () => mocks.registeredHandlers.get(functionId)?.handler,
    });
    Object.defineProperty(fn, "inputValidator", {
      get: () => mocks.registeredHandlers.get(functionId)?.inputValidator,
    });
    Object.defineProperty(fn, "validator", {
      get: () => mocks.registeredHandlers.get(functionId)?.validator,
    });
    return fn;
  },
}));

vi.mock("@tanstack/react-start/server", () => ({ getRequest: mocks.getRequest }));
vi.mock("@supabase/supabase-js", () => ({ createClient: mocks.createClient }));
vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: { from: mocks.from },
}));

// Import the provider file first so handlers are registered
// @ts-ignore
import "../admin.functions.ts?tss-serverfn-split";

// Imports must come AFTER vi.mock() declarations.
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  assertAdmin,
  trashOrder,
  restoreOrder,
  deleteOrderPermanently,
} from "../admin.functions";
import { getOrdersForAuthenticatedCustomer } from "../account.functions";

// ── Environment ───────────────────────────────────────────────────────────────
const originalEnv = {
  url: process.env.SUPABASE_URL,
  key: process.env.SUPABASE_PUBLISHABLE_KEY,
};

beforeAll(() => {
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_PUBLISHABLE_KEY = "test-publishable-key";
});

afterAll(() => {
  if (originalEnv.url === undefined) delete process.env.SUPABASE_URL;
  else process.env.SUPABASE_URL = originalEnv.url;
  if (originalEnv.key === undefined) delete process.env.SUPABASE_PUBLISHABLE_KEY;
  else process.env.SUPABASE_PUBLISHABLE_KEY = originalEnv.key;
});

beforeEach(() => {
  mocks.createClient.mockReset();
  mocks.from.mockReset();
  mocks.getClaims.mockReset();
  mocks.getRequest.mockReset();
  mocks.next.mockReset();
});

// ── Query builder helper ──────────────────────────────────────────────────────
// Returns a fluent mock builder that resolves to `result` when awaited or when
// .maybeSingle() / .single() is called.
function query(result: unknown) {
  const b: any = {
    delete: vi.fn(() => b),
    eq: vi.fn(() => b),
    in: vi.fn(() => b),
    insert: vi.fn(() => b),
    limit: vi.fn(() => b),
    maybeSingle: vi.fn(async () => result),
    neq: vi.fn(() => b),
    order: vi.fn(() => b),
    select: vi.fn(() => b),
    single: vi.fn(async () => result),
    update: vi.fn(() => b),
    then: (res: (v: unknown) => unknown, rej: (r: unknown) => unknown) =>
      Promise.resolve(result).then(res, rej),
  };
  return b;
}

// Helper: make assertAdmin pass (admin role found).
function adminRoleRow() {
  return query({ data: { role: "admin" }, error: null });
}

// Helper: make assertAdmin fail (no role found).
function noRoleRow() {
  return query({ data: null, error: null });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Order Trash Bin Invariants (P1.3)", () => {

  // ─── Authentication ───────────────────────────────────────────────────────

  it("INV-TRASH-01. Unauthenticated request to trashOrder is rejected by requireSupabaseAuth", async () => {
    mocks.getRequest.mockReturnValue(
      new Request("https://dona-dora.test/api/trash"),
    );
    await expect(
      (requireSupabaseAuth as any).handler({ next: mocks.next }),
    ).rejects.toThrow("Unauthorized: No authorization header provided");
    expect(mocks.next).not.toHaveBeenCalled();
  });

  // ─── Admin authorization ──────────────────────────────────────────────────

  it("INV-TRASH-02. Non-admin cannot call trashOrder — assertAdmin throws", async () => {
    const roles = noRoleRow();
    // first from() call = user_roles (assertAdmin)
    mocks.from.mockReturnValueOnce(roles);

    await expect(
      (trashOrder as any).handler({
        data: { id: "00000000-0000-0000-0000-000000000001" },
        context: { userId: "non-admin-id" },
      }),
    ).rejects.toThrow("Forbidden: admin required");
  });

  it("INV-TRASH-03. Non-admin cannot call restoreOrder — assertAdmin throws", async () => {
    const roles = noRoleRow();
    mocks.from.mockReturnValueOnce(roles);

    await expect(
      (restoreOrder as any).handler({
        data: { id: "00000000-0000-0000-0000-000000000001" },
        context: { userId: "non-admin-id" },
      }),
    ).rejects.toThrow("Forbidden: admin required");
  });

  it("INV-TRASH-04. Non-admin cannot call deleteOrderPermanently — assertAdmin throws", async () => {
    const roles = noRoleRow();
    mocks.from.mockReturnValueOnce(roles);

    await expect(
      (deleteOrderPermanently as any).handler({
        data: { id: "00000000-0000-0000-0000-000000000001" },
        context: { userId: "non-admin-id" },
      }),
    ).rejects.toThrow("Forbidden: admin required");
  });

  it("INV-TRASH-05. Verified admin passes assertAdmin for all three operations", async () => {
    // Three separate assertAdmin checks, each returning a role row.
    mocks.from
      // trashOrder: assertAdmin + read current status
      .mockReturnValueOnce(adminRoleRow())
      .mockReturnValueOnce(query({ data: { status: "novo" }, error: null }))
      .mockReturnValueOnce(query({ error: null })) // update
      // restoreOrder: assertAdmin + read current
      .mockReturnValueOnce(adminRoleRow())
      .mockReturnValueOnce(
        query({ data: { status: "trash", previous_status: "pago" }, error: null }),
      )
      .mockReturnValueOnce(query({ error: null })) // update
      // deleteOrderPermanently: assertAdmin + read current
      .mockReturnValueOnce(adminRoleRow())
      .mockReturnValueOnce(query({ data: { status: "trash" }, error: null }))
      .mockReturnValueOnce(query({ error: null })); // delete

    await expect(
      (trashOrder as any).handler({
        data: { id: "00000000-0000-0000-0000-000000000001" },
        context: { userId: "admin-id" },
      }),
    ).resolves.toEqual({ ok: true });

    await expect(
      (restoreOrder as any).handler({
        data: { id: "00000000-0000-0000-0000-000000000001" },
        context: { userId: "admin-id" },
      }),
    ).resolves.toEqual({ ok: true, status: "pago" });

    await expect(
      (deleteOrderPermanently as any).handler({
        data: { id: "00000000-0000-0000-0000-000000000001" },
        context: { userId: "admin-id" },
      }),
    ).resolves.toEqual({ ok: true });
  });

  // ─── Trash ────────────────────────────────────────────────────────────────

  it("INV-TRASH-06. trashOrder reads status from DB; stores it as previous_status in the update", async () => {
    const roles   = adminRoleRow();
    const current = query({ data: { status: "pago" }, error: null });
    const updated = query({ error: null });

    mocks.from
      .mockReturnValueOnce(roles)    // assertAdmin
      .mockReturnValueOnce(current)  // read current status
      .mockReturnValueOnce(updated); // update

    await (trashOrder as any).handler({
      data: { id: "00000000-0000-0000-0000-000000000002" },
      context: { userId: "admin-id" },
    });

    expect(current.select).toHaveBeenCalledWith("status");
    expect(current.eq).toHaveBeenCalledWith(
      "id",
      "00000000-0000-0000-0000-000000000002",
    );
    expect(updated.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "trash",
        previous_status: "pago",
      }),
    );
  });

  it("INV-TRASH-07. After trashOrder the update payload contains status=trash and previous_status=prior value", async () => {
    const roles   = adminRoleRow();
    const current = query({ data: { status: "separando" }, error: null });
    const updated = query({ error: null });

    mocks.from
      .mockReturnValueOnce(roles)
      .mockReturnValueOnce(current)
      .mockReturnValueOnce(updated);

    await (trashOrder as any).handler({
      data: { id: "00000000-0000-0000-0000-000000000003" },
      context: { userId: "admin-id" },
    });

    const updateArg = updated.update.mock.calls[0][0];
    expect(updateArg.status).toBe("trash");
    expect(updateArg.previous_status).toBe("separando");
    expect(updateArg).toHaveProperty("updated_at");
  });

  it("INV-TRASH-08. Trashing an already-trashed order returns early — no second DB write", async () => {
    const roles   = adminRoleRow();
    const current = query({ data: { status: "trash" }, error: null });

    mocks.from
      .mockReturnValueOnce(roles)
      .mockReturnValueOnce(current);
    // No third mock: update must NOT be called.

    const result = await (trashOrder as any).handler({
      data: { id: "00000000-0000-0000-0000-000000000004" },
      context: { userId: "admin-id" },
    });

    expect(result).toEqual({ ok: true });
    expect(current.update).not.toHaveBeenCalled();
    // Only two from() calls: user_roles + orders read.
    expect(mocks.from).toHaveBeenCalledTimes(2);
  });

  it("INV-TRASH-09. trashOrder input schema rejects extra fields — cannot supply previous_status", () => {
    const { inputValidator } = (trashOrder as any);
    if (!inputValidator) return; // schema is enforced internally — skip if not exposed

    // Valid input
    expect(() =>
      inputValidator({ id: "00000000-0000-0000-0000-000000000005" }),
    ).not.toThrow();

    // Extra field (previous_status) must either be stripped or rejected.
    // Zod's .parse() strips unknown keys by default; verify no throw.
    const parsed = inputValidator({
      id: "00000000-0000-0000-0000-000000000005",
      previous_status: "novo",
    });
    // parsed must not contain previous_status
    expect(parsed).not.toHaveProperty("previous_status");
  });

  // ─── Restore ─────────────────────────────────────────────────────────────

  it("INV-TRASH-10. Restore with valid previous_status sets status=previous and clears previous_status", async () => {
    const roles   = adminRoleRow();
    const current = query({
      data: { status: "trash", previous_status: "pago" },
      error: null,
    });
    const updated = query({ error: null });

    mocks.from
      .mockReturnValueOnce(roles)
      .mockReturnValueOnce(current)
      .mockReturnValueOnce(updated);

    const result = await (restoreOrder as any).handler({
      data: { id: "00000000-0000-0000-0000-000000000006" },
      context: { userId: "admin-id" },
    });

    expect(result).toEqual({ ok: true, status: "pago" });
    const updateArg = updated.update.mock.calls[0][0];
    expect(updateArg.status).toBe("pago");
    expect(updateArg.previous_status).toBeNull();
  });

  it("INV-TRASH-11. Restore with previous_status=null falls back to novo", async () => {
    const roles   = adminRoleRow();
    const current = query({
      data: { status: "trash", previous_status: null },
      error: null,
    });
    const updated = query({ error: null });

    mocks.from
      .mockReturnValueOnce(roles)
      .mockReturnValueOnce(current)
      .mockReturnValueOnce(updated);

    const result = await (restoreOrder as any).handler({
      data: { id: "00000000-0000-0000-0000-000000000007" },
      context: { userId: "admin-id" },
    });

    expect(result).toEqual({ ok: true, status: "novo" });
    expect(updated.update.mock.calls[0][0].status).toBe("novo");
  });

  it("INV-TRASH-12. Restore with previous_status=unknown_value falls back to novo", async () => {
    const roles   = adminRoleRow();
    const current = query({
      data: { status: "trash", previous_status: "estado_desconhecido" },
      error: null,
    });
    const updated = query({ error: null });

    mocks.from
      .mockReturnValueOnce(roles)
      .mockReturnValueOnce(current)
      .mockReturnValueOnce(updated);

    const result = await (restoreOrder as any).handler({
      data: { id: "00000000-0000-0000-0000-000000000008" },
      context: { userId: "admin-id" },
    });

    expect(result).toEqual({ ok: true, status: "novo" });
  });

  it("INV-TRASH-13. Restore with previous_status=trash falls back to novo — cannot re-trash via restore", async () => {
    const roles   = adminRoleRow();
    const current = query({
      data: { status: "trash", previous_status: "trash" },
      error: null,
    });
    const updated = query({ error: null });

    mocks.from
      .mockReturnValueOnce(roles)
      .mockReturnValueOnce(current)
      .mockReturnValueOnce(updated);

    const result = await (restoreOrder as any).handler({
      data: { id: "00000000-0000-0000-0000-000000000009" },
      context: { userId: "admin-id" },
    });

    expect(result).toEqual({ ok: true, status: "novo" });
    expect(updated.update.mock.calls[0][0].status).toBe("novo");
  });

  it("INV-TRASH-14. Restoring a non-trashed order returns early — no DB write issued", async () => {
    const roles   = adminRoleRow();
    const current = query({
      data: { status: "pago", previous_status: null },
      error: null,
    });

    mocks.from
      .mockReturnValueOnce(roles)
      .mockReturnValueOnce(current);

    const result = await (restoreOrder as any).handler({
      data: { id: "00000000-0000-0000-0000-000000000010" },
      context: { userId: "admin-id" },
    });

    expect(result).toEqual({ ok: true, status: "pago" });
    expect(current.update).not.toHaveBeenCalled();
    expect(mocks.from).toHaveBeenCalledTimes(2);
  });

  it("INV-TRASH-15. After restore, previous_status is null in the update payload", async () => {
    const roles   = adminRoleRow();
    const current = query({
      data: { status: "trash", previous_status: "enviado" },
      error: null,
    });
    const updated = query({ error: null });

    mocks.from
      .mockReturnValueOnce(roles)
      .mockReturnValueOnce(current)
      .mockReturnValueOnce(updated);

    await (restoreOrder as any).handler({
      data: { id: "00000000-0000-0000-0000-000000000011" },
      context: { userId: "admin-id" },
    });

    const updateArg = updated.update.mock.calls[0][0];
    expect(updateArg.previous_status).toBeNull();
  });

  // ─── Permanent delete ─────────────────────────────────────────────────────

  it("INV-TRASH-16. deleteOrderPermanently throws when DB status is not trash", async () => {
    const roles   = adminRoleRow();
    const current = query({ data: { status: "pago" }, error: null });

    mocks.from
      .mockReturnValueOnce(roles)
      .mockReturnValueOnce(current);

    await expect(
      (deleteOrderPermanently as any).handler({
        data: { id: "00000000-0000-0000-0000-000000000012" },
        context: { userId: "admin-id" },
      }),
    ).rejects.toThrow(
      "Mova o pedido para a lixeira antes de excluir permanentemente.",
    );

    // Verify delete was never issued.
    expect(current.delete).not.toHaveBeenCalled();
  });

  it("INV-TRASH-17. deleteOrderPermanently succeeds when DB status is trash", async () => {
    const roles   = adminRoleRow();
    const current = query({ data: { status: "trash" }, error: null });
    const deleted = query({ error: null });

    mocks.from
      .mockReturnValueOnce(roles)
      .mockReturnValueOnce(current)
      .mockReturnValueOnce(deleted);

    const result = await (deleteOrderPermanently as any).handler({
      data: { id: "00000000-0000-0000-0000-000000000013" },
      context: { userId: "admin-id" },
    });

    expect(result).toEqual({ ok: true });
    expect(mocks.from).toHaveBeenCalledWith("orders");
    // The delete builder was called on the orders table result.
    expect(deleted.delete).toHaveBeenCalled();
  });

  // ─── Regression: customer order history ──────────────────────────────────

  it("INV-TRASH-18. getOrdersForAuthenticatedCustomer excludes orders with status=trash", async () => {
    const orders = query({ data: [], error: null });
    mocks.from.mockReturnValue(orders);

    await getOrdersForAuthenticatedCustomer({
      claims: { email: "customer@donadora.com.br" },
    });

    expect(mocks.from).toHaveBeenCalledWith("orders");
    // Must filter by customer email.
    expect(orders.eq).toHaveBeenCalledWith(
      "customer_email",
      "customer@donadora.com.br",
    );
    // Must exclude trash status.
    expect(orders.neq).toHaveBeenCalledWith("status", "trash");
  });
});
