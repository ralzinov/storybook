interface IStory {
    component: any;
    props: {[p: string]: any};
}

type IGetStory = () => IStory;

interface IStoryBookAPI {
    add: (storyName: string, getStory: IGetStory) => IStoryBookAPI;
    addDecorator(decorator: (storyFn: () => IStory, context: IStoryBookContext) => any): IStoryBookAPI;
}

interface IStoryBookContext {
    kind: string;
    story: string;
}

declare module '@storybook/ng-metadata' {
    export function storiesOf(name: string, module: NodeModule): IStoryBookAPI;
    export function setAddon(addon: {[p: string]: any}): IStoryBookAPI;
    export function addDecorator(decorator: (storyFn: () => IStory, context: IStoryBookContext) => any): IStoryBookAPI;
    export function configure(loaders: () => any, module: NodeModule): void;
    export function getStorybook(): { kind: string, stories: {name: string, render: () => any}[] }[];
}

declare module '@storybook/ng-metadata/demo' {
    export const Welcome: any;
    export const Button: any;
}
