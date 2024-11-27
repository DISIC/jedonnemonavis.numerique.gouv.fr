-- CreateEnum
CREATE TYPE "TypeAction" AS ENUM ('services_list_view', 'service_create', 'service_update', 'service_archive', 'service_restore', 'service_invite', 'service_info_view', 'service_stats_view', 'service_reviews_view', 'service_reviews_report_view', 'service_review_verbatim_view', 'service_buttons_list_view', 'service_button_create', 'service_apikeys_list_view', 'service_apikeys_create', 'organisations_list_view', 'organisation_create', 'organisation_update', 'organisation_invite', 'organisation_apikeys_list_view', 'organisation_apikeys_create', 'user_signin', 'user_signout', 'api_call');

-- CreateTable
CREATE TABLE "UserEvent" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "action" "TypeAction" NOT NULL,
    "metadata" JSONB NOT NULL,
    "productId" INTEGER,
    "entityId" INTEGER,
    "apiKeyId" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserEvent_user_id_key" ON "UserEvent"("user_id");

-- CreateIndex
CREATE INDEX "UserEvent_user_id_action_idx" ON "UserEvent"("user_id", "action");

-- AddForeignKey
ALTER TABLE "UserEvent" ADD CONSTRAINT "UserEvent_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEvent" ADD CONSTRAINT "UserEvent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEvent" ADD CONSTRAINT "UserEvent_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEvent" ADD CONSTRAINT "UserEvent_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "ApiKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;
