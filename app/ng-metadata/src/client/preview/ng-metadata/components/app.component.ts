import * as angular from 'angular';
import {
    getInjectableName,
    Component,
    Inject,
    AfterViewInit,
    ViewChild,
    OnDestroy
} from 'ng-metadata/core';
import {kebabCase} from '../helpers';
import {STORY, Data} from '../app.token';

@Component({
    selector: 'my-app',
    template: '<ng-template></ng-template>'
})
export class AppComponent implements AfterViewInit, OnDestroy {
    @ViewChild('ng-template') target: any;

    constructor(@Inject(STORY) private data: Data,
                @Inject('$rootScope') private $rootScope: any,
                @Inject('$compile') private $compile: any) {
    }

    ngAfterViewInit() {
        this.putInMyHtml();
    }

    ngOnDestroy() {
        this.target.empty();
    }

    putInMyHtml() {
        this.target.empty();
        const {component, props = {}} = this.data;

        const $scope = this.$rootScope.$new();
        let ctrlName = getInjectableName(component);
        let selector = kebabCase(ctrlName);

        let attrs = '';
        let propsNames = Object.keys(props);
        for (let i = 0; i < propsNames.length; i++) {
            let propName = propsNames[i];
            let val = props[propName];

            if (!!(val && val.constructor && val.call && val.apply)) {
                attrs += `(${kebabCase(propName)})="props.${propName}($event)"`
            } else {
                attrs += `[${kebabCase(propName)}]="props.${propName}"`
            }
        }

        let host = angular.element(`<${selector} ${attrs}></${selector}>`);
        $scope.props = props;
        this.target.append(host);
        this.$compile(this.target.contents())($scope)
    }
}