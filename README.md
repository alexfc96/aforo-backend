# README Modulo3 by Alex Fernández Cánovas
# Backend Readme

## Project Name
  AFORO

## Description
Web app that allows you to register your company and establishments to limit the access establishing a percentage of people allowed in a certain period of time. Once the establishments have been created and you have invited the clients, they will be able to join the available sessions that we have scheduled.

## User Stories

  The natural process to follow would be to register the company, data (how much is the maximum capacity in that establishment), location and invite users who will be able to access as company controllers.
  Once this process has been carried out, they will be able to indicate what hours will be possible for the clients and how many people will be allowed (with a limit already indicated). Once all the configuration is established, you can invite clients. For example, directly inviting them to their mail.

  Once the client user connects, they will be able to see the calendar and book whenever they want / can with some limitations. For example, one hour in the gym every 2 days. If this user has been invited to another companies, they can also manage their "reservations" there.

## Backend Routes

  Auth:
  | Method | Path | Description |
  |--------| ---- |------:|
  | GET    |  /whoami  | The consumer request if is loggued
  | POST   |  /login   | Login proccess (body)
  | POST   |  /signup  | Signup proccess with forms(only for companies) |
  | PUT    |  /:idUser/admin  | Change info about the user |
  | GET    |  /logout  | Login proccess (body)

  Only for companies (admin users):
  | Method | Path | Description |
  |--------| ---- |------:|
  | GET    |  /:companyName              | Info about the company and bookings |
  | PUT    |  /:companyName/admin        | Change info about the companies |
  | POST   |  /:companyName/book         | Able to book the hour selected by the admin user |
  | DELETE |  /:companyName/deletebook   | Delete book | (IDBooking)

  Only for clients (normal users):
  | Method | Path | Description |
  |--------| ---- |------:|
  | GET    |  /:home                | Info about the bookings realised by the user and also appears the different companies that is attached |
  | GET    |  /:companyName         | Info about the company selected realised by the user |
  | POST   |  /:companyName/book    | Able to book the hour selected by the user |
  | DELETE |  /:companyName/deletebook   | Delete book |


## Control Codes

  Method| Codes
  ------| ----

  GET	 

      -Read	200 (OK)
      -404 (Not Found), if ID not found or invalid.
      
  POST

      -Create 201 (Created)
      -404 (Not Found)
      -409 (Conflict) if resource already exists..

  PUT

      -200 (OK)
      -405 (Method Not Allowed)
      -204 (No Content)
      -404 (Not Found), if ID not found or invalid.
  DELETE

      -200 (OK)
      -405 (Method Not Allowed)
      -404 (Not Found), if ID not found or invalid.

## Models

  Company

    -Name: String (unique)
    -Description: String
    -Owner: IDUser Array of owners of the company
    -ShareClientsInAllEstablishments  //allows share the clients in all the establishments of this company

  Establishment

    -IDEstablishment
    -Capacity: {
      maximumCapacity: { type: Number },
      percentOfPeopleAllowed: { type: Number },
    },
    -Address: String / Mapbox
    -Timetable: {
      startHourShift: { type: Number },
      finalHourShift: { type: Number },
      timeAllowedPerBooking: { type: Number },
      howOftenCanBookPerDay: { type: Number },
    }
    company: { ref: 'Company'}, //IDCompany
    owners: [{ ref: 'User' }],  //IDUser
    clients: [{ ref: 'User' }], //IDUser

  User

    -Name: String
    -Username: String (unique)
    -HashedPassword:
    -Years: Number
    -Mail: Mail
    -FavoriteEstablishments: [{ ref: 'Establishment' }] //IDEstablishment

  Booking

    idUser: { ref: 'User' },
    idEstablishment: { ref: 'Establishment' },
    day: { type: Date, required: true, min: '2020-01-01', max: '2025-01-01' },
    startHour: { type: String, required: true },
    timeBetweenBookings: { type: Number },


## Backlog

  ​List of other features outside of the MVPs scope:

  -Add notifications

  -Create public establishments

  -Invite via mail
  ​
  -Geo Location: - add geolocation of the establishments.

## Links

  **Backend Repo Git**
  ​​ https://github.com/alexfc96/aforo-backend

  **Frontend Repo Git**
  ​​ https://github.com/alexfc96/aforo-frontend
  
  **Trello**
  ​ https://trello.com/b/TW4KSt9j/aforo

  **Deploy backend by Heroku**
  https://aforo-api.herokuapp.com/

  ​**Deploy by Heroku**
  https://aforo.herokuapp.com/

  **Slides**
  https://slides.com/alexfernandez-1/aforo/