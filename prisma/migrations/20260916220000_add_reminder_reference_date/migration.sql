-- CT06: a date supplied for a reminder is a calendar reference only.
ALTER TABLE "communication_consent_events"
ADD COLUMN "reference_date" DATE;
