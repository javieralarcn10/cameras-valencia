const express = require("express");
const axios = require("axios");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 30049;

async function getCameras() {
  const cameras = JSON.parse(fs.readFileSync("cameras.json", "utf8"));
  return cameras.map((camera) => ({
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
  }));
}

app.get("/", (req, res) => {
  res.sendFile("public/index.html", {root: __dirname});
});

app.get("/icon.png", (req, res) => {
  res.sendFile("public/icon.png", {root: __dirname});
});

app.get("/api/cameras", async (req, res) => {
  const cameras = await getCameras();
  res.json(cameras);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
