-- Rota management RPCs require an authenticated caller. Existing manager checks inside RPCs remain in force.
revoke execute on function public.cancel_rota_shift(uuid) from public, anon;
revoke execute on function public.configure_rota_shift(uuid,text,uuid[],boolean) from public, anon;
revoke execute on function public.create_rota_shift(uuid,date,time without time zone,time without time zone,text,text,uuid[]) from public, anon;
revoke execute on function public.set_rota_shift_staff(uuid,uuid[]) from public, anon;
revoke execute on function public.update_rota_shift(uuid,uuid,date,time without time zone,time without time zone,text,text,uuid[]) from public, anon;
grant execute on function public.cancel_rota_shift(uuid) to authenticated;
grant execute on function public.configure_rota_shift(uuid,text,uuid[],boolean) to authenticated;
grant execute on function public.create_rota_shift(uuid,date,time without time zone,time without time zone,text,text,uuid[]) to authenticated;
grant execute on function public.set_rota_shift_staff(uuid,uuid[]) to authenticated;
grant execute on function public.update_rota_shift(uuid,uuid,date,time without time zone,time without time zone,text,text,uuid[]) to authenticated;
