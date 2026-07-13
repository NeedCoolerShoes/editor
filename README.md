# NCRS Editor

This is the repo for the current editor for [NeedCoolerShoes](https://needcoolershoes.com).

It is GPLv3 or later.

It uses [Lit](https://lit.dev) for web component based UI.

## Running
1. Have NPM and NodeJS installed on your system
2. Open the cloned repository's directory in your Console
3. run `npm install`
4. run `npm run dev`
5. The localhost URL should appear in the console, copy that into your browser's URL bar

## Contributing
Whenever contributing to the editor, make sure to follow these steps if your pull request contains translatable strings:
1. Make sure all translatable strings are contained within `msg()`
2. Apart of `index.xlf`, the Crowdin is the source of truth, if you speak any non-english language, do not include your translation in the pull request.
3. run `npx lit-localize extract`
4. run `npx lit-localize build`