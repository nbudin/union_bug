import { ReactNode } from "react";
import Button, { ButtonProps } from "./Button";

export function BackButton(props: ButtonProps) {
  return (
    <Button className="btn btn-secondary" {...props}>
      {props.children || <>&laquo; Back</>}
    </Button>
  );
}

export function NextButton(props: ButtonProps) {
  return (
    <Button className="btn btn-success" {...props}>
      {props.children || <>Next &raquo;</>}
    </Button>
  );
}

export type WizardNavigationProps = {
  backButton?: ReactNode;
  nextButton: ReactNode;
  pageDescription: ReactNode;
};

export default function WizardNavigation({
  backButton,
  pageDescription,
  nextButton,
}: WizardNavigationProps) {
  return (
    <nav className="navbar fixed-bottom navbar-dark bg-dark">
      <div className="container">
        {backButton}
        <div className="flex-grow-1">
          <div className="d-flex justify-content-center text-white">
            {pageDescription}
          </div>
        </div>
        {nextButton}
      </div>
    </nav>
  );
}
