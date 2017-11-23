import { OpaqueToken } from "ng-metadata/core";

export const STORY = new OpaqueToken("story");

export type Data = {
    component: any;
    props: object;
    propsMeta: object;
}