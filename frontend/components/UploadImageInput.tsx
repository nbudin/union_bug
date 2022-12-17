import loadImage from "blueimp-load-image";
import { ChangeEvent, useContext } from "react";
import { MakeAvatarContext } from "../MakeAvatarContext";

export default function UploadImageInput() {
  const { setImage, setFile } = useContext(MakeAvatarContext);

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
      });
    } else {
      setImage(undefined);
    }
  };

  return (
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
  );
}
