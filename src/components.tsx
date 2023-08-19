import { common, components, webpack } from "replugged";

const { TextInput, Text, Flex } = components;
const { React } = common;
const { FormDivider } = webpack.getByProps<{
  FormDivider: React.FC<{ style: React.CSSProperties }>;
}>("FormDivider")!;

export function Separator() {
  return <FormDivider style={{ marginTop: 20, marginBottom: 20 }} />;
}

export function Option({
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
