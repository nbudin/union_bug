export type SpinnerProps = {
  small?: boolean;
};

export function Spinner({ small }: SpinnerProps): JSX.Element {
  return (
    <div
      className={`spinner-border${small ? " spinner-border-sm" : ""}`}
      role="status"
    >
      <span className="visually-hidden">Loading...</span>
    </div>
  );
}
