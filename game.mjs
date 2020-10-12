import client from "./client.mjs";
import Chance from "chance";
import { promises as fs } from "fs";

import cardsIncident from "./cards/start-incident.mjs";
import cardsBunker from "./cards/start-bunker.mjs";
import cardsAction from "./cards/actions.mjs";
import cardsAdditional from "./cards/additional.mjs";
import cardsCharacter from "./cards/characters.mjs";
import cardsHealth from "./cards/health.mjs";
import cardsHobby from "./cards/hobbies.mjs";
import cardsLuggage from "./cards/luggage.mjs";
import cardsPhobia from "./cards/phobias.mjs";
import cardsProffesion from "./cards/proffesions.mjs";

const chance = new Chance();

const game = {
  state: null,
  starterId: null,
  members: new Set(),

  finish() {
    this.state = null;
    this.starterId = null;
    this.channelId = null;
    game.members = new Set();
  }
}

export let actions = [{
  command: "хотим играть в бункер",
  handler: async (msg) => {
    if (msg.channel.type == "dm") {
      return;
    }

    if (game.state !== null) {
      msg.channel.send(
        `Простите, у меня пока что всего одно ядро и я не могу вести более чем одну игру одновременно :(`
      );
      return;
    }

    msg.channel.send(
      `Мне показалось, кто-то хочет поиграть в бункер? Я только за!\n\n` +
      `Поставьте в этот канал + все те, кто будет участвовать.\n` +
      `Как все будут готовы, ${msg.author.username}, пожалуйста, напиши "начинаем".`
    );

    game.state = "gathering";
    game.channelId = msg.channel.id;
    game.starterId = msg.author.id;
    game.members.add(msg.author.id);
  }
}, {
  command: "+",
  handler: async (msg) => {
    if (msg.channel.type == "dm") {
      return;
    }

    if (game.state !== "gathering") {
      return;
    }

    game.members.add(msg.author.id);
  }
}, {
  command: "начинаем",
  handler: async (msg) => {
    if (msg.channel.type == "dm") {
      return;
    }

    if (game.state !== "gathering") {
      return;
    }

    msg.channel.send(
      `Значит так, ребята, у нас следующая вводная.\n\n` +
      chance.shuffle(cardsIncident).shift() +
      `\n\nИ где бы вы думали мы будем спасаться от этого ненастья?\n\n` +
      chance.shuffle(cardsBunker).shift() + "\n"
    );

    let shuffledCardsAction = chance.shuffle(cardsAction);
    let shuffledCardsAdditional = chance.shuffle(cardsAdditional);
    let shuffledCardsCharacter = chance.shuffle(cardsCharacter);
    let shuffledCardsHealth = chance.shuffle(cardsHealth);
    let shuffledCardsHobby = chance.shuffle(cardsHobby);
    let shuffledCardsLuggage = chance.shuffle(cardsLuggage);
    let shuffledCardsPhobia = chance.shuffle(cardsPhobia);
    let shuffledCardsProfession = chance.shuffle(cardsProffesion);

    for (let memberId of game.members) {
      let text = [
        "Профессия: " + shuffledCardsProfession.shift(),
        "Пол и возраст: " + getSexAndAge(),
        "Состояния здоровья: " + shuffledCardsHealth.shift(),
        "Человеческая черта: " + shuffledCardsCharacter.shift(),
        "Хобби: " + shuffledCardsHobby.shift(),
        "Дополнительная информация: " + shuffledCardsAdditional.shift(),
        "Багаж: " + shuffledCardsLuggage.shift(),
        "Фобия: " + shuffledCardsPhobia.shift(),
        "Карта действия: " + shuffledCardsAction.shift(),
        "Карта действия: " + shuffledCardsAction.shift()
      ].join("\r\n");

      (await client.users.fetch(memberId)).send(text);
    }

    msg.channel.send(`Карты розданы и скоро дойдут до адресатов. Приятной игры!`);
    game.state = "gaming";
  }
}, {
  command: "Перераздать у всех игроков, включая себя, карточки «Профессия»",
  handler: async (msg) => {
    if (game.state !== "gaming") {
      return;
    }

    (await client.channels.fetch(game.channelId)).send(
      `${msg.author.username} попросил перераздать у всех игроков, включая себя, карточки «Профессия».\n` +
      "Выполняю."
    );

    let shuffledCardsProfession = chance.shuffle(cardsProffesion);

    for (let memberId of game.members) {
      (await client.users.fetch(memberId)).send(shuffledCardsProfession.shift());
    }
  }
}, {
  command: "Перераздать у всех игроков, включая себя, карточки «Состояние здоровья»",
  handler: async (msg) => {
    if (game.state !== "gaming") {
      return;
    }

    (await client.channels.fetch(game.channelId)).send(
      `${msg.author.username} попросил перераздать у всех игроков, включая себя, карточки «Состояние здоровья».\n` +
      "Выполняю."
    );

    let shuffledCardsHealth = chance.shuffle(cardsProffesion);

    for (let memberId of game.members) {
      (await client.users.fetch(memberId)).send(shuffledCardsHealth.shift());
    }
  }
}, {
  command: "Поменять свою карту «Профессия» на новую из колоды",
  handler: async (msg) => {
    if (game.state !== "gaming") {
      return;
    }

    (await client.channels.fetch(game.channelId)).send(
      `${msg.author.username} попросил поменять ему карту «Профессия» на новую из колоды.\n` +
      "Выполняю."
    );

    msg.author.send(chance.pickone(cardsProffesion));
  }
}, {
  command: "Поменять свою карту «Состояние здоровья» на новую из колоды",
  handler: async (msg) => {
    if (game.state !== "gaming") {
      return;
    }

    (await client.channels.fetch(game.channelId)).send(
      `${msg.author.username} попросил поменять ему карту «Состояние здоровья» на новую из колоды.\n` +
      "Выполняю."
    );

    msg.author.send(chance.pickone(cardsHealth));
  }
}, {
  command: 'Поменять свою карту «Фобия» на новую из колоды',
  handler: async (msg) => {
    if (game.state !== "gaming") {
      return;
    }

    (await client.channels.fetch(game.channelId)).send(
      `${msg.author.username} попросил поменять ему карту «Фобия» на новую из колоды.\n` +
      "Выполняю."
    );

    msg.author.send(chance.pickone(cardsPhobia));
  }
}, {
  command: 'Поменять свою карту «Дополнительная информация» на новую из колоды',
  handler: async (msg) => {
    if (game.state !== "gaming") {
      return;
    }

    (await client.channels.fetch(game.channelId)).send(
      `${msg.author.username} попросил поменять ему карту «Дополнительная информация» на новую из колоды.\n` +
      "Выполняю."
    );

    msg.author.send(chance.pickone(cardsAdditional));
  }
}];

