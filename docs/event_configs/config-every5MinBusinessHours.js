/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 */

const fs = require("fs");
const path = require("path");

var AWS_REGION = process.env.AWS_REGION || "us-west-2";
var ChannelId = process.env.ChannelId 
if (!ChannelId) {
  throw new Error("CHANNEL_ID environment variable is not set.");
}
var schedulerName = "EveryHalfHourBusinessHours"
var cron = "0/5 8-17 ? * MON-FRI *"

// Define the output directory and filename
var outputDir = "../event_objects/";
//var outputFile = `${schedulerName}.json`;

// Resolve the output directory to the script's root directory
outputDir = path.resolve(__dirname, outputDir);

// Ensure the directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

['create', 'delete'].forEach(action => {
  var data = {
    action,
    schedulerName,
    cron,
    channelInfoPayload: {
      AWS_REGION,
      ChannelId,
      PipelineId: "0",
      ThumbnailType: "CURRENT_ACTIVE"
    }
  };

  // Define the output file, prefixing with the action
  var outputFile = `${action}_${schedulerName}.json`;



  // Write data to JSON files
  fs.writeFile(path.join(outputDir, outputFile), JSON.stringify(data, null, 2), function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log(`Output saved to ${outputDir}/${outputFile}.`);
    }
  });
})