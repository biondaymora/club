-- Initial action bank for a controlled beta. Review point values and dates before loading in production.
insert into public.missions (code, title, description, starts_at, ends_at, points_reward, cashback_reward, active)
values
  ('WELCOME_PROFILE', 'Cuéntanos cómo caminas', 'Completa tu perfil de estilo, talla y ciudad para que podamos acompañarte mejor.', now(), null, 100, 0, true),
  ('CARE_CARD', 'Cuida la historia que llevas', 'Descubre el ritual de cuidado para que tu pieza en cuero te acompañe por más tiempo.', now(), null, 50, 0, true),
  ('SECOND_STEP', 'Tu segunda caminata', 'Elige una nueva pieza para seguir construyendo tu historia con nosotras.', now(), null, 250, 0, true),
  ('COMPLETE_THE_LOOK', 'Un gesto que acompaña', 'Encuentra un accesorio que complete tu forma de caminar.', now(), null, 150, 0, true),
  ('REAL_WALK', 'Una historia real', 'Comparte un momento auténtico con tu pieza Bionda y Mora.', now(), null, 300, 0, true),
  ('WALK_TOGETHER', 'Camina junto a una amiga', 'Invita a una amiga a descubrir una pieza que también la acompañe.', now(), null, 300, 0, true)
on conflict (code) do update set title = excluded.title, description = excluded.description, points_reward = excluded.points_reward, cashback_reward = excluded.cashback_reward, active = excluded.active;

insert into public.mission_rules (mission_id, rule_type, configuration)
select id, 'manual_review', jsonb_build_object('requires_consent', true, 'max_completions', 1)
from public.missions where code = 'REAL_WALK'
and not exists (select 1 from public.mission_rules rules where rules.mission_id = public.missions.id and rules.rule_type = 'manual_review');

insert into public.mission_rules (mission_id, rule_type, configuration)
select id, 'qualified_referral', jsonb_build_object('requires_first_paid_order', true, 'wait_for_return_window', true, 'monthly_limit', 3)
from public.missions where code = 'WALK_TOGETHER'
and not exists (select 1 from public.mission_rules rules where rules.mission_id = public.missions.id and rules.rule_type = 'qualified_referral');
