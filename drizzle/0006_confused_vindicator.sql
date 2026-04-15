ALTER TABLE "prompts" DROP CONSTRAINT "prompts_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "description" text NOT NULL;--> statement-breakpoint
ALTER TABLE "prompts" DROP COLUMN "user_id";