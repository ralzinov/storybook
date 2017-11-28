import { OpaqueToken } from "ng-metadata/core";

export const STORY = new OpaqueToken("story");

export type Data = {
    component: any;
    props: {[p :string]: any};
    propsMeta: object;
}