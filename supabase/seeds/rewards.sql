insert into public.rewards (id, code, title, description, points_cost, active, stock, configuration)
values
  ('fb1e417e-f8e3-4ac0-957b-aee30ce21001', 'free_shipping', 'Envío sin costo', 'Recibe tu próxima pieza sin costo de envío.', 600, true, null, '{"benefit_type":"shipping"}'),
  ('fb1e417e-f8e3-4ac0-957b-aee30ce21002', 'care_kit', 'Kit de cuidado', 'Lo esencial para acompañar el cuero que amas.', 850, true, 50, '{"benefit_type":"physical"}'),
  ('fb1e417e-f8e3-4ac0-957b-aee30ce21003', 'early_access', 'Acceso anticipado', 'Conoce la próxima colección antes que nadie.', 1200, true, null, '{"benefit_type":"access"}'),
  ('fb1e417e-f8e3-4ac0-957b-aee30ce21004', 'cashback_50000', '$50.000 de cashback', 'Aún no disponible: requiere integración de emisión y reversos.', 1500, false, null, '{"benefit_type":"cashback","amount":5000000}');
