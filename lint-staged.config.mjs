export default {
  '*.{js,jsx,mjs,ts,tsx}': [
    'prettier --config ./prettier.config.mjs --write',
    'eslint --config ./eslint.config.mjs --fix',
  ],
  '*.{json,md}': ['prettier --config ./prettier.config.mjs --write'],
};
