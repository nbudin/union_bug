import { useContext, useEffect } from "react";
import ReactCrop from "react-image-crop";
import { MakeAvatarContext } from "./MakeAvatarContext";

export default function ImageCropper() {
  const { image, crop, setCrop } = useContext(MakeAvatarContext);

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

  if (!image) {
    return <></>;
  }

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
