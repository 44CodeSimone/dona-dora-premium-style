import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// ---- Profile ----
export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await supabaseAdmin
      .from("customer_profiles")
      .select("*")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

const profileInput = z.object({
  full_name: z.string().max(120).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  address: z
    .object({
      street: z.string().max(160).optional(),
      number: z.string().max(20).optional(),
      complement: z.string().max(80).optional(),
      neighborhood: z.string().max(80).optional(),
      city: z.string().max(80).optional(),
      state: z.string().max(40).optional(),
      zip: z.string().max(20).optional(),
    })
    .partial()
    .optional(),
});

export const upsertMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => profileInput.parse(input))
  .handler(async ({ data, context }) => {
    const payload = {
      user_id: context.userId,
      full_name: data.full_name ?? null,
      phone: data.phone ?? null,
      address: data.address ?? {},
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabaseAdmin
      .from("customer_profiles")
      .upsert(payload, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---- Orders (match by user's email) ----
export async function getOrdersForAuthenticatedCustomer(context: { claims?: { email?: string } }) {
  const email = context.claims?.email;
  if (!email) return [];
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id,created_at,status,subtotal,items,customer_name,customer_whatsapp")
    .eq("customer_email", email)
    // Exclude orders moved to the admin trash bin — they must not appear in the
    // customer's "Meus Pedidos" history.
    .neq("status", "trash")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export const getMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => getOrdersForAuthenticatedCustomer(context));

// ---- Wishlist ----
export const getMyWishlist = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: items, error } = await supabaseAdmin
      .from("wishlist")
      .select("id,product_id,created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    if (!items?.length) return [];
    const ids = items.map((i) => i.product_id);
    const { data: products } = await supabaseAdmin
      .from("products")
      .select("id,name,price,promo_price,image_url,images,slug,active")
      .in("id", ids);
    const byId = new Map((products ?? []).map((p) => [p.id, p]));
    return items.map((i) => ({ ...i, product: byId.get(i.product_id) ?? null }));
  });

export const addToWishlist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { product_id: string }) =>
    z.object({ product_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await supabaseAdmin
      .from("wishlist")
      .upsert(
        { user_id: context.userId, product_id: data.product_id },
        { onConflict: "user_id,product_id", ignoreDuplicates: true },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeFromWishlist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { product_id: string }) =>
    z.object({ product_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await supabaseAdmin
      .from("wishlist")
      .delete()
      .eq("user_id", context.userId)
      .eq("product_id", data.product_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---- Reviews ----
const reviewInput = z.object({
  product_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(3).max(2000),
  author_name: z.string().trim().min(1).max(120),
});

export const submitReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => reviewInput.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await supabaseAdmin.from("reviews").upsert(
      {
        product_id: data.product_id,
        user_id: context.userId,
        rating: data.rating,
        comment: data.comment,
        author_name: data.author_name,
        status: "pending",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "product_id,user_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyReviews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await supabaseAdmin
      .from("reviews")
      .select("id,product_id,rating,comment,status,created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const deleteMyReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await supabaseAdmin
      .from("reviews")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
