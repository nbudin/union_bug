import { ChangeEvent, FormEvent, useState } from "react";
import ReactCrop, { Crop } from "react-image-crop";
import loadImage, { LoadImageResult } from "blueimp-load-image";

import "react-image-crop/src/ReactCrop.scss";
import ResultModal from "./ResultModal";

export default function IndexPage() {
  const [file, setFile] = useState<File>();
  const [image, setImage] = useState<LoadImageResult>();
  const [crop, setCrop] = useState<Crop>();
  const [resultBlob, setResultBlob] = useState<Blob>();

  const fileInputChanged = (event: ChangeEvent<HTMLInputElement>) => {
    const file = (event.target.files ?? [])[0];
    setFile(file);
    if (file) {
      loadImage(file, {
        cover: true,
        canvas: true,
        maxHeight: 1024,
        maxWidth: 1024,
      }).then((result) => {
        setImage(result);
        const { originalWidth, originalHeight } = result;
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
      });
    } else {
      setImage(undefined);
    }
  };

  const buildFormData = (): Promise<FormData> => {
    const maybeCanvas = image?.image;
    const formData = new FormData();
    if (maybeCanvas instanceof HTMLCanvasElement && crop) {
      const destinationCanvas = document.createElement("canvas");
      destinationCanvas.width = crop.width;
      destinationCanvas.height = crop.height;
      const context = destinationCanvas.getContext("2d")!;
      context.drawImage(
        maybeCanvas,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );

      return new Promise((resolve) => {
        destinationCanvas.toBlob((blob) => {
          formData.append("image", blob!, file?.name);
          resolve(formData);
        }, "image/png");
      });
    } else if (file) {
      formData.append("image", file, file.name);
      return Promise.resolve(formData);
    }

    return Promise.reject(new Error("No image data to send"));
  };

  const formSubmitted = async (event: FormEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const formData = await buildFormData();
    const response = await fetch("/composite", {
      body: formData,
      method: "POST",
    });
    if (response.status < 200 || response.status >= 400) {
      throw new Error(response.statusText);
    }

    const blob = await response.blob();
    setResultBlob(blob);
  };

  return (
    <>
      <div className="container">
        <h1>Union Bug</h1>
        <form onSubmit={formSubmitted}>
          <div className="mb-3">
            <label htmlFor="imageInput" className="form-label">
              Choose an image for your avatar
            </label>
            <input
              className="form-control"
              type="file"
              id="imageInput"
              name="image"
              onChange={fileInputChanged}
            ></input>
          </div>

          {image && (
            <>
              <ReactCrop
                aspect={1}
                crop={crop}
                onChange={(crop, percentageCrop) => {
                  setCrop(crop);
                }}
              >
                <div
                  ref={(element) => {
                    element?.appendChild(image.image);
                  }}
                />
              </ReactCrop>
              <div>
                <input
                  type="submit"
                  value="Unionize my avatar!"
                  className="btn btn-success"
                />
              </div>
            </>
          )}
        </form>
      </div>

      <ResultModal
        blob={resultBlob}
        fileName="union-bug-avatar.png"
        onClose={() => setResultBlob(undefined)}
      />
    </>
  );
}
