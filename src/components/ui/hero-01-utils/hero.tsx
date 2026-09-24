"use client";

import { ArrowUpRight, Star } from "lucide-react";

export type AvatarList = {
  image: string;
};

type HeroSectionProps = {
  avatarList: AvatarList[];
};

export default function HeroSection({ avatarList }: HeroSectionProps) {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-16">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden flex items-center justify-center">
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-200/15 rounded-[100%] blur-[120px]"></div>
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[1.1] text-white">
          Building bold brands
          <br />
          with{" "}
          <span className="italic font-serif font-normal text-white/90">
            thoughtful design
          </span>
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-white/60 leading-relaxed font-medium">
          At Cerebro, we help small startups tackle the world&apos;s biggest challenges with tailored
          solutions, guiding you from strategy to success in a competitive market.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
          <a
            href="#"
            className="group flex items-center gap-3 rounded-full bg-white pl-6 pr-2 py-2 text-sm font-medium text-black transition-all duration-300 hover:bg-white/90"
          >
            Get Started
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-transform duration-300 group-hover:rotate-45">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </a>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {avatarList.map((avatar, i) => (
                <div
                  key={i}
                  className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-black bg-neutral-800"
                >
                  <img
                    src={avatar.image}
                    alt={`Client ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-500 text-amber-500"
                  />
                ))}
              </div>
              <span className="text-xs text-white/60 font-medium">
                Trusted by 1000+ clients
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
