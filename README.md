# README Modulo3 by Alex Fernández Cánovas
# Backend Readme

## Project Name
  AFORO

## Description
  Web app that allows you to register your company or establishment and limit access to your companies following the state of alarm laws established by the government.

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
    -Establishments: Ver si esto da para otro modelo(englobar varias sucursales de una sola compañia para que esta tenga control sobre todas )-> Backlog?
    -Clients: Array with tbe IDusers invited by the company
    -Workers?

  Establishment
    -IDEstablishment
    -Capacity: Number
    -Address: String / Mapbox
    -Timetable: Date
    -Users: Array o object?  **Add the IDusers invited by the company

  User
    -Name: String
    -Username: String (unique)
    -HashedPassword:
    -Years: Number
    -Mail: Mail
    -Role: [Admin, user -> client]
    -Companies: IDCompany (the user can be linked in more than 1 company)

  Booking
    -IDEstablishment
    -IDUser
    -EndDate
    -StartDate

## Backlog

  ​List of other features outside of the MVPs scope:

  -​User profile: - see my profile - upload my profile picture - update my profile info

  -Homepage: - Show the different bussines where the user can book hour

  -Add notifications

  -Invite via mail
  ​
  -Geo Location: - add geolocation of the bussines.

  -Add different users who can see the information about the users that will assist to the establishment.

## Links

  **Git**
  ​​ Repository
  **Frontend Repo Git**
  
  **Trello**
  ​ https://trello.com

  ​**Deploy by Heroku**

  **Slides**
