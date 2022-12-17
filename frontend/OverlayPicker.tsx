import { useContext } from "react";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { fetchJSON } from "./fetchUtils";
import { overlaySchema } from "./overlay";
import { MakeAvatarContext } from "./MakeAvatarContext";

const overlayIndexSchema = z.array(overlaySchema);

async function fetchOverlays() {
  const json = await fetchJSON("/overlays");
  return overlayIndexSchema.parse(json);
}

export default function OverlayPicker() {
  const { overlay, setOverlay } = useContext(MakeAvatarContext);
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
      {(data ?? []).map((o) => (
        <div key={o.key} style={{ maxWidth: "512px" }}>
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
            />
            <br />
            {o.description}
          </label>
        </div>
      ))}
    </div>
  );
}
