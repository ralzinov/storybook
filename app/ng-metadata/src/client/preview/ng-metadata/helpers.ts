import * as angular from 'angular';
import {bundle, NgModule} from 'ng-metadata/core';
import {NoPreviewComponent} from './components/no-preview.component';
import {ErrorComponent} from './components/error.component';
import {AppComponent} from './components/app.component';
import {STORY} from './app.token';

type  IGetStoryWithContext = (context: object) => any;

interface INgAppOpts {
    ngRequires: string[];
}

// Taken from https://davidwalsh.name/javascript-debounce-function
// We don't want to pull underscore

const debounce = (
    func: (story: any, context: object, reRender: boolean, opts: INgAppOpts) => void,
    wait = 100,
    immediate = false
): () => void => {
    let timeout: number;
    return function () {
        const context = this;
        const args = arguments;
        const later = function () {
            timeout = null;
            if (!immediate) {
                func.apply(context, args)
            }
        };

        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
            func.apply(context, args);
        }
    };
};

export const kebabCase = (name: string): string => {
    return name.replace(/[A-Z]/g, (letter, pos) => {
        return (pos ? '-' : '') + letter.toLowerCase();
    });
};

const getModule = (
    declarations: Array<Function|Function[]>,
    entryComponents: Array<any[]>,
    bootstrap: any,
    data: {[p: string]: any}
): any => {
    @NgModule({
        declarations: [...declarations],
        providers: [{ provide: STORY, useValue: Object.assign({}, data) }],
        entryComponents: [...entryComponents],
        bootstrap: [...bootstrap]
    })
    class Module {}
    return Module;
};

const initModule = (currentStory: IGetStoryWithContext, context: object): any => {
    const story = currentStory(context);
    const AnnotatedComponent = story.component || story.props.initialContent.component;
    return getModule(
        [AppComponent, AnnotatedComponent],
        [AnnotatedComponent],
        [AppComponent],
        story
    );
};

const draw = (newModule: any, ngRequires: string[] = []): void => {
    let app = document.body.querySelector('my-app');
    if (app) {
        app.remove();
    }

    app = document.createElement('my-app');
    document.body.appendChild(app);
    angular.element(app).ready(() => {
        const angular1Module = bundle(newModule);
        const angular1ModuleName = angular1Module.name;
        return angular.bootstrap(app, [ angular1ModuleName, ...ngRequires ], {
            strictDi: false
        });
    });
};

export const renderNgError = debounce((error: Error) => {
    const errorData = {
        component: <any>null,
        props: {
            message: error.message,
            stack: error.stack
        },
        propsMeta: {}
    };

    const Module = getModule([ErrorComponent], [], [ErrorComponent], errorData);
    draw(Module);
});

export const renderNoPreview = debounce(() => {
    const Module = getModule(
        [NoPreviewComponent],
        [],
        [NoPreviewComponent],
        {}
    );
    draw(Module);
});

export const renderNgApp = debounce((
    story: IGetStoryWithContext,
    context: object,
    reRender: boolean,
    opts: INgAppOpts
) => {
    draw(initModule(story, context), opts.ngRequires);
});
