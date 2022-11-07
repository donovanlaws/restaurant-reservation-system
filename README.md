# Thinkful Final Capstone: Restaurant Reservation System

## [Live Vercel App](https://dl-restres-frontend.vercel.app/)


## [GitHub Project Kanban Board](https://github.com/donovanlaws/restaurant-reservation-system/projects/1)

# Tech Stack:

## Frontend:
- React.JS
- HTML
- CSS
- JSX

## Backend:
- Express
- Knex
- PostgreSQL
- Node.JS

## Application
This application is the Periodic Tables Restaurant Reservation System, which you can use to create, update, and manage restaurant tables and reservations.
You can also filter reservations by phone numbers and dates, sort them, and manage booking, seating, and finishing them.

## Project Files

This project is set up as a **monorepo**, so the frontend and backend projects are both in one repo. This allows you to open them both in the same editor.
The communications between the backend and frontend are done to a PostgreSQL database via [Knex](http://knexjs.org/).

## Database setup
1. Set up a new ElephantSQL database, or multiple if you want to run development environments and testing environments.
2. After setting one or multiple up, connect to them in a database management program, such as DBeaver, to view the data.

### Knex
Run `npx knex` commands from within the `back-end` folder, which is where the `knexfile.js` file is located.

## Installation
1. Fork and clone this repository.
1. Run `cp ./back-end/.env.sample ./back-end/.env`.
1. Update the `./back-end/.env` file with the connection URL's to your ElephantSQL database instance.
1. Run `cp ./front-end/.env.sample ./front-end/.env`.
1. You should not need to make changes to the `./front-end/.env` file unless you want to connect to a backend at a location other than `http://localhost:5000`.
1. Run `npm install` to install project dependencies.
1. Run `npm run start:dev` to start your server in development mode.

## Running tests
This project has unit, integration, and end-to-end (e2e) tests. 
End-to-end tests use browser automation to interact with the application just like the user does.

Test are split up by user story. You can run the tests for a given user story by running:

`npm run test:X` where `X` is the user story number.

Have a look at the following examples:

- `npm run test:1` runs all the tests for user story 1 (both frontend and backend).
- `npm run test:3:backend` runs only the backend tests for user story 3.
- `npm run test:3:frontend` runs only the frontend tests for user story 3.

Whenever possible, frontend tests will run before backend tests to help you follow outside-in development.

> **Note** When running `npm run test:X` If the frontend tests fail, the tests will stop before running the backend tests. Remember, you can always run `npm run test:X:backend` or `npm run test:X:frontend` to target a specific part of the application.

Since tests take time to run, you might want to consider running only the tests for the user story you're working on at any given time.

Once you have all user stories complete, you can run all the tests using the following commands:

- `npm test` runs _all_ tests.
- `npm run test:backend` runs _all_ backend tests.
- `npm run test:frontend` runs _all_ frontend tests.
- `npm run test:e2e` runs only the end-to-end tests.

If you would like a reminder of which npm scripts are available, run `npm run` to see a list of available commands.

Note that the logging level for the backend is set to `warn` when running tests and `info` otherwise.

> **Note**: After running `npm test`, `npm run test:X`, or `npm run test:e2e` you might see something like the following in the output: `[start:frontend] Assertion failed:`. This is not a failure, it is just the frontend project getting shutdown automatically.

> **Note**: If you are getting a `unable to resolve dependency tree` error when running the frontend tests, run the following command: `npm install --force --prefix front-end`. This will allow you to run the frontend tests.

> **Hint**: If you stop the tests before they finish, it can leave the test database in an unusual state causing the tests to fail unexpectedly the next time you run them. If this happens, delete all tables in the test database, including the `knex_*` tables, and try the tests again.

### Frontend test timeout failure
Running the frontend tests on a resource constrained computer may result in timeout failures.
If you believe your implementation is correct, but needs a bit more time to finish, you can update the `testTimeout` value in `front-end/e2e/jest.config.js`. A value of 10000 or even 12000 will give each test a few more seconds to complete.

#### Screenshots
To help you better understand what might be happening during the end-to-end tests, screenshots are taken at various points in the test.
The screenshots are saved in `front-end/.screenshots` and you can review them after running the end-to-end tests.
You can use the screenshots to debug your code by rendering additional information on the screen.
