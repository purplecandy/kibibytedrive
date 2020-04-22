// client-side js
// run by the browser each time your view template is loaded

console.log("hello world :o");
document.getElementById("refresh").addEventListener("click", getUserDetail);
const resultBox = document.getElementById("result-box");
const submitBtn = document.getElementById("submit");
const urlInput = document.getElementById("url-field");
// const resultUrl = document.getElementById("result-url");
// resultBox.style.visibility = "hidden";

submitBtn.addEventListener("click", handleSubmit);

async function handleSubmit(event) {
  event.preventDefault();
  const url = urlInput.value;
  if (urlInput.value.length > 0) {
    submitBtn.innherHTML = "Fetching";
    const id = getIdFromUrl(url);
    if (id.length > 0) {
      await copyFile(id);
    } else {
      alert("Invalid url");
    }
  }
}

async function copyFile(id) {
  fetch("https://lace-observation.glitch.me/user/file/" + id)
    .then(resp => resp.json())
    .then(data => {
      console.log(data);
      if (data["success"] == true) {
        resultBox.style.visibility = "visible";
        const element =
          `<div id="result">
          <h4>` +
          data["data"]["originalFilename"] +
          `</h4>
          <input value=` +
          data["data"]["webContentLink"] +
          `type="text" disabled />
          <button onclick="window.open('` + data["data"]["webContentLink"] +
          `','_blank');">Download</button>
        </div>`;
        resultBox.innerHTML = resultBox.innerHTML + element;
      } else {
        const element =
          `<div id="result">
          <h4>FAILED: ` +
          data["error"]["errors"][0]["message"] +
          `</h4>
        </div>`;
        resultBox.innerHTML = resultBox.innerHTML + element;
      }
    });
}

async function getUserDetail() {
  fetch("https://lace-observation.glitch.me/user")
    .then(resp => resp.json())
    .then(data => {
      // a dirty way
      document.getElementById("user").innerHTML =
        "<ul><li>User: " +
        data.user +
        "</li><li>Used: " +
        formatBytes(data.used) +
        "</li><li>Total: " +
        formatBytes(data.total) +
        "</li></ul>";
      //activate text field
      document.getElementById("url-field").removeAttribute("disabled");
    });
}

function generateUrl(url, index) {
  setTimeout(() => {
    const a = links[index - 1];
    a.setAttribute("href", url);
  }, 2000);
}
// array of links
const links = [];
const linkList = document.getElementById("links");
const Form = document.forms[0];

const appendLink = function(link) {
  const item = document.createElement("li");
  const a = atag("#", link);
  item.innerHTML = a.outterHTML;
  linkList.appendChild(item);
  links.push(a);
  generateUrl(link, links.length);
};

function atag(l, t) {
  const a = document.createElement("a");
  a.target = "_blank";
  // a.baseURI = "";
  a.href = l;
  a.innerText = t;
  a.removeAttribute("href");
  return a;
}

// Form.onsubmit = function(event) {
//   event.preventDefault();
//   appendLink(urlInput.value);
//   urlInput.value = "";
//   urlInput.focus();
// };

function formatBytes(a, b) {
  if (0 == a) return "0 Bytes";
  var c = 1024,
    d = b || 2,
    e = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    f = Math.floor(Math.log(a) / Math.log(c));
  return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f];
}

function getIdFromUrl(url) {
  const id = url.match(/[-\w]{25,}/);
  return id == null ? "" : id[0];
}
