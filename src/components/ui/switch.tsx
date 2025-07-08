import { Switch, SwitchProps } from "react-native";
import { useColorScheme } from "~/lib/utils/useColorScheme";
import { cn } from "~/lib/utils/cn";

interface CustomSwitchProps extends SwitchProps {}

const CustomSwitch = ({ className, ...props }: CustomSwitchProps) => {
  const { colorScheme } = useColorScheme();

  return (
    <Switch
      trackColor={{
        false: colorScheme === "dark" ? "#3F3F46" : "#E4E4E7", // Neutral-400 or Zinc-200
        true: colorScheme === "dark" ? "#6D28D9" : "#7C3AED", // Violet-700 or Violet-500
      }}
      thumbColor={colorScheme === "dark" ? "#FAFAFA" : "#FFFFFF"} // Neutral-50 or White
      ios_backgroundColor={colorScheme === "dark" ? "#3F3F46" : "#E4E4E7"}
      className={cn("w-12 h-6 rounded-full", className)}
      {...props}
    />
  );
};

export { CustomSwitch as Switch };
