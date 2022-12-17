import { useContext } from "react";

import UploadImageInput from "../components/UploadImageInput";
import { MakeAvatarContext } from "../MakeAvatarContext";
import WizardNavigation, { NextButton } from "../components/WizardNavigation";
import { useNavigate } from "react-router-dom";

export default function StartPage() {
  const { image } = useContext(MakeAvatarContext);
  const navigate = useNavigate();

  return (
    <>
      <UploadImageInput />

      <WizardNavigation
        pageDescription="Choose an image"
        nextButton={
          <NextButton
            onClick={() => navigate("/crop-image")}
            disallowedMessage={!image && "Please choose an image."}
          />
        }
      />
    </>
  );
}
