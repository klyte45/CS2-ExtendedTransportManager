# Basic Single SPA project for EUIS

## Instructions

- Clone this repository
- Chose the identifier for the application
  - **NOTE:** EUIS requires a modder acronym and a project identifier. Both must have only lowercase letters, numbers and hyphens.
  - They will be used as well to prefix calls/events registered by the backend application in the format `<modderID>::<projectID>.<callOrEventName>`
- Change the project name at these locations: (`<modderID>` & `<projectID>` are self explanatory placeholder)
  - Rename `src/base-proj.tsx` to `src/<modderID>-<projectID>.tsx`
  - In `package.json`, change the field `name` to `@<modderID>/<projectID>`. Use this name when registering your app in the EUIS.
  - In `webpack.config.js`, change the `singleSpaDefaults` constructors fields:
    - `orgName` must be filed using the `<modderId>`
    - `projectName` must be filed using the `<projectID>`
- Install the project using `npm i`

## Testing the application for development

Configure the registration for EUIS (field `JsUrl`) to point to `http://localhost:8500/<modderID>-<projectID>.js`. Then, the EUIS screen will load searching by the file there.

Run the project using `npm start -- --port 8500` to serve the packed project in that place.

## Building the application

Use the command `npm run build:webpack` to generate the bundled js file to `dist/` folder. Don't forget packing it along when distributing the application. As well, you will need to change the `JsUrl` in EUIS to point the bundled JS instead of the localhost.