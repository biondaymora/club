-- Initial action bank for a controlled beta. Review point values and dates before loading in production.
insert into public.missions (code, title, description, starts_at, ends_at, points_reward, cashback_reward, active)
values
  ('WELCOME_PROFILE', 'Elige tu estilo en el Club', 'Elige una preferencia de estilo una sola vez.', now(), null, 100, 0, false),
  ('CARE_CARD', 'Lee la guía de cuidado del cuero', 'Lee la guía cuando esté disponible; cuenta una vez.', now(), null, 50, 0, false),
  ('SECOND_STEP', 'Haz tu segunda compra', 'Compra otra pieza con el correo de tu Club.', now(), null, 250, 0, false),
  ('COMPLETE_THE_LOOK', 'Compra un accesorio para tu pieza', 'Compra un accesorio con el correo de tu Club.', now(), null, 150, 0, false),
  ('REAL_WALK', 'Comparte una historia de tu pieza', 'Comparte el enlace de una historia original sobre una pieza comprada.', now(), null, 300, 0, true),
  ('WALK_TOGETHER', 'Invita a una amiga al Club', 'Cuenta si hace su primera compra válida tras tu invitación.', now(), null, 300, 0, false),
  ('HONEST_REVIEW', 'Publica una reseña de tu compra', 'Escribe una reseña honesta y comparte su enlace público.', now(), null, 150, 0, true)
on conflict (code) do update set title = excluded.title, description = excluded.description, points_reward = excluded.points_reward, cashback_reward = excluded.cashback_reward, active = excluded.active;

insert into public.mission_rules (mission_id, rule_type, configuration)
select id, 'manual_review', jsonb_build_object('requires_consent', true, 'max_completions', 1)
from public.missions where code = 'REAL_WALK'
and not exists (select 1 from public.mission_rules rules where rules.mission_id = public.missions.id and rules.rule_type = 'manual_review');

insert into public.mission_rules (mission_id, rule_type, configuration)
select id, 'qualified_referral', jsonb_build_object('requires_first_paid_order', true, 'wait_for_return_window', true, 'monthly_limit', 3)
from public.missions where code = 'WALK_TOGETHER'
and not exists (select 1 from public.mission_rules rules where rules.mission_id = public.missions.id and rules.rule_type = 'qualified_referral');
