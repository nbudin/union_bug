import { FormEvent, useContext } from "react";

import "react-image-crop/src/ReactCrop.scss";
import ResultModal from "./ResultModal";
import { fetchAndCheckStatus } from "./fetchUtils";
import OverlayPicker from "./OverlayPicker";
import UploadImageInput from "./UploadImageInput";
import ImageCropper from "./ImageCropper";
import { MakeAvatarContext } from "./MakeAvatarContext";

export default function IndexPage() {
  const { image, crop, file, setResultBlob } = useContext(MakeAvatarContext);

  const buildFormData = (): Promise<FormData> => {
    const maybeCanvas = image?.image;
    const formData = new FormData();
    if (maybeCanvas instanceof HTMLCanvasElement && crop) {
      const destinationCanvas = document.createElement("canvas");
      destinationCanvas.width = crop.width;
      destinationCanvas.height = crop.height;
      const context = destinationCanvas.getContext("2d");
      if (!context) {
        throw new Error("Couldn't get 2D drawing context from canvas");
      }

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

      return new Promise((resolve, reject) => {
        destinationCanvas.toBlob((blob) => {
          if (blob) {
            formData.append("image", blob, file?.name);
            resolve(formData);
          } else {
            reject(new Error("Couldn't convert canvas contents to PNG blob"));
          }
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
    const response = await fetchAndCheckStatus("/composite", {
      body: formData,
      method: "POST",
    });

    const blob = await response.blob();
    setResultBlob(blob);
  };

  return (
    <>
      <div className="container">
        <h1>Union Bug</h1>
        <form onSubmit={formSubmitted}>
          <UploadImageInput />

          {image && (
            <>
              <ImageCropper />
              <OverlayPicker />

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

      <ResultModal />
    </>
  );
}
