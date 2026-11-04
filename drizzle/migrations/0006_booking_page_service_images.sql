CREATE OR REPLACE FUNCTION public.public_booking_page(_slug text)
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
declare b record;
begin
  select id, name, slug, description, category, city, country, currency, timezone, phone, email,
         brand_color, logo_url, cover_url, cancellation_hours
    into b from businesses
   where slug = _slug and is_published and not is_suspended;
  if b.id is null or not public.business_has_access(b.id) then return null; end if;
  return jsonb_build_object(
    'business', to_jsonb(b),
    'services', coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',name,'description',description,'category',category,'price',price,'duration_minutes',duration_minutes,'location_id',location_id,'image_url',image_url) order by name) from services where business_id=b.id and is_active), '[]'::jsonb),
    'staff', coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',name,'role',role,'photo_url',photo_url,'bio',bio) order by name) from staff where business_id=b.id and is_active), '[]'::jsonb),
    'staffServices', coalesce((select jsonb_agg(jsonb_build_object('staff_id',staff_id,'service_id',service_id)) from staff_services where business_id=b.id), '[]'::jsonb),
    'locations', coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',name,'address',address,'city',city)) from locations where business_id=b.id and is_active), '[]'::jsonb)
  );
end $function$;