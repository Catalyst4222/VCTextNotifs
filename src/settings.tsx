import { common, components, settings } from "replugged";
import { Option } from "./components";

const { Button, Text, SelectItem, Divider } = components;
const { React } = common;

type Rule = { name: string; vcs: string[]; texts: string[] };

function getDefaultRule(): Rule {
  return { name: "Default group", vcs: [], texts: [] };
}

export const cfg = await settings.init<{ rules: Rule[] }, "rules">("dev.catalyst.VCTextNotifs", {
  rules: [getDefaultRule()],
});

export function Settings(): React.ReactElement {
  const rules = cfg.get("rules");

  if (rules.length === 0) {
    rules.push(getDefaultRule());
  }

  const [selected, setSelected] = React.useState(rules[0]);

  const [name, setName] = React.useState(selected.name);
  const [vcs, setVcs] = React.useState(selected.vcs.join(", "));
  const [texts, setTexts] = React.useState(selected.texts.join(", "));

  function setRuleByName(newName: string) {
    const newRule = rules.find((rule) => rule.name === newName)!;
    setName(newRule.name);
    setVcs(newRule.vcs.join(", "));
    setTexts(newRule.texts.join(", "));

    setSelected(newRule);
  }

  return (
    <>
      <Text variant="heading-md/semibold" selectable style={{ marginBottom: 10 }}>
        Group
      </Text>
      <SelectItem
        onChange={(value) => setRuleByName(value)}
        value={selected.name}
        options={rules.map((rule) => {
          return { label: rule.name, value: rule.name };
        })}
        style={{ marginBottom: 0 }}></SelectItem>

      <Option
        title="Name"
        subtitle="The name of the group"
        value={name}
        onChange={(value) => {
          setName(value);
          selected.name = value;
        }}></Option>

      <Option
        title="Voice Channel Ids"
        subtitle="The ids of the voice channels to activate notifications, separated by commas"
        value={vcs}
        onChange={(value) => {
          setVcs(value);
          selected.vcs = vcs.split(",").map((id) => id.trim());
        }}></Option>

      <Option
        title="Text Channel Ids"
        subtitle="The ids of the text channels to notify for, separated by commas"
        value={texts}
        onChange={(value) => {
          setTexts(value);
          selected.texts = texts.split(",").map((id) => id.trim());
        }}></Option>

      <Divider />

      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button
          color={Button.Colors.BRAND}
          onClick={() => {
            const newRule = getDefaultRule();
            rules.push(newRule);
            setRuleByName(newRule.name);
          }}>
          New Rule
        </Button>

        <Button
          color={Button.Colors.GREEN}
          style={{ marginLeft: 20, marginRight: 20 }}
          onClick={() => {
            // Workaround for saving, since the settings page just edits in-place
            cfg.set("rules", cfg.get("rules"));
          }}>
          Save Settings
        </Button>

        <Button
          color={Button.Colors.RED}
          onClick={() => {
            const idx = rules.findIndex((value) => value.name === selected.name);
            rules.splice(idx, 1);
            if (rules.length === 0) {
              const newRule = getDefaultRule();
              rules.push(newRule);
            }
            setRuleByName(rules[0].name);
          }}>
          Delete Rule
        </Button>
      </div>

      {/** todo delete a rule, add a new rule */}
    </>
  );
}
