declare module "@dipendrabhandari/react-ui-library" {
  import { ReactNode, ButtonHTMLAttributes } from "react";

  export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    colorScheme?:
      | "blue"
      | "gray"
      | "green"
      | "red"
      | "yellow"
      | "purple"
      | "pink"
      | "indigo";
    variant?: "solid" | "outline" | "ghost" | "link";
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    isLoading?: boolean;
    isDisabled?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    loadingText?: string;
    children?: ReactNode;
    className?: string;
  }

  export const Button: React.FC<ButtonProps>;

  // Add other components from the library as needed
  // export const OtherComponent: React.FC<OtherComponentProps>;
}
