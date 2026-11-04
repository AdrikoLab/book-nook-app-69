import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { generateSlots } from "@/lib/booking";
import type { BusyInterval, WorkingHour } from "@/lib/booking";
import { brandingReference } from "@/lib/branding";

const availabilitySchema = z.object({
  slug: z.string().min(1).max(120),
  serviceId: z.string().uuid(),
  staffId: z.string().uuid().nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const bookingSchema = z.object({
  slug: z.string().min(1).max(120),
  serviceId: z.string().uuid(),
  staffId: z.string().uuid().nullable().optional(),
  startsAt: z.string().datetime(),
  customerName: z.string().min(2).max(120),
  customerPhone: z.string().min(5).max(40),
  customerEmail: z.string().email().max(160).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

const waitlistSchema = z.object({
  slug: z.string().min(1).max(120),
  serviceId: z.string().uuid(),
  customerName: z.string().min(2).max(120),
  customerPhone: z.string().min(5).max(40),
  customerEmail: z.string().email().max(160).optional().or(z.literal("")),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(500).optional().or(z.literal("")),
});

function publicClient() {
  const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Booking is not configured on this server.");
  return import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }),
  );
}

function cleanError(error: { message?: string } | null) {
  return new Error(error?.message || "Something went wrong. Please try again.");
}

export const getAvailability = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => availabilitySchema.parse(data))
  .handler(async ({ data }) => {
    const sb = await publicClient();
    const dayStart = new Date(`${data.date}T00:00:00`);
    const dayEnd = new Date(`${data.date}T23:59:59`);
    const { data: ctx, error } = await sb.rpc("public_booking_context", {
      _slug: data.slug,
      _service_id: data.serviceId,
      _staff_id: data.staffId ?? null,
      _from: dayStart.toISOString(),
      _to: dayEnd.toISOString(),
      _date: data.date,
    } as never);
    if (error || !ctx) throw cleanError(error);
    const c = ctx as {
      currency: string;
      durationMinutes: number;
      bufferMinutes: number;
      hours: WorkingHour[];
      holidays: string[];
      busy: { starts_at: string; ends_at: string }[];
    };
    const staffHours = data.staffId ? c.hours.filter((h) => h.staff_id === data.staffId) : [];
    const workingHours = staffHours.length > 0 ? staffHours : c.hours.filter((h) => !h.staff_id);
    const busy: BusyInterval[] = c.busy.map((a) => ({
      start: new Date(a.starts_at).getTime(),
      end: new Date(a.ends_at).getTime(),
    }));
    const slots = generateSlots({
      date: data.date,
      workingHours,
      durationMinutes: c.durationMinutes,
      bufferMinutes: c.bufferMinutes,
      busy,
      holidays: c.holidays,
    });
    return { slots, durationMinutes: c.durationMinutes, currency: c.currency };
  });

export const createPublicBooking = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => bookingSchema.parse(data))
  .handler(async ({ data }) => {
    const sb = await publicClient();
    const phone = data.customerPhone.trim();
    const { data: res, error } = await sb.rpc("public_create_booking", {
      _slug: data.slug,
      _service_id: data.serviceId,
      _staff_id: data.staffId ?? null,
      _starts_at: data.startsAt,
      _name: data.customerName.trim(),
      _phone: phone,
      _email: data.customerEmail || "",
      _notes: data.notes || "",
    } as never);
    if (error || !res) throw cleanError(error);
    const r = res as {
      id: string; startsAt: string; endsAt: string; businessId: string; businessName: string; businessSlug: string;
      serviceName: string; price: number; currency: string; staffName: string | null; locationName: string | null;
      businessPhone: string | null; businessEmail: string | null;
    };

    // Notifications are best-effort: a missing provider must never block the booking.
    try {
      const { sendNotification, renderTemplate } = await import("@/lib/notifications.server");
      const body = renderTemplate("Hi {{customer}}, your {{service}} at {{business}} is booked for {{datetime}}.", {
        customer: data.customerName,
        business: r.businessName,
        service: r.serviceName,
        datetime: new Date(r.startsAt).toUTCString(),
        booking_url: `/book/${r.businessSlug}`,
      });
      if (data.customerEmail) {
        await sendNotification({ businessId: r.businessId, appointmentId: r.id, channel: "email", type: "booking_confirmation", recipient: data.customerEmail, subject: `Your booking at ${r.businessName}`, body });
      }
      await sendNotification({ businessId: r.businessId, appointmentId: r.id, channel: "sms", type: "booking_confirmation", recipient: phone, body });
    } catch {
      console.error("booking notification skipped");
    }

    return {
      id: r.id,
      startsAt: r.startsAt,
      endsAt: r.endsAt,
      businessName: r.businessName,
      serviceName: r.serviceName,
      price: Number(r.price),
      currency: r.currency,
      customerName: data.customerName.trim(),
      customerPhone: phone,
      customerEmail: data.customerEmail || null,
      staffName: r.staffName,
      locationName: r.locationName,
      paymentStatus: "unpaid",
      businessPhone: r.businessPhone,
      businessEmail: r.businessEmail,
    };
  });

export const joinWaitlist = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => waitlistSchema.parse(data))
  .handler(async ({ data }) => {
    const sb = await publicClient();
    const { error } = await sb.rpc("public_join_waitlist", {
      _slug: data.slug,
      _service_id: data.serviceId,
      _name: data.customerName.trim(),
      _phone: data.customerPhone.trim(),
      _email: data.customerEmail || "",
      _date: data.preferredDate,
      _notes: data.notes || "",
    } as never);
    if (error) throw new Error("Could not join the waitlist. Please try again.");
    return { ok: true };
  });

const pageSchema = z.object({ slug: z.string().min(1).max(120) });

type PageBusiness = {
  id: string; name: string; slug: string; description: string | null; category: string | null; city: string | null;
  country: string | null; currency: string; timezone: string; phone: string | null; email: string | null;
  brand_color: string | null; logo_url: string | null; cover_url: string | null; cancellation_hours: number;
};

/** Public, read-only payload that powers the booking page. */
export const getBookingPage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => pageSchema.parse(data))
  .handler(async ({ data }) => {
    const sb = await publicClient();
    const { data: page, error } = await sb.rpc("public_booking_page", { _slug: data.slug } as never);
    if (error) console.error("booking page lookup failed");
    if (!page) return null;
    const p = page as {
      business: PageBusiness;
      services: { id: string; name: string; description: string | null; category: string | null; price: number; duration_minutes: number; location_id: string | null }[];
      staff: { id: string; name: string; role: string | null; photo_url: string | null; bio: string | null }[];
      staffServices: { staff_id: string; service_id: string }[];
      locations: { id: string; name: string; address: string | null; city: string | null }[];
    };
    const business = p.business;

    const resolveBrandingUrl = async (value: string | null) => {
      const reference = brandingReference(value, business.id);
      if (!reference || reference.startsWith("https://")) return reference;
      const { data: signed } = await sb.storage.from("business-branding").createSignedUrl(reference, 3600);
      return signed?.signedUrl ?? null;
    };
    const [logoUrl, coverUrl] = await Promise.all([
      resolveBrandingUrl(business.logo_url),
      resolveBrandingUrl(business.cover_url),
    ]);

    return { ...p, business: { ...business, logo_url: logoUrl, cover_url: coverUrl } };
  });
