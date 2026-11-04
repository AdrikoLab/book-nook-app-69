
create or replace function public.public_booking_page(_slug text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare b record;
begin
  select id, name, slug, description, category, city, country, currency, timezone, phone, email,
         brand_color, logo_url, cover_url, cancellation_hours
    into b from businesses
   where slug = _slug and is_published and not is_suspended;
  if b.id is null or not public.business_has_access(b.id) then return null; end if;
  return jsonb_build_object(
    'business', to_jsonb(b),
    'services', coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',name,'description',description,'category',category,'price',price,'duration_minutes',duration_minutes,'location_id',location_id) order by name) from services where business_id=b.id and is_active), '[]'::jsonb),
    'staff', coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',name,'role',role,'photo_url',photo_url,'bio',bio) order by name) from staff where business_id=b.id and is_active), '[]'::jsonb),
    'staffServices', coalesce((select jsonb_agg(jsonb_build_object('staff_id',staff_id,'service_id',service_id)) from staff_services where business_id=b.id), '[]'::jsonb),
    'locations', coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',name,'address',address,'city',city)) from locations where business_id=b.id and is_active), '[]'::jsonb)
  );
end $$;

create or replace function public.public_booking_context(_slug text, _service_id uuid, _staff_id uuid, _from timestamptz, _to timestamptz, _date date)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare b record; s record;
begin
  select id, currency into b from businesses where slug=_slug and is_published and not is_suspended;
  if b.id is null or not public.business_has_access(b.id) then raise exception 'This booking page is not available.'; end if;
  select id, duration_minutes, buffer_minutes into s from services where id=_service_id and business_id=b.id and is_active;
  if s.id is null then raise exception 'That service is no longer bookable.'; end if;
  if _staff_id is not null and not exists(select 1 from staff where id=_staff_id and business_id=b.id and is_active) then
    raise exception 'That team member is not available.'; end if;
  return jsonb_build_object(
    'currency', b.currency,
    'durationMinutes', s.duration_minutes,
    'bufferMinutes', s.buffer_minutes,
    'hours', coalesce((select jsonb_agg(jsonb_build_object('day_of_week',day_of_week,'is_open',is_open,'open_time',open_time,'close_time',close_time,'break_start',break_start,'break_end',break_end,'staff_id',staff_id)) from working_hours where business_id=b.id), '[]'::jsonb),
    'holidays', coalesce((select jsonb_agg(date) from holidays where business_id=b.id and date=_date), '[]'::jsonb),
    'busy', coalesce((select jsonb_agg(jsonb_build_object('starts_at',starts_at,'ends_at',ends_at)) from appointments
        where business_id=b.id and status <> 'cancelled' and starts_at >= _from and starts_at <= _to
          and (_staff_id is null or staff_id=_staff_id)), '[]'::jsonb)
  );
end $$;

create or replace function public.public_create_booking(_slug text, _service_id uuid, _staff_id uuid, _starts_at timestamptz,
  _name text, _phone text, _email text, _notes text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare b record; s record; v_end timestamptz; v_customer uuid; v_appt record; v_staff text; v_loc text;
begin
  if length(trim(_name)) < 2 or length(trim(_phone)) < 5 then raise exception 'Please enter your name and phone number.'; end if;
  select id, name, slug, currency, phone, email into b from businesses where slug=_slug and is_published and not is_suspended;
  if b.id is null or not public.business_has_access(b.id) then raise exception 'This booking page is not available.'; end if;
  select id, name, price, duration_minutes, location_id into s from services where id=_service_id and business_id=b.id and is_active;
  if s.id is null then raise exception 'That service is no longer bookable.'; end if;
  if _staff_id is not null then
    select name into v_staff from staff where id=_staff_id and business_id=b.id and is_active;
    if v_staff is null then raise exception 'That team member is not available.'; end if;
  end if;
  if _starts_at < now() then raise exception 'Please pick a future time slot.'; end if;
  v_end := _starts_at + make_interval(mins => s.duration_minutes);
  perform pg_advisory_xact_lock(hashtext(b.id::text));
  if exists(select 1 from appointments where business_id=b.id and status <> 'cancelled'
      and (_staff_id is null or staff_id=_staff_id) and starts_at < v_end and ends_at > _starts_at) then
    raise exception 'Sorry, that slot was just taken. Please choose another time.'; end if;
  select id into v_customer from customers where business_id=b.id and phone=trim(_phone) limit 1;
  if v_customer is null then
    insert into customers(business_id, full_name, phone, email)
      values (b.id, trim(_name), trim(_phone), nullif(trim(coalesce(_email,'')),'')) returning id into v_customer;
  end if;
  insert into appointments(business_id, location_id, customer_id, service_id, staff_id, starts_at, ends_at, price, status, payment_status, source, notes)
    values (b.id, s.location_id, v_customer, s.id, _staff_id, _starts_at, v_end, s.price, 'pending', 'unpaid', 'public_booking', nullif(_notes,''))
    returning id, starts_at, ends_at into v_appt;
  if s.location_id is not null then select name into v_loc from locations where id=s.location_id; end if;
  return jsonb_build_object('id',v_appt.id,'startsAt',v_appt.starts_at,'endsAt',v_appt.ends_at,'businessId',b.id,'businessName',b.name,
    'businessSlug',b.slug,'serviceName',s.name,'price',s.price,'currency',b.currency,'staffName',v_staff,'locationName',v_loc,
    'businessPhone',b.phone,'businessEmail',b.email);
end $$;

create or replace function public.public_join_waitlist(_slug text, _service_id uuid, _name text, _phone text, _email text, _date date, _notes text)
returns void language plpgsql volatile security definer set search_path = public as $$
declare b uuid;
begin
  select id into b from businesses where slug=_slug and is_published and not is_suspended;
  if b is null or not public.business_has_access(b) then raise exception 'This booking page is not available.'; end if;
  if not exists(select 1 from services where id=_service_id and business_id=b and is_active) then raise exception 'That service is no longer bookable.'; end if;
  insert into waitlist(business_id, service_id, customer_name, customer_phone, customer_email, preferred_date, notes)
    values (b, _service_id, trim(_name), trim(_phone), nullif(_email,''), _date, nullif(_notes,''));
end $$;

revoke all on function public.public_booking_page(text) from public;
revoke all on function public.public_booking_context(text,uuid,uuid,timestamptz,timestamptz,date) from public;
revoke all on function public.public_create_booking(text,uuid,uuid,timestamptz,text,text,text,text) from public;
revoke all on function public.public_join_waitlist(text,uuid,text,text,text,date,text) from public;
grant execute on function public.public_booking_page(text) to anon, authenticated;
grant execute on function public.public_booking_context(text,uuid,uuid,timestamptz,timestamptz,date) to anon, authenticated;
grant execute on function public.public_create_booking(text,uuid,uuid,timestamptz,text,text,text,text) to anon, authenticated;
grant execute on function public.public_join_waitlist(text,uuid,text,text,text,date,text) to anon, authenticated;

-- Let visitors view (not change) branding images of live businesses so the page can create short-lived links.
create policy "Public can view branding of live businesses" on storage.objects
for select to anon, authenticated using (
  bucket_id = 'business-branding' and exists (
    select 1 from public.businesses b
    where b.id::text = (storage.foldername(name))[1] and b.is_published and not b.is_suspended));
