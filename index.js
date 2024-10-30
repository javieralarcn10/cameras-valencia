const express = require("express");
const axios = require("axios");
const NodeCache = require("node-cache");
const myCache = new NodeCache({stdTTL: 3600, checkperiod: 120});

const app = express();
const port = 30049;

const BASE_URL =
  "https://valencia.opendatasoft.com/api/explore/v2.1/catalog/datasets/cameres-trafic-camaras-trafico/records";

async function getCameras() {
  if (myCache.has("cameras")) {
    return myCache.get("cameras");
  }
  let pagesRemaining = true;
  let page = 1;
  let cameras = [];
  while (pagesRemaining) {
    const response = await axios.get(`${BASE_URL}?limit=${100}&offset=${page * 100}`);
    cameras.push(
      ...response.data.results.map((camera) => ({
        id: camera.idcamara,
        name: camera.descripcio,
        type: camera.tipocamara,
        isTunnel: camera.pasoinferi?.toLowerCase() === "si" ? true : false,
        vlcUrl: `rtsp://camaras.valencia.es/stream/${camera.idcamara}/1`,
        webUrl: camera.url,
        coordinates: {
          lat: camera.geo_point_2d.lat,
          lon: camera.geo_point_2d.lon,
        },
      })),
    );
    pagesRemaining = response.data.results.length === 100;
    page++;
  }
  myCache.set("cameras", cameras);
  return cameras;
}

app.get("/", (req, res) => {
  res.sendFile("public/index.html", {root: __dirname});
});

app.get("/api/cameras", async (req, res) => {
  const cameras = await getCameras();
  res.json(cameras);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