function getSexAndAge() {
  let sex = chance.pickone(["мужчина", "женщина"]);
  let age = chance.bool({likelihood: 50}) ? chance.integer({min: 18, max: 40}) : chance.integer({min: 40, max: 80});
  let isInfertile = chance.bool({likelihood: 15});

  let result = `${sex}, ${age}`;

  if (isInfertile) {
    result += ", ";

    if (sex == "мужчина") {
      result += "бесплодный";
    } else {
      result += "бесплодная";
    }
  }

  return result;
}

export function exportCards(filename) {
  let i = 0;
  let j = 0;
  let text = "";

  while (i < 8) {
    if (
      (j == cardsProffesion.length - 1) ||
      (j == cardsHealth.length - 1) ||
      (j == cardsCharacter.length - 1) ||
      (j == cardsHobby.length - 1) ||
      (j == cardsAdditional.length - 1) ||
      (j == cardsLuggage.length - 1) ||
      (j == cardsPhobia.length - 1) ||
      (j == cardsAction.length - 1)
    ) {
      i++;
    }

    text += (
      (cardsProffesion[j] || ("")) + "\t" +
      (cardsHealth[j] || "") + "\t" +
      (cardsCharacter[j] || "") + "\t" +
      (cardsHobby[j] || "") + "\t" +
      (cardsAdditional[j] || "") + "\t" +
      (cardsLuggage[j] || "") + "\t" +
      (cardsPhobia[j] || "") + "\t" +
      (cardsAction[j] || "") + "\n"
    );

    j++;
  }

  fs.writeFile(filename, text);
}
