import * as angular from 'angular';
import {bundle, NgModule} from 'ng-metadata/core';
import {NoPreviewComponent} from './components/no-preview.component';
import {ErrorComponent} from './components/error.component';
import {AppComponent} from './components/app.component';
import {STORY} from './app.token';

const debounce = (func, wait = 100, immediate = false) => {
    let timeout;
    return function () {
        let context = this, args = arguments;
        let later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

const getModule = (declarations, entryComponents, bootstrap, data) => {
    @NgModule({
        declarations: [...declarations],
        providers: [{ provide: STORY, useValue: Object.assign({}, data) }],
        entryComponents: [...entryComponents],
        bootstrap: [...bootstrap]
    })
    class Module {}
    return Module;
};

const initModule = (currentStory, context) => {
    const story = currentStory(context);
    const AnnotatedComponent = story.component;
    return getModule(
        [AppComponent, AnnotatedComponent],
        [AnnotatedComponent],
        [AppComponent],
        story
    );
};

const draw = (newModule) => {
    let app = document.body.querySelector('my-app');
    if (app) {
        app.remove();
    }

    app = document.createElement('my-app');
    document.body.appendChild(app);
    angular.element(app).ready(() => {
        const angular1Module = bundle(newModule);
        const angular1ModuleName = angular1Module.name;
        return angular.bootstrap(app, [ angular1ModuleName ], {
            strictDi: false
        });
    });
};

export const kebabCase = (name: string) => {
    return name.replace(/[A-Z]/g, function(letter, pos) {
        return (pos ? '-' : '') + letter.toLowerCase();
    });
};

export const renderNgError = debounce((error) => {
    const errorData = {
        component: null,
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

export const renderNgApp = debounce((story, context) => {
    draw(initModule(story, context));
});