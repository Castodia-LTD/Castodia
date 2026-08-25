export const CASTODIA_PRODUCTS = {
  care: {
    name: "CastodiaCare",
    managerHome: "/care/manager/dashboard",
    supportHome: "/care/support/dashboard",
  },
  core: {
    name: "CastodiaCore",
    home: "/core/dashboard",
  },
  family: {
    name: "CastodiaFamily",
    home: "/family",
  },
} as const;

export type CastodiaProduct = keyof typeof CASTODIA_PRODUCTS;
