import { Injector, common, plugins, util, webpack } from "replugged";

import { Message } from "discord-types/general";
import { AnyFunction, PluginExports } from "replugged/dist/types";
import { cfg } from "./settings";
import { Store } from "replugged/dist/renderer/modules/common/flux";
const { sleep } = util;
const { channels } = common;

const injector = new Injector();

enum DiscordNotificationSetting {
  ALL,
  ONLY_MENTIONS,
  NONE,
  INHERIT,
}

interface UserGuildSettingsStore extends Store {
  getChannelMessageNotifications(guildID: string, chanID: string): DiscordNotificationSetting;
}

function matchedVCToText(channelId: string): boolean {
  const vcId = channels.getVoiceChannelId();
  const rules = cfg.get("rules");

  if (!vcId) return false;
  if (!rules) return false;

  const textChannels = rules.find((x) => x.vcs.includes(vcId))?.texts;

  if (textChannels?.includes(channelId)) {
    return true;
  }

  return false;
}

function patchWithNoCutecord() {
  // mod getNotifyMessagesInSelectedChannel
  const mod = webpack.getBySource<Record<string, AnyFunction>>(
    "GROUP_DM&&e.type===P.uaV.RECIPIENT_REMOVE",
  );
  if (!mod) throw new Error("Module not found!");
  const key = webpack.getFunctionKeyBySource(mod, "GROUP_DM&&e.type===P.uaV.RECIPIENT_REMOVE");
  if (!key) throw new Error("Key not found!");

  injector.instead<typeof mod, string, [Message, string, boolean], boolean>(
    mod,
    key,
    (args, orig) => {
      const [msg, channelId, focused] = args;

      if (matchedVCToText(channelId)) return true;

      return orig(...args);
    },
  );
}

function patchWithCutecord() {
  const store = webpack.getByStoreName<UserGuildSettingsStore>("UserGuildSettingsStore");
  if (!store) throw new Error("Store not found!");

  injector.instead(store, "getChannelMessageNotifications", (args, orig, self) => {
    const [guildId, channelId] = args;

    if (matchedVCToText(channelId)) return DiscordNotificationSetting.ALL;

    return orig.bind(self)(...args);
  });
}

export function start() {
  // We can do this, since every plugin is loaded before start functions are ran
  const cutecordEnabled =
    plugins.plugins.has("eu.shadygoat.cutecord") &&
    !plugins.getDisabled().includes("eu.shadygoat.cutecord");

  if (cutecordEnabled) {
    patchWithCutecord();
  } else {
    patchWithNoCutecord();
  }
}

export function stop() {
  injector.uninjectAll();
}

export { Settings, cfg } from "./settings";
