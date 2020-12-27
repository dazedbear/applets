const {
  constructServerLayout,
  sendLayoutHTTPResponse,
} = require("single-spa-layout");
const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

// TODO: update middleware configs to upgrade the secure level when server is prodution ready.
app.use(cors());
app.use(helmet());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// health check
app.get("/status", (req, res) => {
  return res.status(200).send("OK");
});

// TODO: single-spa root config SSR (need to update options)
app.get("/", async (req, res) => {
  await sendLayoutHTTPResponse({
    res,
    serverLayout: constructServerLayout({ filePath: "../views/index.ejs" }),
    urlPath: req.path,
    async renderApplication({ appName, propsPromise }) {
      return {
        assets: `<link rel="stylesheet" href="/my-styles.css">`,
        content: `<button>${appName} app</button>`,
      };
    },
    async retrieveApplicationHeaders({ appName, propsPromise }) {
      return {
        "x-custom-header": "value",
      };
    },
    async renderFragment(fragmentName) {
      return `<script type="systemjs-importmap">{"imports": {}}</script>`;
    },
    async retrieveProp(propName) {
      return "prop value";
    },
    assembleFinalHeaders(allHeaders) {
      allHeaders.forEach(({ appProps, appHeaders }) => {});
      return {};
    },
  });
});

// 404 default
app.use((err, req, res, next) => {
  return res.status(404).send("Not found.");
});

app.listen(port, () => {
  console.log(`App is listening at http://localhost:${port}`); // eslint-disable-line no-console
});
