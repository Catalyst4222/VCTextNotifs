import { settings, common, util, components, webpack } from "replugged";
import { AnyFunction } from "replugged/dist/types";

const { Button, TextInput, Text, Flex, Select, SelectItem } = components;
const { React } = common;
const { FormDivider } = webpack.getByProps<{
  FormDivider: React.FC<{ style: React.CSSProperties }>;
}>("FormDivider")!;

const { Combobox } = webpack.getByProps<{
  Combobox: React.FC;
}>("Combobox")!;

type Rule = { name: string; vcs: string[]; texts: string[] };
const fakeDefaults = {
  rules: [
    {
      name: "Group",
      vcs: ["909199971713159229"],
      texts: ["911827099386519593", "240195284695646209"],
    },
  ],
} as { rules: Array<Rule> };

export const cfg = await settings.init<{ rules: Rule[] }, "rules">("dev.catalyst.VCTextNotif", {
  rules: [],
});

function Separator() {
  return <FormDivider style={{ margin: 20, marginLeft: 0 }} />;
}

function Option({
  title,
  subtitle,
  value,
  onChange,
}: {
  title: string;
  subtitle: string;
  value: string | number | readonly string[] | undefined;
  onChange: (value: string) => void | undefined;
}) {
  return (
    <Flex direction={Flex.Direction.VERTICAL}>
      <Text variant="heading-md/semibold" selectable style={{ marginTop: 20 }}>
        {title}
      </Text>
      <Text variant="heading-sm/normal" selectable style={{ marginTop: 10 }}>
        {subtitle}
      </Text>
      <TextInput value={value} onChange={onChange} style={{ marginTop: 10 }}></TextInput>
    </Flex>
  );
}

// export class Settings extends React.Component {
//   render() {
//     const rules = cfg.get("rules") || [];
//     console.log(rules);

//     const groups = rules.map(getDisplayFromRule);

//     console.log("pls");
//     console.log(groups);

//     return (
//       <>
//         {...groups}
        // <div style={{ display: "flex", justifyContent: "center" }}>
        //   <Button onClick={addNewGroup}>Add new group</Button>
        // </div>
//       </>
//     );
//   }
// }

export function Settings(): React.ReactElement {
  const rules = cfg.get("rules");

  const [selected, setSelected] = React.useState(rules[0]);

  const [name, setName] = React.useState(selected.name);
  const [vcs, setVcs] = React.useState(selected.vcs.join(", "));
  const [texts, setTexts] = React.useState(selected.texts.join(", "));

  console.log("que");

  return (
    <>
      <Text variant="heading-md/semibold" selectable style={{ marginBottom: 10 }}>
        Group
      </Text>
      <SelectItem
        onChange={(value) => {
          // fill in with new info
          const newRule = rules.find((rule) => rule.name == value)!;
          setName(newRule.name);
          setVcs(newRule.vcs.join(", "));
          setTexts(newRule.texts.join(", "));

          setSelected(newRule);
        }}
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

      <Separator />

      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button color={Button.Colors.GREEN}
          onClick={() => {
            // Workaround for saving, since the settings just edit in-place
            cfg.set("rules", cfg.get("rules"))
          }}
        >Save</Button>
      </div>

      {/** todo delete a rule, add a new rule */}
    </>
  );
}
