import { useMutation } from "@tanstack/react-query";
import { LoadImageResult } from "blueimp-load-image";
import { useContext, useEffect } from "react";
import { Crop } from "react-image-crop";
import { useNavigate } from "react-router-dom";
import OverlayPicker from "../components/OverlayPicker";
import WizardNavigation, {
  BackButton,
  NextButton,
} from "../components/WizardNavigation";
import { fetchAndCheckStatus } from "../fetchUtils";
import { MakeAvatarContext } from "../MakeAvatarContext";
import { Overlay } from "../overlay";

type CompositeImageVariables = {
  crop: Crop;
  image: LoadImageResult;
  file: File;
  overlay: Overlay;
};

function buildFormData({
  crop,
  image,
  file,
  overlay,
}: CompositeImageVariables): Promise<FormData> {
  const maybeCanvas = image?.image;
  const formData = new FormData();
  formData.append("overlay", overlay.key);
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
}

async function compositeImage(variables: CompositeImageVariables) {
  const formData = await buildFormData(variables);
  const response = await fetchAndCheckStatus("/composite", {
    body: formData,
    method: "POST",
  });

  return response;
}

export default function ChooseOverlayPage() {
  const { image, file, crop, overlay, setOverlay, setResultBlob } =
    useContext(MakeAvatarContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!image) {
      navigate("/");
    }

    if (!crop) {
      navigate("/crop-image");
    }
  }, [image, crop, navigate]);

  const composite = useMutation(compositeImage);

  const nextClicked = async () => {
    if (!crop || !image || !file || !overlay) {
      return;
    }

    const response = await composite.mutateAsync({
      crop,
      image,
      file,
      overlay,
    });

    const blob = await response.blob();
    setResultBlob(blob);
  };

  if (!image) {
    return <></>;
  }

  return (
    <>
      <OverlayPicker overlay={overlay} setOverlay={setOverlay} />
      <WizardNavigation
        pageDescription="Choose overlay"
        backButton={<BackButton onClick={() => navigate("/crop-image")} />}
        nextButton={
          <NextButton
            onClick={nextClicked}
            loading={composite.isLoading}
            disallowedMessage={!overlay && "Please choose an overlay."}
          />
        }
      />
    </>
  );
}
