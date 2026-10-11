-- CreateTable
CREATE TABLE "member" (
    "id" TEXT NOT NULL,
    "plan_member_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "phone_e164" TEXT,
    "dob_hmac" BYTEA NOT NULL,
    "zip_hmac" BYTEA,
    "medicaid_id_hmac" BYTEA,
    "language" TEXT NOT NULL DEFAULT 'en',
    "state" TEXT NOT NULL,
    "line_of_business" TEXT NOT NULL,
    "risk_tier" INTEGER NOT NULL DEFAULT 1,
    "enrollment_date" DATE,
    "opted_out_at" TIMESTAMP(3),
    "bad_number_at" TIMESTAMP(3),
    "outreach_paused_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "link_ttl_days" INTEGER NOT NULL DEFAULT 14,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "phone_e164" TEXT NOT NULL,
    "token_hash" BYTEA,
    "prev_token_hash" BYTEA,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "first_opened_at" TIMESTAMP(3),
    "verified_at" TIMESTAMP(3),
    "failed_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "relinks_today" INTEGER NOT NULL DEFAULT 0,
    "relink_day" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message" (
    "id" TEXT NOT NULL,
    "invitation_id" TEXT NOT NULL,
    "twilio_sid" TEXT,
    "kind" TEXT NOT NULL,
    "attempt_number" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "error_code" INTEGER,
    "disposition" TEXT,
    "disposition_reason" TEXT,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "invitation_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "ip" TEXT,
    "user_agent" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment" (
    "id" TEXT NOT NULL,
    "invitation_id" TEXT NOT NULL,
    "questionnaire_id" TEXT NOT NULL,
    "questionnaire_version" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "outcome_reason" TEXT,
    "recheck_at" TIMESTAMP(3),
    "completion_method" TEXT,
    "missing_required" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "current_link_id" TEXT,
    "crisis_flagged_at" TIMESTAMP(3),
    "resume_nudged_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_activity_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answer" (
    "assessment_id" TEXT NOT NULL,
    "link_id" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "answered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "answer_pkey" PRIMARY KEY ("assessment_id","link_id")
);

-- CreateTable
CREATE TABLE "care_plan" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "care_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_event" (
    "id" BIGSERIAL NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor" TEXT NOT NULL DEFAULT 'member',
    "invitation_id" TEXT,
    "event" TEXT NOT NULL,
    "ip" TEXT,
    "user_agent" TEXT,
    "detail" JSONB,

    CONSTRAINT "audit_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questionnaire" (
    "id" VARCHAR(100) NOT NULL,
    "version" VARCHAR(40) NOT NULL,
    "display_name" TEXT NOT NULL,
    "definition" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'published',
    "published_at" TIMESTAMP(3),

    CONSTRAINT "questionnaire_pkey" PRIMARY KEY ("id","version")
);

-- CreateTable
CREATE TABLE "form_assignment" (
    "id" TEXT NOT NULL,
    "state" TEXT,
    "line_of_business" TEXT,
    "questionnaire_id" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "effective_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effective_to" TIMESTAMP(3),

    CONSTRAINT "form_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "state_policy" (
    "state" TEXT NOT NULL,
    "verify_fields" TEXT[],
    "partial_followup_days" INTEGER NOT NULL DEFAULT 14,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',

    CONSTRAINT "state_policy_pkey" PRIMARY KEY ("state")
);

-- CreateTable
CREATE TABLE "referral" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_at" TIMESTAMP(3),

    CONSTRAINT "referral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "member_plan_member_id_key" ON "member"("plan_member_id");

-- CreateIndex
CREATE INDEX "member_phone_e164_idx" ON "member"("phone_e164");

-- CreateIndex
CREATE UNIQUE INDEX "invitation_token_hash_key" ON "invitation"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "invitation_prev_token_hash_key" ON "invitation"("prev_token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "invitation_campaign_id_member_id_key" ON "invitation"("campaign_id", "member_id");

-- CreateIndex
CREATE UNIQUE INDEX "message_twilio_sid_key" ON "message"("twilio_sid");

-- CreateIndex
CREATE INDEX "message_invitation_id_idx" ON "message"("invitation_id");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_invitation_id_key" ON "assessment"("invitation_id");

-- CreateIndex
CREATE UNIQUE INDEX "care_plan_assessment_id_key" ON "care_plan"("assessment_id");

-- CreateIndex
CREATE INDEX "audit_event_invitation_id_idx" ON "audit_event"("invitation_id");

-- CreateIndex
CREATE UNIQUE INDEX "referral_assessment_id_program_key" ON "referral"("assessment_id", "program");

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment" ADD CONSTRAINT "assessment_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment" ADD CONSTRAINT "assessment_questionnaire_id_questionnaire_version_fkey" FOREIGN KEY ("questionnaire_id", "questionnaire_version") REFERENCES "questionnaire"("id", "version") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan" ADD CONSTRAINT "care_plan_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_event" ADD CONSTRAINT "audit_event_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral" ADD CONSTRAINT "referral_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
