/* eslint-disable @typescript-eslint/no-empty-function */
import { LoadImageResult } from "blueimp-load-image";
import React, { ReactNode, useMemo, useState } from "react";
import { Crop } from "react-image-crop";
import { Overlay } from "./overlay";

export type MakeAvatarContextValue = {
  file: File | undefined;
  setFile: React.Dispatch<React.SetStateAction<File | undefined>>;
  image: LoadImageResult | undefined;
  setImage: React.Dispatch<React.SetStateAction<LoadImageResult | undefined>>;
  crop: Crop | undefined;
  setCrop: React.Dispatch<React.SetStateAction<Crop | undefined>>;
  overlay: Overlay | undefined;
  setOverlay: React.Dispatch<React.SetStateAction<Overlay | undefined>>;
  resultBlob: Blob | undefined;
  setResultBlob: React.Dispatch<React.SetStateAction<Blob | undefined>>;
};

export const MakeAvatarContext = React.createContext<MakeAvatarContextValue>({
  file: undefined,
  setFile: () => {},
  image: undefined,
  setImage: () => {},
  crop: undefined,
  setCrop: () => {},
  overlay: undefined,
  setOverlay: () => {},
  resultBlob: undefined,
  setResultBlob: () => {},
});

export function MakeAvatarContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [file, setFile] = useState<File>();
  const [image, setImage] = useState<LoadImageResult>();
  const [crop, setCrop] = useState<Crop>();
  const [overlay, setOverlay] = useState<Overlay>();
  const [resultBlob, setResultBlob] = useState<Blob>();

  const value = useMemo(
    () => ({
      file,
      setFile,
      image,
      setImage,
      crop,
      setCrop,
      overlay,
      setOverlay,
      resultBlob,
      setResultBlob,
    }),
    [
      file,
      setFile,
      image,
      setImage,
      crop,
      setCrop,
      overlay,
      setOverlay,
      resultBlob,
      setResultBlob,
    ]
  );

  return (
    <MakeAvatarContext.Provider value={value}>
      {children}
    </MakeAvatarContext.Provider>
  );
}
