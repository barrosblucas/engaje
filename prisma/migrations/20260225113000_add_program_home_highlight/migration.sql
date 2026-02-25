-- Add support for selecting one highlighted program on public home page.
ALTER TABLE "programs"
ADD COLUMN "is_highlighted_on_home" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "programs_is_highlighted_on_home_status_idx"
ON "programs"("is_highlighted_on_home", "status");
