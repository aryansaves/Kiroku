import type { Sticker } from "@/lib/types";

export function StickerLayer({ stickers }: { stickers: Sticker[] }) {
  if (!stickers.length) return null;

  return (
    <div className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block">
      {stickers.map((sticker) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={sticker.id}
          src={sticker.src}
          alt=""
          className="absolute opacity-90"
          style={{
            left: sticker.x,
            top: sticker.y,
            width: sticker.size,
            height: sticker.size,
            transform: `rotate(${sticker.rotation}deg)`
          }}
        />
      ))}
    </div>
  );
}
