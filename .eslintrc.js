module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: ["next/core-web-vitals", "prettier"],
  // add your custom rules here
  rules: {
    "react/no-unescaped-entities": "off",
    "react-hooks/exhaustive-deps": "off",
    "@next/next/no-img-element": "off",
  },
};
