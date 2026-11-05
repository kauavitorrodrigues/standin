-- Every FLOOR tile gets an explicit material. Wood is what a tile without one
-- already sounds like, so nothing changes for the ones that were left blank.
UPDATE "tilesets"
SET "tile_meta" = (
    SELECT jsonb_object_agg(
        "entry"."key",
        CASE
            WHEN "entry"."value"->>'category' = 'FLOOR'
                AND "entry"."value"->'material' IS NULL
            THEN "entry"."value" || '{"material": "WOOD"}'::jsonb
            ELSE "entry"."value"
        END
    )
    FROM jsonb_each("tilesets"."tile_meta") AS "entry"
)
WHERE "tile_meta" IS NOT NULL
    AND EXISTS (
        SELECT 1
        FROM jsonb_each("tilesets"."tile_meta") AS "entry"
        WHERE "entry"."value"->>'category' = 'FLOOR'
            AND "entry"."value"->'material' IS NULL
    );
