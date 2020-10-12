import client from "./client.mjs";
import auth from "./auth.mjs";
import { actions, exportCards } from "./game.mjs";

client.on("message", async (msg) => {
  if (msg.channel.type == "text" || msg.channel.type == "dm") {
    let action = actions.find((action) => action.command.toLowerCase() == msg.content.toLowerCase().trim());

    if (action) {
      try {
        action.handler(msg);
      } catch (error) {
        console.error(error);
      }
    }
  }
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

process.on("SIGINT", function() {
    console.log("Gracefully disconnecting from Discord...");
    client.destroy();
});

exportCards("cards.csv");

client.login(auth.token);
