-- CreateTable
CREATE TABLE "AdminEntityRight" (
    "id" SERIAL NOT NULL,
    "user_email" TEXT,
    "user_email_invite" TEXT,
    "entity_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminEntityRight_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AdminEntityRight" ADD CONSTRAINT "AdminEntityRight_user_email_fkey" FOREIGN KEY ("user_email") REFERENCES "User"("email") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminEntityRight" ADD CONSTRAINT "AdminEntityRight_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "Entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
