CREATE OR REPLACE FUNCTION public.guard_business_authority() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF auth.role()='service_role' OR public.has_role(auth.uid(),'super_admin') THEN RETURN NEW; END IF;
 IF TG_OP='INSERT' THEN
  IF NEW.is_suspended THEN RAISE EXCEPTION 'Suspension is controlled by platform administrators'; END IF;
 ELSE
  IF NEW.owner_id IS DISTINCT FROM OLD.owner_id OR NEW.is_suspended IS DISTINCT FROM OLD.is_suspended THEN RAISE EXCEPTION 'Ownership and suspension are controlled by platform administrators'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER business_authority_guard BEFORE INSERT OR UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.guard_business_authority();
CREATE OR REPLACE FUNCTION public.guard_business_membership() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE b uuid; actor_owner boolean;
BEGIN
 IF TG_OP='DELETE' THEN b:=OLD.business_id; ELSE b:=NEW.business_id; END IF;
 IF auth.role()='service_role' OR public.has_role(auth.uid(),'super_admin') THEN
  IF TG_OP='DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
 END IF;
 SELECT EXISTS(SELECT 1 FROM public.businesses WHERE id=b AND owner_id=auth.uid()) INTO actor_owner;
 IF NOT actor_owner THEN RAISE EXCEPTION 'Only the business owner can manage memberships'; END IF;
 IF TG_OP='UPDATE' AND (NEW.business_id IS DISTINCT FROM OLD.business_id OR NEW.user_id IS DISTINCT FROM OLD.user_id) THEN RAISE EXCEPTION 'Membership identity cannot be changed'; END IF;
 IF TG_OP<>'DELETE' THEN
  IF NEW.role NOT IN ('manager','staff','customer','owner') THEN RAISE EXCEPTION 'Invalid tenant role'; END IF;
  IF NEW.role='owner' AND NOT EXISTS(SELECT 1 FROM public.businesses WHERE id=b AND owner_id=NEW.user_id) THEN RAISE EXCEPTION 'Only the actual business owner can hold the owner membership'; END IF;
 END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END $$;
CREATE TRIGGER business_membership_guard BEFORE INSERT OR UPDATE OR DELETE ON public.business_members FOR EACH ROW EXECUTE FUNCTION public.guard_business_membership();
CREATE OR REPLACE FUNCTION public.guard_initial_trial() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF auth.role()='service_role' OR public.has_role(auth.uid(),'super_admin') THEN RETURN NEW; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(NEW.business_id::text,1));
 IF NOT EXISTS(SELECT 1 FROM public.businesses WHERE id=NEW.business_id AND owner_id=auth.uid()) THEN RAISE EXCEPTION 'Only the business owner can start a trial'; END IF;
 IF EXISTS(SELECT 1 FROM public.subscriptions WHERE business_id=NEW.business_id) THEN RAISE EXCEPTION 'This business has already used its trial'; END IF;
 IF NEW.status<>'trialing' OR NEW.trial_ends_at IS NULL OR NEW.trial_ends_at<=now() OR NEW.trial_ends_at>now()+interval '7 days' OR NEW.current_period_end>now()+interval '7 days' THEN RAISE EXCEPTION 'Invalid trial period'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.subscription_plans WHERE id=NEW.plan_id AND is_active) THEN RAISE EXCEPTION 'Plan unavailable'; END IF;
 NEW.current_period_start:=now();
 NEW.current_period_end:=NEW.trial_ends_at;
 RETURN NEW;
END $$;
CREATE TRIGGER initial_trial_guard BEFORE INSERT ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.guard_initial_trial();
ALTER POLICY "svc public read" ON public.services USING (is_active AND EXISTS(SELECT 1 FROM public.businesses b WHERE b.id=services.business_id AND b.is_published AND NOT b.is_suspended));
ALTER POLICY "staff public read" ON public.staff USING (is_active AND EXISTS(SELECT 1 FROM public.businesses b WHERE b.id=staff.business_id AND b.is_published AND NOT b.is_suspended));
ALTER POLICY "loc public read" ON public.locations USING (is_active AND EXISTS(SELECT 1 FROM public.businesses b WHERE b.id=locations.business_id AND b.is_published AND NOT b.is_suspended));