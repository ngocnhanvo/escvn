import dynamicIconImports from "lucide-react/dynamicIconImports";
import React from 'react';

const cache = new Map();

export async function preloadIcons(names: string[]) {
    await Promise.all(
        names.map(async (name) => {
            if (cache.has(name)) return;

            const importer = dynamicIconImports[name];
            if (!importer) return;

            const mod = await importer();

            cache.set(name, mod.default);
        })
    );
}

export function getIcon(name: string) {
    return cache.get(name);
}

const normalizeIconName = (name: string) =>
  name
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();


interface DynamicIconProps
  extends React.ComponentPropsWithoutRef<"svg"> {
  name: string;
  size?: number | string;
  fallback?: React.ReactNode;
}

export const DynamicIcon = React.memo(function DynamicIcon({
    name,
    fallback = null,
    ...props
}: DynamicIconProps) {

    const Icon = getIcon(normalizeIconName(name));

    if (!Icon) return null;

    return <Icon {...props}/>
});