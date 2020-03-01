import * as express from "express";
import { Request, Response } from "express";
import lights from "./lights";
import helpers from "./helpers";

const TuyAPI = require("tuyapi");
const cors = require("cors");
const bodyParser = require("body-parser");

const { PORT = 3000 } = process.env;
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.post("/post-lights", (req: Request, res: Response) => {
  const { hexToRgb, rgbToHex, hsvToRgb, rgbToHsv } = helpers;
  const { hex, brightness, saturation, mode, temp, on, index } = req.body;
  const adjustedHue = rgbToHsv(...hexToRgb(hex))[0];
  const adjustedRgb = hsvToRgb(adjustedHue, brightness, saturation);
  const adjustedHex = `${rgbToHex(...adjustedRgb).split(".")[0]}00000000`;

  const data = on
    ? {
        "1": on, // true or false
        "2": mode, // color or white
        "3": Math.floor((255 - 25) * brightness + 25), // white brightness
        "4": Math.floor(255 * temp), // white temp
        "5": adjustedHex
      }
    : { "1": on };

  const { name, ...connector } = lights[index];
  const device = new TuyAPI({ ...connector });

  let stateHasChanged = false;
  device.find().then(() => {
    device.connect();
  });

  device.on("error", error => {
    device.disconnect()
    return res.send({error: 'slow down'})
  });

  device.on("data", prevData => {
    if (!stateHasChanged) {
      device.set({ multiple: true, data });
      stateHasChanged = true;
    } else {
      device.disconnect();
      return res.send(data);
    }
  });
});

app.listen(PORT, () => {
  console.log("server started at http://localhost:" + PORT);
});
