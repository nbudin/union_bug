import { useContext, useMemo } from "react";
import { Modal } from "react-bootstrap4-modal";
import { MakeAvatarContext } from "./MakeAvatarContext";

function saveBlob(blob: Blob, fileName: string) {
  const a = document.createElement("a");
  const url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}

export default function ResultModal() {
  const { resultBlob, file, setResultBlob } = useContext(MakeAvatarContext);

  const objectURL = useMemo(() => {
    if (resultBlob) {
      return URL.createObjectURL(resultBlob);
    } else {
      return undefined;
    }
  }, [resultBlob]);

  return (
    <Modal visible={resultBlob != null} dialogClassName="modal-lg">
      <div className="modal-header">
        <div className="flex-grow-1"> Your avatar</div>
        <button
          aria-label="Close"
          className="btn-close"
          onClick={() => setResultBlob(undefined)}
        ></button>
      </div>
      <div className="modal-body">
        {objectURL && (
          <img src={objectURL} className="img-fluid" alt="Your avatar" />
        )}
      </div>
      <div className="modal-footer">
        {resultBlob && (
          <button
            className="btn btn-success"
            onClick={() => saveBlob(resultBlob, file?.name ?? "")}
          >
            Save my avatar
          </button>
        )}
      </div>
    </Modal>
  );
}
