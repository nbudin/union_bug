import { LoadImageResult } from "blueimp-load-image";
import React, { useEffect } from "react";
import ReactCrop, { Crop } from "react-image-crop";

export type ImageCropperProps = {
  image: LoadImageResult;
  crop: Crop | undefined;
  setCrop: React.Dispatch<Crop | undefined>;
};

export default function ImageCropper({
  image,
  crop,
  setCrop,
}: ImageCropperProps) {
  useEffect(() => {
    if (image) {
      const { originalWidth, originalHeight } = image;
      if (originalWidth && originalHeight) {
        const originalAspect = originalWidth / originalHeight;
        if (originalAspect > 1) {
          setCrop({
            unit: "px",
            y: 0,
            height: 1024,
            x: (1024 * originalAspect - 1024) / 2,
            width: 1024,
          });
        } else {
          setCrop({
            unit: "px",
            x: 0,
            width: 1024,
            y: (1024 / originalAspect - 1024) / 2,
            height: 1024,
          });
        }
      }
    }
  }, [image, setCrop]);

  return (
    <ReactCrop
      aspect={1}
      crop={crop}
      onChange={(crop) => {
        setCrop(crop);
      }}
    >
      <div
        ref={(element) => {
          element?.appendChild(image.image);
        }}
      />
    </ReactCrop>
  );
}
