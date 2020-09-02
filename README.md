# Video Labeler

Browser based video labelling software for computer vision applications.

> Setup using [vue-cli](https://cli.vuejs.org/)

## Development

Labeler uses an example API link specified in `.env` that expects output as specified in `/public/task.json`

### Project setup

```bash
# Install project dependencies
npm install
cp .env.example .env
```

### Regular use

```bash
# Run the vue development server using vue-cli
# -> Compiles and hot-reloads for development
# -> Runs app on port 8080
# -> Automatically formats code (using prettier) on save
npm run serve
```

### Irregular use

```bash
# Compile and minify for production
# -> Puts all the resources into /dist
npm run build

# Run your (unit)tests
# -> tests under __tests__
# to change test dir use jest.config.js
npm run test:unit

# Run lint and fix files
npm run lint

# Run prettier on files
npm run prettier
```

### Code formatting

This repo uses [prettier](https://prettier.io/) to auto format code to a consistent standard. It also uses [yorkie](https://www.npmjs.com/package/yorkie)
and [lint-staged](https://www.npmjs.com/package/lint-staged) packages to auto format code on commit, keeping repo code formatting consistent.

Integrates with Vue's eslint and formats code on save when running `npm run serve`.

For manual manual prettier run `npm run prettier`. To ignore files for prettier add them [.prettierignore](/.prettierignore).

# Future work

Please use [issues](/issues) to report any bugs and/or ideas for future work.
