module.exports = {
  "extends": [
    "google",
    "plugin:flowtype/recommended",
    "plugin:react/recommended",
    "prettier",
    "prettier/flowtype",
    "prettier/react"
  ],
  "plugins": [
    "flowtype",
    "react",
    "prettier"
  ],
  "parserOptions": {
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "env": {
    "es6": true,
    "node": true
  },
  "rules": {
    "prettier/prettier": "error",
    "max-len": ["error", {"code": 119, "ignoreUrls": true}],
    "no-confusing-arrow": "error",
    "no-tabs": "error",
    "curly": ["error", "all"]
  }
};
