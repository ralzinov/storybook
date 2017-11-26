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
                @Inject('$rootScope') private $rootScope: ng.IRootScopeService,
                @Inject('$compile') private $compile: ng.ICompileService) {
    }

    ngAfterViewInit(): void {
        this.putInMyHtml();
    }

    ngOnDestroy(): void {
        this.target.empty();
    }

    putInMyHtml(): void {
        this.target.empty();
        const {component, props = {}} = this.data;

        const $scope = this.$rootScope.$new();
        const ctrlName = getInjectableName(component);
        const selector = kebabCase(ctrlName);

        let attrs = '';
        const propsNames = Object.keys(props);
        for (let i = 0; i < propsNames.length; i++) {
            const propName = propsNames[i];
            const val = (<any>props)[propName];

            if (!!(val && val.constructor && val.call && val.apply)) {
                attrs += `(${kebabCase(propName)})="props.${propName}($event)"`
            } else {
                attrs += `[${kebabCase(propName)}]="props.${propName}"`
            }
        }

        const host = angular.element(`<${selector} ${attrs}></${selector}>`);
        $scope.props = props;
        this.target.append(host);
        this.$compile(this.target.contents())($scope)
    }
}
