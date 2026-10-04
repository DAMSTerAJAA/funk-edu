-- ============================================================
-- 0002 — Align professional_assessment with the Resistance Lab
--
-- The PK/PD Workbench was removed and the Resistance Lab took over its
-- progression slot. Accounts written before that change carry
-- `workbenchDone`; the app now reads `resistanceLabDone`.
--
-- This migration:
--   1. backfills `resistanceLabDone` from `workbenchDone` (a completed
--      Workbench is the equivalent credit for the same slot),
--   2. drops the obsolete `workbenchDone` key,
--   3. updates the column default so new rows stop writing `workbenchDone`.
-- ============================================================

update funkedu_accounts
set professional_assessment =
      (professional_assessment - 'workbenchDone')
      || jsonb_build_object(
           'resistanceLabDone',
           coalesce(
             (professional_assessment -> 'resistanceLabDone')::boolean,
             (professional_assessment -> 'workbenchDone')::boolean,
             false
           )
         )
where professional_assessment ? 'workbenchDone'
   or not (professional_assessment ? 'resistanceLabDone');

alter table funkedu_accounts
  alter column professional_assessment set default
    '{"baselineScore":null,"baselineDone":false,"resistanceLabDone":false,"clinicalRoomDone":false,"prescriptionAuditDone":false,"posttestScore":null,"posttestDone":false,"professionalCertificateUnlocked":false}';
