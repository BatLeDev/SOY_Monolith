# Monolith version of the ShellOnYou app

## Table of contents

- [Description](#description)
- [Content of the repo](#content)
- [Building the app](#building-the-app)
- [Configuring](#setting-up-the-app)
- [Launching](#launching-the-app)
- [Using](#using-the-app)
- [Citing](#how-to-cite)
- [License](#license)

## Description

This repo contains the monolith backend version (v4) of the ShellOnYou app. This app proposes exercises for students to practice the Unix CLI. Teachers can add exercises group them into sessions that can be opened to their students. See the *Help* pages once the app has been started.

Nota that this version of the app is only proposed for scientific purposes, so no associated frontend is provided with it (if you really need a frontend for this version please contact us for getting one).

Note that the database proposed here contains just one exercise. Instructors can contact us to have access to a private repo containing more exercises (not exposed to students).

The app is intended to run as a couple of containers:

- one for the backend of the monolith
- one for the database server

So you need docker installed. Alternatively, you could easily migrate to kubernetes or even manually start its components one by one with appropriate changes in the code (port numbers, variables).

## Content

This directory contains:

- `back`: code for the monolith.

## Setting up the app

- Uncompress the database archive by typing: `tar xzf v4-soy-db.tgz`.
This should create a `v4-soy-db` folder. To avoid pemission problems you should go `chmod -R 777 v4-soy-db` then check with `ls -l` that the permissions are `7xx` on this folder.

- Modify the `variables.env` file according to your environment requirements.

- Complete the information in the `EMAIL` section of this file. This is needed for the account creation and change password functionalities. If you don't need them (eg if you're just interested in running load tests), ignore this section.

- Uncomment/comment the `DEBUG=*` line in this file to have less/more info as the app launches and runs.

## Launching the app

- While still being in the root folder of this repo, run this command:

```bash
docker compose up
```

Note: with older versions of *docker*, e.g. v20, you could need to add a dash: `docker-compose up`

## Using the app

Once it is launched, you can access the app using the appropriate endpoints and ports specified in your customized `docker-compose.yml` and `variables.env` files. If you didn't change the default port, the backend *login* route is accessed by sending a POST request at `http://localhost:5001/api/user/login` with a payload indicating a valid `email` and `password`.
The other endpoints are listed in the `back/routes` folder.

The DB in its current state contains a large number of user accounts for load test purposes. We give some examples here so that you can log in (.e.g. with curl or postman) and then send other requests:

- <adminp@yopmail.com> / `adminp`
- <teacher1@yopmail.com> / `plageCT`
- <teacher2@yopmail.com> / `plageVB`
- <student@yopmail.com> / `toto`

To manually connect to the database once the server is launched you can run
`docker exec -it postgres psql -U plagedba -d plagedb` then enter `\d` in the psql prompt to see the tables, for instance.

---

## How to cite

[1] *Is it Worth Migrating a Monolith to Microservices? An Experience Report on Performance, Availability and Energy Usage*. V. Berry, A. Castelltort, B. Lange, J. Teriihoania, C. Tibermacine, C. Trubiani. Proc. of IEEE International Conference on Web Services (ICWS'24).

[2] *ShellOnYou: learning by doing Unix command line*. V. Berry, C. Castelltort, C. Pelissier, M. Rousseau, C. Tibermacine, Proc. of the 27th ann. conf. on Innovation and Technology in Computer Science Education (ITiCSE), Vol 1, pages 379-385, 2022, doi 10.1145/3502718.3524753

---

## License

### Copyright notice

```txt
Shell On You, an educational web application to learn shell.
Copyright © 2025 modified by Baptiste GUERNY / Anatole DERRIEN (guerny.e2200228@etud.univ-ubs.fr)
Copyright © 2022 POLYTECH MONTPELLIER.


This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
any later version.


This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
```

### Modification

When you modified the code of a file, you may edit the copyright notice on top of it by adding a modification line like this:

```txt
Shell On You, an educational web application to learn shell.
HERE -> Copyright © <year> modified by <NAME> (<MAIL>)
Copyright © 2022 POLYTECH MONTPELLIER.
```

## SonarQube
```bash
sonar-scanner \
  -Dsonar.projectKey=SoYMono \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.token=YOUR_TOKEN
  -Dsonar.exclusions=v4-soy-db/**,back/node_modules/**
```
