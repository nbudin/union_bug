import React from "react";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { fetchJSON } from "../fetchUtils";
import { Overlay, overlaySchema } from "../overlay";
import { Spinner } from "./Spinner";

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
    return <Spinner />;
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
      {(data ?? []).map((o) => (
        <div key={o.key} style={{ maxWidth: "256px" }}>
          <input
            type="radio"
            className="btn-check"
            id={`overlay-${o.key}`}
            autoComplete="off"
            checked={overlay?.key === o.key}
            onChange={() => setOverlay(o)}
          />
          <label
            className="btn btn-outline-primary"
            htmlFor={`overlay-${o.key}`}
          >
            <img
              src={`/overlays/${o.key}`}
              alt={`${o.description} thumbnail`}
              className="img-fluid"
            />
            <br />
            {o.description}
          </label>
        </div>
      ))}
    </div>
  );
}
