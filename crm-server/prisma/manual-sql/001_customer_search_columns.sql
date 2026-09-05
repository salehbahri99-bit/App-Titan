-- يُنفَّذ على قاعدة Medusa (جدول customer) — ليس على جداول CRM.
-- يضيف الأعمدة المُطبَّعة التي يعتمد عليها /api/crm/customers/search،
-- ويحدّثها تلقائياً عند كل إدراج/تعديل.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE customer
  ADD COLUMN IF NOT EXISTS name_normalized          text,
  ADD COLUMN IF NOT EXISTS business_name_normalized text,
  ADD COLUMN IF NOT EXISTS phone_normalized         text;

-- نفس منطق lib/crm/normalize.ts داخل القاعدة
CREATE OR REPLACE FUNCTION titan_normalize_ar(input text) RETURNS text AS $$
  SELECT lower(
    btrim(
      regexp_replace(
        translate(
          regexp_replace(coalesce(input, ''), 'ـ', '', 'g'),
          'إأآىة', 'ااايه'
        ),
        '\s+', ' ', 'g'
      )
    )
  );
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION titan_normalize_phone(input text) RETURNS text AS $$
  SELECT regexp_replace(coalesce(input, ''), '[^0-9]', '', 'g');
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION titan_customer_normalize() RETURNS trigger AS $$
BEGIN
  NEW.name_normalized          := titan_normalize_ar(NEW.name);
  NEW.business_name_normalized := titan_normalize_ar(NEW.business_name);
  NEW.phone_normalized         := titan_normalize_phone(NEW.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS customer_normalize_trg ON customer;
CREATE TRIGGER customer_normalize_trg
  BEFORE INSERT OR UPDATE ON customer
  FOR EACH ROW EXECUTE FUNCTION titan_customer_normalize();

-- تعبئة الصفوف الموجودة
UPDATE customer SET
  name_normalized          = titan_normalize_ar(name),
  business_name_normalized = titan_normalize_ar(business_name),
  phone_normalized         = titan_normalize_phone(phone);

CREATE INDEX IF NOT EXISTS customer_name_norm_trgm
  ON customer USING gin (name_normalized gin_trgm_ops);
CREATE INDEX IF NOT EXISTS customer_business_norm_trgm
  ON customer USING gin (business_name_normalized gin_trgm_ops);
CREATE INDEX IF NOT EXISTS customer_phone_norm_trgm
  ON customer USING gin (phone_normalized gin_trgm_ops);
