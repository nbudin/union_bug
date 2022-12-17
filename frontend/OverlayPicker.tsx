import React from "react";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { fetchJSON } from "./fetchUtils";
import { Overlay, overlaySchema } from "./overlay";

const overlayIndexSchema = z.array(overlaySchema);

async function fetchOverlays() {
  const json = await fetchJSON("/overlays");
  return overlayIndexSchema.parse(json);
}

export type OverlayPickerProps = {
  overlay: Overlay | undefined;
  setOverlay: React.Dispatch<React.SetStateAction<Overlay | undefined>>;
};

export default function OverlayPicker({
  overlay,
  setOverlay,
}: OverlayPickerProps) {
  const { data, isLoading, error } = useQuery(["overlays"], fetchOverlays);

  if (isLoading) {
    return (
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error.toString()}
      </div>
    );
  }

  return (
    <div className="d-flex">
      {(data ?? []).map((overlay) => (
        <div key={overlay.key}>{overlay.description}</div>
      ))}
    </div>
  );
}
