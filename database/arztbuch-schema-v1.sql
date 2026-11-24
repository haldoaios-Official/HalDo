-- HALDO ARZTBUCH PRO MAX — initial relational schema (PostgreSQL)
-- Architecture starter only. Not a production-ready clinical system.
-- Apply only in a secured, access-controlled backend after review.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE tenant (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE app_user (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id),
  external_subject text NOT NULL,
  display_name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, external_subject),
  UNIQUE (tenant_id, id)
);

CREATE TABLE patient (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id),
  local_patient_key text NOT NULL,
  given_name text,
  family_name text,
  birth_date date,
  administrative_gender text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, local_patient_key),
  UNIQUE (tenant_id, id)
);

CREATE TABLE encounter (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  status text NOT NULL CHECK (status IN ('planned','active','finished','cancelled')),
  started_at timestamptz,
  ended_at timestamptz,
  encounter_type text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, patient_id) REFERENCES patient(tenant_id,id),
  FOREIGN KEY (tenant_id, created_by) REFERENCES app_user(tenant_id,id),
  UNIQUE (tenant_id, id)
);

CREATE TABLE source_record (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher text NOT NULL,
  title text NOT NULL,
  source_url text,
  source_version text,
  published_at date,
  retrieved_at timestamptz NOT NULL DEFAULT now(),
  license_note text,
  checksum text
);

CREATE TABLE disease_concept (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name text NOT NULL,
  synonyms text[] NOT NULL DEFAULT '{}',
  classification_system text,
  classification_code text,
  classification_version text,
  specialty text,
  summary text,
  editorial_status text NOT NULL DEFAULT 'draft'
    CHECK (editorial_status IN ('draft','review','approved','withdrawn')),
  valid_from date,
  valid_to date,
  source_id uuid REFERENCES source_record(id),
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE medication_ingredient (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inn text NOT NULL,
  synonyms text[] NOT NULL DEFAULT '{}',
  ingredient_class text,
  source_id uuid REFERENCES source_record(id),
  editorial_status text NOT NULL DEFAULT 'draft'
    CHECK (editorial_status IN ('draft','review','approved','withdrawn'))
);

CREATE TABLE medicinal_product (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id uuid REFERENCES medication_ingredient(id),
  brand_name text,
  strength text,
  dosage_form text,
  route text,
  manufacturer text,
  authorization_status text,
  product_information_url text,
  source_id uuid REFERENCES source_record(id),
  checked_at timestamptz,
  valid_from date,
  valid_to date
);

CREATE TABLE lab_test (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name text NOT NULL,
  abbreviation text,
  synonyms text[] NOT NULL DEFAULT '{}',
  loinc_code text,
  specimen text,
  method text,
  default_unit text,
  preanalytical_notes text,
  source_id uuid REFERENCES source_record(id),
  editorial_status text NOT NULL DEFAULT 'draft'
    CHECK (editorial_status IN ('draft','review','approved','withdrawn'))
);

CREATE TABLE lab_reference_interval (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_test_id uuid NOT NULL REFERENCES lab_test(id),
  laboratory text,
  method text,
  population_note text,
  age_min_years numeric,
  age_max_years numeric,
  sex_context text,
  lower_value numeric,
  upper_value numeric,
  unit text NOT NULL,
  valid_from date NOT NULL,
  valid_to date,
  source_id uuid REFERENCES source_record(id),
  CHECK (lower_value IS NULL OR upper_value IS NULL OR lower_value <= upper_value)
);

CREATE TABLE clinical_document (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  encounter_id uuid,
  document_type text NOT NULL,
  title text NOT NULL,
  storage_object_key text NOT NULL,
  mime_type text,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  signature_status text NOT NULL DEFAULT 'unsigned'
    CHECK (signature_status IN ('unsigned','pending','signed','revoked')),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, patient_id) REFERENCES patient(tenant_id,id),
  FOREIGN KEY (tenant_id, encounter_id) REFERENCES encounter(tenant_id,id),
  FOREIGN KEY (tenant_id, created_by) REFERENCES app_user(tenant_id,id),
  UNIQUE (tenant_id, id)
);

CREATE TABLE consent_record (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  document_id uuid REFERENCES clinical_document(id),
  purpose text NOT NULL,
  scope text NOT NULL,
  status text NOT NULL CHECK (status IN ('proposed','granted','refused','withdrawn','expired')),
  granted_at timestamptz,
  valid_until timestamptz,
  recorded_by uuid,
  FOREIGN KEY (tenant_id, patient_id) REFERENCES patient(tenant_id,id),
  FOREIGN KEY (tenant_id, recorded_by) REFERENCES app_user(tenant_id,id)
);

CREATE TABLE diagnosis_record (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  encounter_id uuid,
  disease_concept_id uuid REFERENCES disease_concept(id),
  code_system text,
  code text,
  code_version text,
  clinical_status text,
  onset_date date,
  abatement_date date,
  recorded_by uuid,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, patient_id) REFERENCES patient(tenant_id,id),
  FOREIGN KEY (tenant_id, encounter_id) REFERENCES encounter(tenant_id,id),
  FOREIGN KEY (tenant_id, recorded_by) REFERENCES app_user(tenant_id,id)
);

