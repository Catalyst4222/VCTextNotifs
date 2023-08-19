import { plugins, util, webpack } from "replugged";

import { Message } from "discord-types/general";
import { PluginExports } from "replugged/dist/types";
import { Store } from "replugged/dist/renderer/modules/common/flux";
import { cfg } from "./settings";
const { sleep } = util;

enum ShouldNotify {
  DONT_NOTIFY,
  MUST_NOTIFY,
  CONTINUE,
}
type ReCutecordExports = PluginExports & {
  notificationChecks: Array<[string, (msg: Message) => ShouldNotify]>;
};

type VideoBackgroundStoreType = {
  __getLocalVars(): { currentVoiceChannelId: string | null };
} & Store;
const VideoBackgroundStore =
  webpack.getByStoreName<VideoBackgroundStoreType>("VideoBackgroundStore")!;

function getActiveVCId(): string | null {
  return VideoBackgroundStore.__getLocalVars().currentVoiceChannelId;
}

function matchVCToText(msg: Message): ShouldNotify {
  const vcId = getActiveVCId();
  const rules = cfg.get("rules");

  if (!vcId) return ShouldNotify.CONTINUE;
  if (!rules) return ShouldNotify.CONTINUE;

  const textChannels = rules.find((x) => x.vcs.includes(vcId))?.texts;

  if (textChannels?.includes(msg.channel_id)) {
    return ShouldNotify.MUST_NOTIFY;
  }

  return ShouldNotify.CONTINUE;
}

export async function start() {
  await sleep(100);

  if (!plugins.plugins.has("eu.shadygoat.cutecord")) {
    throw new Error("ReCutecord is not installed!");
  }
  if (plugins.getDisabled().includes("eu.shadygoat.cutecord")) {
    throw new Error("ReCutecord is disabled!");
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
