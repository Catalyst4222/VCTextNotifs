import { common, plugins, util } from "replugged";

import { Message } from "discord-types/general";
import { PluginExports } from "replugged/dist/types";
import { cfg } from "./settings";
const { sleep } = util;
const { channels } = common;

enum ShouldNotify {
  DONT_NOTIFY,
  MUST_NOTIFY,
  CONTINUE,
}
type ReCutecordExports = PluginExports & {
  notificationChecks: Array<[string, (msg: Message) => ShouldNotify]>;
};

function matchVCToText(msg: Message): ShouldNotify {
  const vcId = channels.getVoiceChannelId();
  const rules = cfg.get("rules");

  if (!vcId) return ShouldNotify.CONTINUE;
  if (!rules) return ShouldNotify.CONTINUE;

  const textChannels = rules.find((x) => x.vcs.includes(vcId))?.texts;

  if (textChannels?.includes(msg.channel_id)) {
    return ShouldNotify.MUST_NOTIFY;
  }

  return ShouldNotify.CONTINUE;
}

function checkForCutecord(): boolean {
  if (!plugins.plugins.has("eu.shadygoat.cutecord")) {
    return false;
  }
  if (plugins.getDisabled().includes("eu.shadygoat.cutecord")) {
    return false;
  }

  const exports = plugins.plugins.get("eu.shadygoat.cutecord")!.exports as
    | ReCutecordExports
    | undefined;
  // eslint-disable-next-line no-undefined
  if (exports === undefined || !exports.notificationChecks) {
    return false;
  }
  return true;
}

export async function start() {
  let cutecordInstalled = false;
  for (let i = 1; i < 6; i++) {
    await sleep(i * 50);
    if (checkForCutecord()) {
      cutecordInstalled = true;
    }
  }

  if (!cutecordInstalled) {
    throw new Error("Unable to access ReCutecord!");
  }

  const exports = plugins.plugins.get("eu.shadygoat.cutecord")!.exports! as ReCutecordExports;

  const { notificationChecks } = exports;

  notificationChecks.push(["VCTextNotifs", matchVCToText]);
}

export function stop() {
  if (plugins.plugins.has("eu.shadygoat.cutecord")) {
    // if it doesn't exist, no need to do anything

    const exports = plugins.plugins.get("eu.shadygoat.cutecord")!.exports! as ReCutecordExports;
    if (!exports.notificationChecks) return;

    const targets = exports.notificationChecks.filter((item) => item[0] === "VCTextNotifs");

    targets.forEach((item) => {
      const index = exports.notificationChecks.indexOf(item);
      exports.notificationChecks.splice(index, 1);
    });
  }
}

export { Settings, cfg } from "./settings";
