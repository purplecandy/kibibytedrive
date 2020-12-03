const { Base64 } = require('js-base64');
const express = require("express");
const cookieParser = require("cookie-parser");
const authentication = require("./utils.js");
const cors = require("cors");
const HOST = "https://lace-observation.glitch.me/";
const app = express();
app.use(cors({ origin: true, credentials: true, "methods": "GET,HEAD,PUT,PATCH,POST,DELETE", allowedHeaders: "Cookie" }));
app.use(express.static("public"));
app.use(
  cookieParser("w6%zk*$Y", {
    maxAge: 3600,
    secure: true
  })
);

function et(req) {
  const token = Base64.decode(req.query.token);
  console.log("TOKEN", token);
  return JSON.parse(token);
}
app.get("/test", (req, res) => {
  let jsonString = JSON.stringify({ "message": Base64.encode("Hello World") });
  // let encoded = Base64.encode("Hello World");
  let encoded = Base64.encode(jsonString);
  res.redirect(HOST + "activate.html?code=" + encoded);
  // res.json({"message":Base64.encode("Hello World")});
});

app.get("/", function (request, response) {
  response.sendFile(__dirname + "/public/index.html");
});

app.get("/privacy", function (request, response) {
  response.sendFile(__dirname + "/public/privacy.html");
});

app.get("/auth", (req, res) => {
  //authentication returns a url with a code
  //this redirect url is specified in when you create credentials
  //I have specified `/active`
  const data = authentication.urlGoogle();
  res.redirect(data.url);
});

app.get("/active", async function (req, res) {
  try {
    //the url has a code parameter which contains the token
    const token = await authentication.generateToken(req.query.code, req);
    // const token = { access_token: 'ya29.a0AfH6SMAjyfBFFImxb4kTja5huLI9cmFJuNs8aKd7Rp00dwj0z4RXTELn61efLVHd_WcPaM448GsvAHkCwTgCW3yFugPlKhkgRbPcRNy86dHAlog7SIWQCf-7NgcoiKLSiUOp2nI9QfDAJZ2xEUD_P1i3wVtE-ABeCleT4oSReKaO',
    // scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.metadata',
    // token_type: 'Bearer',
    // expiry_date: 1606254915874 };
    console.log(token);
    res.cookie("dtoken", token, { secure: true });
    const jsonString = JSON.stringify(token);
    const encoded = Base64.encode(jsonString);
    console.log(encoded);
    res.redirect(HOST + "activate?code=" + encoded);
  } catch (e) {
    console.log("Error at: /active");
    console.log(e);
    res.json({ message: "Unauthenticated" });
  }

});

app.get("/list", (req, res) => {
  authentication.listFiles(et(req));
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/file/:fileID", async (req, res) => {
  await authentication.fileContent(et(req), req.params.fileID, resp => {
    res.json(resp);
  });
});

//user details
app.get("/user", async (req, res) => {
  try {
    let meta = await authentication.getUserMeta(et(req));
    console.log(meta);
    return res.status(200).json(meta);
  } catch (e) {
    console.log(e);
    return res.status(400).send({ message: "Invalid Authentication" });
  }
});

//copy file by ID
app.get("/user/file/:fileID", async (req, res) => {
  await authentication.copyFile(et(req), req.params.fileID, resp => {
    res.json(resp);
  });
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
