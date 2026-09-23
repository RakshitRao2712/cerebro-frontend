"use client";

import { memo, useState, useEffect } from "react";
import { useMotionValue, animate, motion } from "motion/react";
import useMeasure from "react-use-measure";

export type BrandList = {
  image: string;
  lightimg: string;
  name: string;
};

type BrandSliderProps = {
  brandList: BrandList[];
};

const InfiniteSlider = memo(function InfiniteSlider({
  children,
  gap = 16,
  duration = 30,
}: {
  children: React.ReactNode;
  gap?: number;
  duration?: number;
}) {
  const [ref, { width }] = useMeasure();
  const translation = useMotionValue(0);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const contentSize = width + gap;
    const from = 0;
    const to = -contentSize / 2;

    if (contentSize <= gap) return;

    const controls = animate(translation, [from, to], {
      ease: "linear",
      duration: duration,
      repeat: Infinity,
      repeatType: "loop",
      repeatDelay: 0,
      onRepeat: () => translation.set(from),
    });

    return controls?.stop;
  }, [key, translation, duration, width, gap]);

  return (
    <div className="overflow-hidden">
      <motion.div
        ref={ref}
        className="flex w-max"
        style={{
          x: translation,
          gap: `${gap}px`,
        }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
});

export default function BrandSlider({ brandList }: BrandSliderProps) {
  return (
    <section className="relative w-full overflow-hidden pb-20 pt-10">
      <div className="flex items-center justify-center gap-4 mb-12 px-4 max-w-3xl mx-auto opacity-50">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20"></div>
        <p className="text-xs font-medium text-white tracking-wide uppercase">
          Loved by 1000+ big and small brands around the worlds
        </p>
        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20"></div>
      </div>

      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8 mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <InfiniteSlider gap={100} duration={35}>
          {[...brandList, ...brandList].map((brand, i) => (
            <div
              key={`${brand.name}-${i}`}
              className="flex items-center justify-center shrink-0"
            >
              <img
                src={brand.lightimg || brand.image}
                alt={brand.name}
                className="h-8 md:h-10 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
                loading="lazy"
              />
            </div>
          ))}
        </InfiniteSlider>
      </div>
    </section>
  );
}
