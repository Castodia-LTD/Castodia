"use client";

import type {
  NativeProduct,
} from "@/hooks/native/useNativeProduct";

import { CareIOSLoginPage } from "./login/CareIOSLoginPage";
import { CoreIOSLoginPage } from "./login/CoreIOSLoginPage";
import { FamilyIOSLoginPage } from "./login/FamilyIOSLoginPage";

export type IOSLoginViewProps = {
  email: string;
  password: string;
  loggingIn: boolean;
  sendingReset: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLogin: () => Promise<void>;
  onForgotPassword: () => Promise<void>;
};

type IOSLoginPageProps =
  IOSLoginViewProps & {
    product: NativeProduct;
  };

export function IOSLoginPage(
  props: IOSLoginPageProps,
) {
  switch (props.product) {
    case "core":
      return (
        <CoreIOSLoginPage {...props} />
      );

    case "family":
      return (
        <FamilyIOSLoginPage {...props} />
      );

    case "care":
    default:
      return (
        <CareIOSLoginPage {...props} />
      );
  }
}