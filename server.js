const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const authentication = require("./utils.js");

app.use(express.static("public"));
app.use(
  cookieParser("w6%zk*$Y", {
    maxAge: 3600,
    secure: true
  })
);

app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/auth", (req, res) => {
  const data = authentication.urlGoogle();
  res.redirect(data.url);
});

app.get("/active", async function(req, res) {
  const tokens = await authentication.generateToken(req.query.code, req);
  res.cookie("dtoken", tokens, { secure: true });
  res.sendFile(__dirname + "/views/active.html");
});

app.get("/list", (req, res) => {
  authentication.listFiles(req.cookies.dtoken);
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/user", async (req, res) => {
  let meta = await authentication.getUserMeta(req.cookies.dtoken);
  console.log(meta);
  res.json(meta);
});

app.get("/user/file/:fileID", async (req, res) => {
  await authentication.copyFile(req.cookies.dtoken, req.params.fileID, resp => {
    res.json(resp);
  });
});


// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
