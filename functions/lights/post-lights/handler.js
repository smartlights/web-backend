"use strict";
const TuyAPI = require("tuyapi");
const helpers = require("./helpers");
const lights = require("./lights");

module.exports = async (event, context) => {
  const body = event.body;
  const { hexToRgb, rgbToHex, hsvToRgb, rgbToHsv } = helpers;
  try {
    let { hex, brightness, saturation, mode, temp, on, index } = event.body;

    let rgb = hexToRgb(hex);
    let hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    hsv[1] = saturation;
    hsv[2] = brightness;

    rgb = hsvToRgb(hsv[0], hsv[1], hsv[2]);
    hex = rgbToHex(rgb[0], rgb[1], rgb[2]).split(".")[0] + "00000000";

    let whiteBright = Math.floor((255 - 25) * brightness + 25);
    let whiteTemp = Math.floor(255 * temp);
    const { name, ...connector } = lights[index];
    const device = new TuyAPI({ ...connector });
    await device.find();
    await device.connect();

    if (on === false) {
      device.set({ multiple: true, data: { "1": on } });
    } else {
      device.set({
        multiple: true,
        data: {
          "1": on,
          "2": mode,
          "3": whiteBright,
          "4": whiteTemp,
          "5": hex
        }
      });
    }

    device.disconnect();
    context.status(200).succeed({ status: "success!" });
  } catch (e) {
    context.status(500).fail({ error: e });
  }
};
