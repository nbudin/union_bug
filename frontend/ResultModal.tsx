import { useMemo } from "react";
import { Modal } from "react-bootstrap4-modal";

function saveBlob(blob: Blob, fileName: string) {
  const a = document.createElement("a");
  const url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}

export type ResultModalProps = {
  onClose: () => void;
  blob?: Blob;
  fileName?: string;
};

export default function ResultModal({
  blob,
  fileName,
  onClose,
}: ResultModalProps) {
  const objectURL = useMemo(() => {
    if (blob) {
      return URL.createObjectURL(blob);
    } else {
      return undefined;
    }
  }, [blob]);

  return (
    <Modal visible={blob != null} dialogClassName="modal-lg">
      <div className="modal-header">
        <div className="flex-grow-1"> Your avatar</div>
        <button
          aria-label="Close"
          className="btn-close"
          onClick={onClose}
        ></button>
      </div>
      <div className="modal-body">
        {objectURL && (
          <img src={objectURL} className="img-fluid" alt="Your avatar" />
        )}
      </div>
      <div className="modal-footer">
        {blob && (
          <button
            className="btn btn-success"
            onClick={() => saveBlob(blob, fileName ?? "")}
          >
            Save my avatar
          </button>
        )}
      </div>
    </Modal>
  );
}
