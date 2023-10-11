# NTC_Server

Our backend server for storing things and stuff

## Developing

1. Install [Node.JS](https://nodejs.org/en) and [git](https://git-scm.com/download/win)

2. Download the code by running (in a terminal):

```sh
git clone https://github.com/Purdue-IEEE-Neurotech-Committee/NTC_Server
```

3. Open the folder in an IDE (Either VSCode or WebStorm)
4. Run in terminal in both the `/api` and `/client` folders:

```sh
npm install
```

5. Create a new file called `.env` in the current directory with the following information:

```env
PORT=3000
SECRET_KEY=<This is an encryption key. You can generate one here: https://generate-random.org/encryption-key-generator?count=1&bytes=32&cipher=aes-256-cbc&string=&password=>
DEBUG=ntc-server:*
```

6. Start the server by running in terminal in both the `/api` and `/client` folders:

```sh
npm run start
```

7. You can test the server using [Postman](https://www.postman.com/downloads/)
