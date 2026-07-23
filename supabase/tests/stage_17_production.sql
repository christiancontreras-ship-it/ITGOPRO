begin;
do $$
begin
  if (select count(*) from public.feature_flags where key = 'AUTO_MATCHING' and enabled) <> 0 then
    raise exception 'AUTO_MATCHING must be disabled by default';
  end if;
  if (select count(*) from public.operational_runbooks) < 3 then
    raise exception 'required runbooks missing';
  end if;
end $$;
rollback;
