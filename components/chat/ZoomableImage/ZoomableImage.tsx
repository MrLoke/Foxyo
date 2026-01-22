import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { ZoomIn, ZoomOut } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ZoomableImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

const ZoomableImage: React.FC<ZoomableImageProps> = ({
  src,
  alt,
  className,
  width = 300,
  height = 200,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div
          className={`relative group cursor-zoom-in overflow-hidden rounded-md ${className}`}
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            style={{
              width: "auto",
              height: "auto",
              maxWidth: "100%",
              maxHeight: "350px",
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <div className="bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-75 group-hover:scale-100">
              <ZoomIn size={24} />
            </div>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 border-none bg-transparent shadow-none flex justify-center items-center outline-none [&>button]:hidden">
        <VisuallyHidden>
          <DialogTitle>{alt}</DialogTitle>
        </VisuallyHidden>

        <div
          className="relative cursor-zoom-out"
          onClick={() => setIsOpen(false)}
          // 🚨 KLUCZOWA POPRAWKA TUTAJ:
          onContextMenu={(e) => {
            e.stopPropagation(); // To zatrzymuje uruchamianie ContextMenu z czatu
            // Nie dodajemy e.preventDefault(), dzięki czemu pojawi się menu przeglądarki (Zapisz grafikę jako...)
          }}
        >
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={800}
            className="object-contain max-h-[85vh] w-auto rounded-lg shadow-2xl"
            priority
          />

          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black/10 rounded-lg">
            <div className="bg-black/50 text-white p-3 rounded-full">
              <ZoomOut size={32} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ZoomableImage;
