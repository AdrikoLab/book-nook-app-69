import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ImagePlus, Scissors } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/hooks/useBusiness";
import { formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/services")({
  head: () => ({
    meta: [
      { title: "Services — BookFlow" },
      { name: "description", content: "Create the services you offer with prices, durations and preparation buffers." },
      { property: "og:title", content: "Services" },
      { property: "og:description", content: "Manage your bookable services and pricing." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { data: business } = useBusiness();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const services = useQuery({
    queryKey: ["services", business?.id],
    enabled: Boolean(business?.id),
    queryFn: async () => {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("business_id", business!.id)
        .order("name");
      return data ?? [];
    },
  });

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
    if (file.size > 5 * 1024 * 1024) throw new Error("Image must be under 5 MB.");
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${business!.id}/service-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("business-branding").upload(path, file, { contentType: file.type });
    if (error) throw error;
    return path;
  };

  const images = useQuery({
    queryKey: ["service-images", services.data?.map((s) => s.image_url).join("|")],
    enabled: Boolean(services.data?.length),
    queryFn: async () => {
      const out: Record<string, string> = {};
      await Promise.all(
        (services.data ?? []).map(async (s) => {
          if (!s.image_url) return;
          if (s.image_url.startsWith("https://")) { out[s.id] = s.image_url; return; }
          const { data } = await supabase.storage.from("business-branding").createSignedUrl(s.image_url, 3600);
          if (data?.signedUrl) out[s.id] = data.signedUrl;
        }),
      );
      return out;
    },
  });

  const setImage = useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const path = await uploadImage(file);
      const { error } = await supabase.from("services").update({ image_url: path }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Image updated.");
      void queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not upload that image."),
  });

  const create = useMutation({
    mutationFn: async (form: FormData) => {
      const file = form.get("image");
      const image_url = file instanceof File && file.size > 0 ? await uploadImage(file) : null;
      const { error } = await supabase.from("services").insert({
        image_url,
        business_id: business!.id,
        name: String(form.get("name")).trim(),
        description: String(form.get("description") ?? "").trim() || null,
        price: Number(form.get("price")),
        duration_minutes: Number(form.get("duration_minutes")),
        buffer_minutes: Number(form.get("buffer_minutes") || 0),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Service added.");
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save that service."),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase.from("services").update({ is_active: isActive }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["services"] }),
    onError: () => toast.error("Could not update that service."),
  });

  return (
    <AppShell
      title="Services"
      description="What customers can book with you."
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">Add service</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add service</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                create.mutate(new FormData(e.currentTarget));
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="image">Image</Label>
                <Input id="image" name="image" type="file" accept="image/*" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" name="price" type="number" min="0" step="0.01" required defaultValue={0} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="duration_minutes">Minutes</Label>
                  <Input id="duration_minutes" name="duration_minutes" type="number" min="5" step="5" required defaultValue={30} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="buffer_minutes">Buffer</Label>
                  <Input id="buffer_minutes" name="buffer_minutes" type="number" min="0" step="5" defaultValue={0} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={create.isPending}>
                {create.isPending ? "Saving…" : "Save service"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      {(services.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={Scissors}
          title="No services yet"
          description="Add your first service so customers have something to book."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {services.data?.map((service) => (
            <div key={service.id} className="surface-panel overflow-hidden p-4">
              <label className="-mx-4 -mt-4 mb-3 block cursor-pointer bg-muted" title="Change image">
                {images.data?.[service.id] ? (
                  <img src={images.data[service.id]} alt={service.name} className="aspect-[16/9] w-full object-cover" />
                ) : (
                  <div className="flex aspect-[16/9] w-full items-center justify-center text-sm text-muted-foreground">
                    <ImagePlus className="mr-2 size-4" /> Add image
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setImage.mutate({ id: service.id, file });
                    e.target.value = "";
                  }}
                />
              </label>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{service.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {service.duration_minutes} min
                    {service.buffer_minutes > 0 ? ` (+${service.buffer_minutes} buffer)` : ""} ·{" "}
                    {formatCurrency(service.price, business?.currency ?? "UGX")}
                  </p>
                </div>
                <Switch
                  checked={service.is_active}
                  onCheckedChange={(checked) => toggle.mutate({ id: service.id, isActive: checked })}
                  aria-label="Bookable"
                />
              </div>
              {service.description ? (
                <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{service.description}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
