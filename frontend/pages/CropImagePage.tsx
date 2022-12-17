import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "react-image-crop/src/ReactCrop.scss";

import ImageCropper from "../components/ImageCropper";
import WizardNavigation, {
  BackButton,
  NextButton,
} from "../components/WizardNavigation";
import { MakeAvatarContext } from "../MakeAvatarContext";

export default function CropImagePage() {
  const { image, crop, setCrop } = useContext(MakeAvatarContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!image) {
      navigate("/");
    }
  }, [image, navigate]);

  if (!image) {
    return <></>;
  }

  return (
    <>
      <ImageCropper image={image} crop={crop} setCrop={setCrop} />
      <WizardNavigation
        pageDescription="Crop image"
        backButton={<BackButton onClick={() => navigate("/")} />}
        nextButton={<NextButton onClick={() => navigate("/choose-overlay")} />}
      />
    </>
  );
}
