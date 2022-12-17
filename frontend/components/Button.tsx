import { HTMLAttributes, useEffect, useMemo, useRef } from "react";
import { Spinner } from "./Spinner";
import { Popover } from "bootstrap";

export type ButtonProps = HTMLAttributes<HTMLButtonElement> & {
  disallowedMessage?: string | false;
  loading?: boolean;
};

export default function Button({
  disallowedMessage,
  loading,
  ...props
}: ButtonProps) {
  const elementRef = useRef<HTMLButtonElement>(null);

  const effectiveProps = useMemo(() => {
    let workingProps: HTMLAttributes<HTMLButtonElement> &
      Partial<
        Record<"data-bs-toggle" | "data-bs-content" | "data-bs-trigger", string>
      > = {
      ...props,
    };

    if (disallowedMessage) {
      workingProps = {
        ...workingProps,
        onClick: undefined,
        "data-bs-toggle": "popover",
        "data-bs-trigger": "focus",
        "data-bs-content": disallowedMessage,
      };
    }

    if (loading) {
      workingProps = {
        ...workingProps,
        children: <Spinner small />,
      };
    }

    return workingProps;
  }, [props, disallowedMessage, loading]);

  useEffect(() => {
    let popover: Popover;

    if (elementRef.current && disallowedMessage) {
      popover = new Popover(elementRef.current, { trigger: "focus" });
    }

    return () => {
      if (popover) {
        popover.dispose();
      }
    };
  }, [disallowedMessage]);

  return <button {...effectiveProps} ref={elementRef} />;
}
