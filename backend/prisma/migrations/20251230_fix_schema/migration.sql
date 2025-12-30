-- Fix room_participants table
ALTER TABLE "room_participants" DROP COLUMN IF EXISTS "is_admin";
ALTER TABLE "room_participants" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'member';
ALTER TABLE "room_participants" ADD COLUMN IF NOT EXISTS "is_muted" BOOLEAN NOT NULL DEFAULT false;

-- Fix messages table - rename columns
ALTER TABLE "messages" RENAME COLUMN "room_id" TO "chat_room_id";
ALTER TABLE "messages" RENAME COLUMN "original_lang" TO "original_language";
ALTER TABLE "messages" DROP COLUMN IF EXISTS "updated_at";
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "attachment_url" TEXT;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "is_edited" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "edited_at" TIMESTAMP(3);

-- Rename reply_to_id to reply_to_message_id if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'messages' AND column_name = 'reply_to_id') THEN
        ALTER TABLE "messages" RENAME COLUMN "reply_to_id" TO "reply_to_message_id";
    END IF;
END $$;

-- Fix message_translations table
ALTER TABLE "message_translations" RENAME COLUMN "target_lang" TO "target_language";
ALTER TABLE "message_translations" DROP COLUMN IF EXISTS "romanization";
ALTER TABLE "message_translations" ADD COLUMN IF NOT EXISTS "translation_provider" TEXT NOT NULL DEFAULT 'google';
ALTER TABLE "message_translations" ADD COLUMN IF NOT EXISTS "confidence_score" DOUBLE PRECISION;

-- Drop old indexes
DROP INDEX IF EXISTS "messages_room_id_idx";
DROP INDEX IF EXISTS "message_translations_target_lang_idx";
DROP INDEX IF EXISTS "message_translations_message_id_target_lang_key";

-- Create new indexes
CREATE INDEX IF NOT EXISTS "room_participants_room_id_user_id_idx" ON "room_participants"("room_id", "user_id");
CREATE INDEX IF NOT EXISTS "messages_chat_room_id_created_at_idx" ON "messages"("chat_room_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "message_translations_target_language_idx" ON "message_translations"("target_language");
CREATE UNIQUE INDEX IF NOT EXISTS "message_translations_message_id_target_language_key" ON "message_translations"("message_id", "target_language");
CREATE INDEX IF NOT EXISTS "chat_rooms_created_by_idx" ON "chat_rooms"("created_by");

-- Drop old foreign key constraints
ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "messages_room_id_fkey";
ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "messages_reply_to_id_fkey";

-- Add new foreign key constraints
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_room_id_fkey" FOREIGN KEY ("chat_room_id") REFERENCES "chat_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_reply_to_message_id_fkey" FOREIGN KEY ("reply_to_message_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
