const { google } = require("googleapis");
const cookieParser = require("cookie-parser");
const apiscopes = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.metadata",
  "https://www.googleapis.com/auth/drive.file"
];

function createConnection() {
  //Google AUTH objects provides access to apis
  return new google.auth.OAuth2(
    process.env.CLIENTID,
    process.env.CLIENTSECRET,
    process.env.REDIRECT
  );
}

function getConnectionUrl(auth) {
  return auth.generateAuthUrl({
    access_type: "offline",
    scope: apiscopes
  });
}

exports.urlGoogle = function() {
  const auth = createConnection();
  const url = getConnectionUrl(auth);

  // console.log(url);
  // console.log(auth);
  return {
    auth: auth,
    url: url
  };
};

exports.getUserMeta = async function(token) {
  const auth = createConnection();
  auth.setCredentials(token);
  const drive = google.drive({ version: "v2", auth });
  let meta = await drive.about.get();
  return {
    user: meta.data.name,
    used: meta.data.quotaBytesUsedAggregate,
    total: meta.data.quotaBytesTotal,
    displayName: meta.data.user.displayName,
    photoLink: meta.data.user.picture.url
  };
};

exports.copyFile = async function(token, fileID, callback) {
  const auth = createConnection();
  auth.setCredentials(token);
  const drive = google.drive({ version: "v2", auth });
  drive.files.copy(
    {
      fileId: fileID,
      fields:
        "id,title,mimeType,capabilities/canCopy,webContentLink,alternateLink,fileSize"
    },
    (err, res) => {
      if (err) callback({ success: false, error: err });
      else callback({ success: true, data: res.data });
    }
  );
};

exports.listFiles = function(tokens) {
  const auth = createConnection();
  auth.setCredentials(tokens);
  const drive = google.drive({ version: "v3", auth });
  drive.files.list(
    {
      pageSize: 10,
      fields: "nextPageToken, files(id, name)"
    },
    (err, res) => {
      if (err) return console.log("The API returned an error: " + err);
      const files = res.data.files;
      if (files.length) {
        console.log("Files:");
        files.map(file => {
          console.log(`${file.name} (${file.id})`);
        });
      } else {
        console.log("No files found.");
      }
    }
  );
};

exports.fileContent = async function(tokens, id, callback) {
  try {
    if (id) {
      const auth = createConnection();
      auth.setCredentials(tokens);
      const drive = google.drive({ version: "v3", auth });
      drive.files.get(
        {
          fileId: id,
          fields: "id,name,size,mimeType,capabilities/canCopy"
        },
        (err, res) => {
          console.log(err);
          console.log(res);
          if (err) callback({ success: false, error: err.errors[0].message });
          else callback({ success: true, data: res.data });
        }
      );
    } else {
      callback({ success: true, error: "Invalid Id or Not provided" });
    }
  } catch (error) {
    callback({ success: true, error: "Token expired please re-authenticate." });
  }
};

exports.generateToken = async function(code, req) {
  const auth = createConnection();
  const { tokens } = await auth.getToken(code);
  // console.log(tokens);
  auth.setCredentials(tokens);
  return tokens;
};
