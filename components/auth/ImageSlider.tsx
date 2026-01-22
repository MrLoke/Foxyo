"use client";

import { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import { FoxyoAiImages } from "@/lib/mock-data";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export const ImageSlider: React.FC = () => {
  const plugin = useRef(
    Autoplay({ delay: 7000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  return (
    <Carousel
      plugins={[plugin.current]}
      opts={{
        loop: true,
        align: "center",
      }}
      className="w-full h-full select-none hover:cursor-pointer"
    >
      <CarouselContent>
        {FoxyoAiImages.map((item, index) => (
          <CarouselItem
            key={item.id}
            className="basis-[70%] md:basis-[70%] lg:basis-[70%]"
          >
            <div className="p-1">
              <Card className="h-96 rounded-3xl ring-4 ring-zinc-800 bg-white/5 backdrop-blur-xl border border-white/10 shadow-inner shadow-white/5">
                <CardContent className="flex flex-col h-full items-center justify-center text-center bg-transparent">
                  <div className="relative w-full h-2/3 mb-4 rounded-3xl overflow-hidden flex items-center justify-center bg-app-primary">
                    <span className="absolute inset-0 flex flex-col items-center justify-center text-white text-xl font-bold p-4">
                      <Image
                        src={item.src}
                        alt={item.title}
                        loading={index === 0 ? "eager" : "lazy"}
                        fill={true}
                        sizes="70vw"
                        style={{ objectFit: "cover" }}
                      />
                    </span>
                  </div>

                  <h3 className="text-2xl font-semibold mb-2 text-slate-800 dark:text-slate-200">
                    {item.title}
                  </h3>
                  <p className="text-md text-slate-800 dark:text-slate-200 max-w-sm mx-auto">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious className="absolute left-4 top-1/2 transform -translate-y-1/2 text-app-primary border-app-primary hover:bg-zinc-200 hover:cursor-pointer" />
      <CarouselNext className="absolute right-4 top-1/2 transform -translate-y-1/2 text-app-primary border-app-primary hover:bg-zinc-200 hover:cursor-pointer" />
    </Carousel>
  );
};
