-- CreateEnum
CREATE TYPE "RequestMode" AS ENUM ('whitelist', 'superuser');

-- CreateEnum
CREATE TYPE "RightAccessStatus" AS ENUM ('carrier', 'removed');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "observatoire_account" BOOLEAN NOT NULL DEFAULT false,
    "observatoire_username" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRequest" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "mode" "RequestMode" NOT NULL,

    CONSTRAINT "UserRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserOTP" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "expiration_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserOTP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserValidationToken" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "UserValidationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInviteToken" (
    "id" SERIAL NOT NULL,
    "user_email" TEXT NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "UserInviteToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entity" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Entity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Button" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isTest" BOOLEAN DEFAULT false,
    "product_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Button_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "isEssential" BOOLEAN DEFAULT false,
    "urls" TEXT[],
    "volume" INTEGER,
    "observatoire_id" INTEGER,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProduct" (
    "user_email" TEXT NOT NULL,
    "product_id" INTEGER NOT NULL,
    "status" "RightAccessStatus" NOT NULL DEFAULT 'carrier',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProduct_pkey" PRIMARY KEY ("user_email","product_id")
);

-- CreateTable
CREATE TABLE "WhiteListedDomain" (
    "id" SERIAL NOT NULL,
    "domain" TEXT NOT NULL,

    CONSTRAINT "WhiteListedDomain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserRequest_user_id_key" ON "UserRequest"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserOTP_user_id_key" ON "UserOTP"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserOTP_code_key" ON "UserOTP"("code");

-- CreateIndex
CREATE UNIQUE INDEX "UserValidationToken_user_id_key" ON "UserValidationToken"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserValidationToken_token_key" ON "UserValidationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "UserInviteToken_token_key" ON "UserInviteToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Entity_name_key" ON "Entity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Button_title_key" ON "Button"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Button_product_id_key" ON "Button"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "Product_title_key" ON "Product"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Product_entity_id_key" ON "Product"("entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserProduct_product_id_key" ON "UserProduct"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "WhiteListedDomain_domain_key" ON "WhiteListedDomain"("domain");

-- AddForeignKey
ALTER TABLE "UserRequest" ADD CONSTRAINT "UserRequest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOTP" ADD CONSTRAINT "UserOTP_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserValidationToken" ADD CONSTRAINT "UserValidationToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Button" ADD CONSTRAINT "Button_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "Entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProduct" ADD CONSTRAINT "UserProduct_user_email_fkey" FOREIGN KEY ("user_email") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProduct" ADD CONSTRAINT "UserProduct_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