CREATE TABLE medication_order (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  encounter_id uuid,
  product_id uuid REFERENCES medicinal_product(id),
  ingredient_text text,
  dose_text text,
  route text,
  schedule_text text,
  indication text,
  order_status text NOT NULL CHECK (order_status IN ('draft','active','on_hold','completed','cancelled')),
  prescribed_by uuid,
  valid_from timestamptz,
  valid_to timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, patient_id) REFERENCES patient(tenant_id,id),
  FOREIGN KEY (tenant_id, encounter_id) REFERENCES encounter(tenant_id,id),
  FOREIGN KEY (tenant_id, prescribed_by) REFERENCES app_user(tenant_id,id)
);

CREATE TABLE medication_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  medication_order_id uuid NOT NULL REFERENCES medication_order(id),
  event_type text NOT NULL CHECK (event_type IN ('planned','prepared','administered','omitted','refused','not_taken','discontinued','error')),
  occurred_at timestamptz NOT NULL,
  dose_text text,
  reason text,
  recorded_by uuid,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, recorded_by) REFERENCES app_user(tenant_id,id)
);

CREATE TABLE lab_result (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  encounter_id uuid,
  lab_test_id uuid NOT NULL REFERENCES lab_test(id),
  value_numeric numeric,
  value_text text,
  unit text,
  reference_lower numeric,
  reference_upper numeric,
  flag text,
  specimen_collected_at timestamptz,
  resulted_at timestamptz NOT NULL,
  laboratory text,
  method text,
  source_id uuid REFERENCES source_record(id),
  FOREIGN KEY (tenant_id, patient_id) REFERENCES patient(tenant_id,id),
  FOREIGN KEY (tenant_id, encounter_id) REFERENCES encounter(tenant_id,id)
);

CREATE TABLE vital_observation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  encounter_id uuid,
  code text NOT NULL,
  value_numeric numeric,
  value_text text,
  unit text,
  observed_at timestamptz NOT NULL,
  method text,
  source_device_id uuid,
  quality_status text NOT NULL DEFAULT 'unknown'
    CHECK (quality_status IN ('valid','questionable','invalid','unknown')),
  recorded_by uuid,
  FOREIGN KEY (tenant_id, patient_id) REFERENCES patient(tenant_id,id),
  FOREIGN KEY (tenant_id, encounter_id) REFERENCES encounter(tenant_id,id),
  FOREIGN KEY (tenant_id, recorded_by) REFERENCES app_user(tenant_id,id)
);

CREATE TABLE care_plan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  encounter_id uuid,
  title text NOT NULL,
  goal text,
  status text NOT NULL CHECK (status IN ('draft','active','on_hold','completed','cancelled')),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, patient_id) REFERENCES patient(tenant_id,id),
  FOREIGN KEY (tenant_id, encounter_id) REFERENCES encounter(tenant_id,id),
  FOREIGN KEY (tenant_id, created_by) REFERENCES app_user(tenant_id,id)
);

CREATE TABLE care_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  care_plan_id uuid NOT NULL REFERENCES care_plan(id),
  description text NOT NULL,
  responsible_user_id uuid,
  due_at timestamptz,
  completed_at timestamptz,
  outcome text,
  deviation_reason text,
  FOREIGN KEY (tenant_id, responsible_user_id) REFERENCES app_user(tenant_id,id)
);

CREATE TABLE medical_device (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  patient_id uuid,
  manufacturer text,
  model text NOT NULL,
  serial_number text,
  firmware_version text,
  protocol text,
  connection_status text,
  compatibility_status text,
  last_checked_at timestamptz,
  FOREIGN KEY (tenant_id, patient_id) REFERENCES patient(tenant_id,id)
);

CREATE TABLE device_measurement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  device_id uuid NOT NULL REFERENCES medical_device(id),
  patient_id uuid,
  metric_code text NOT NULL,
  value_numeric numeric,
  value_text text,
  unit text,
  measured_at timestamptz NOT NULL,
  quality_status text NOT NULL DEFAULT 'unknown'
    CHECK (quality_status IN ('valid','questionable','invalid','unknown')),
  import_source text,
  FOREIGN KEY (tenant_id, patient_id) REFERENCES patient(tenant_id,id)
);

CREATE TABLE audit_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  actor_user_id uuid,
  patient_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  reason text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  request_id text,
  FOREIGN KEY (tenant_id, actor_user_id) REFERENCES app_user(tenant_id,id),
  FOREIGN KEY (tenant_id, patient_id) REFERENCES patient(tenant_id,id)
);

CREATE INDEX idx_encounter_patient_time ON encounter(tenant_id,patient_id,started_at DESC);
CREATE INDEX idx_diagnosis_patient ON diagnosis_record(tenant_id,patient_id,recorded_at DESC);
CREATE INDEX idx_lab_result_patient_time ON lab_result(tenant_id,patient_id,resulted_at DESC);
CREATE INDEX idx_vital_patient_time ON vital_observation(tenant_id,patient_id,observed_at DESC);
CREATE INDEX idx_med_order_patient_status ON medication_order(tenant_id,patient_id,order_status);
CREATE INDEX idx_audit_patient_time ON audit_event(tenant_id,patient_id,occurred_at DESC);

-- Production gate: implement and test tenant isolation, row-level security,
-- encryption/key management, immutable audit, backups, retention/deletion,
-- authorization, threat model, and clinical/legal review before real patient data.
