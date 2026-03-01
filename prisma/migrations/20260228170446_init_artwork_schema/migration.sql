-- CreateTable
CREATE TABLE "artworks" (
    "id" BIGINT NOT NULL,
    "image_url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL,
    "uploader_id" BIGINT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT,
    "md5" TEXT NOT NULL,
    "rating" VARCHAR(10) NOT NULL,
    "image_width" INTEGER NOT NULL,
    "image_height" INTEGER NOT NULL,
    "file_ext" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "pixiv_id" BIGINT,

    CONSTRAINT "artworks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "category" INTEGER NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ArtworkToTag" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "artworks_md5_key" ON "artworks"("md5");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_ArtworkToTag_AB_unique" ON "_ArtworkToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_ArtworkToTag_B_index" ON "_ArtworkToTag"("B");

-- AddForeignKey
ALTER TABLE "_ArtworkToTag" ADD CONSTRAINT "_ArtworkToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "artworks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtworkToTag" ADD CONSTRAINT "_ArtworkToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
