import { Pages } from "@/entities/Pages";

const modules = import.meta.glob<{ default: React.ComponentType<any> }>(
  "@/components/tablePress/*.tsx"
);

const registry = new Map<string, React.ComponentType<any>>();
const loading = new Map<string, Promise<any>>();

const capitalizeFirstLetter = (str: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

function getComponentName(shortcode: string, lang: string) {
  const suffix = `_${lang}`;

  if (shortcode.endsWith(suffix)) {
    shortcode = shortcode.slice(0, -suffix.length);
  }

  return capitalizeFirstLetter(shortcode);
}

export async function registerPageComponents(page: Pages) {
  const tasks: Promise<any>[] = [];

  for (const item of page.contents ?? []) {
    const componentName = getComponentName(item.shortcode, page.lang);

    if (registry.has(componentName)) continue;

    if (loading.has(componentName)) {
      tasks.push(loading.get(componentName)!);
      continue;
    }

    const path = `/src/components/tablePress/${componentName}.tsx`;

    const loader = modules[path];

    if (!loader) {
      console.warn("[Registry] Missing component:", componentName);
      continue;
    }

    const promise = loader().then((m) => {
      registry.set(componentName, m.default);
      loading.delete(componentName);
    });

    loading.set(componentName, promise);

    tasks.push(promise);
  }

  await Promise.all(tasks);
}

export function getRegisteredComponent(
  shortcode: string,
  lang: string
): React.ComponentType<any> | null {
  return registry.get(getComponentName(shortcode, lang)) ?? null;
}

export function isPageRegistered(page: Pages) {
  return (page.contents ?? []).every((item) => {
    const name = getComponentName(item.shortcode, page.lang);
    return registry.has(name);
  });
}